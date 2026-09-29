using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class EgresosEndpoints
{
    public static void MapEgresosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/egresos").WithTags("Egresos").CambiosSoloGestores();

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
            string? q,
            string orden = "total",
            string dir = "desc",
            int pagina = 1,
            int tamano = 10) =>
        {
            var baseQuery =
                from e in db.EgresosMensuales
                let inm = e.IdInmuebleNavigation
                select new
                {
                    Egreso = e,
                    IdInmueble = inm.Id,
                    IdProyecto = inm.IdProyecto,
                    Inmueble = (inm.IdTipoLocalNavigation.Descripcion + " " + inm.NumeroLocal).Trim(),
                    Proyecto = inm.IdProyectoNavigation.Nombre,
                    Estado = inm.IdEstadoNavigation.Descripcion
                };

            if (proyecto.HasValue)
                baseQuery = baseQuery.Where(x => x.IdProyecto == proyecto.Value);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x =>
                    EF.Functions.Like(x.Proyecto, term) || EF.Functions.Like(x.Inmueble, term));
            }

            var total = await baseQuery.CountAsync();
            var totalEgresos = await baseQuery.SumAsync(x => (decimal?)x.Egreso.TotalEgresos) ?? 0m;
            var totalEbitda = await baseQuery.SumAsync(x => (decimal?)x.Egreso.Ebitda) ?? 0m;
            var predialTotal = await baseQuery.SumAsync(x => (decimal?)x.Egreso.PredialMensual) ?? 0m;
            var enPerdida = await baseQuery.CountAsync(x => x.Egreso.Ebitda < 0);

            dir = dir.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
            baseQuery = (orden.ToLowerInvariant(), dir) switch
            {
                ("inmueble", "asc") => baseQuery.OrderBy(x => x.Proyecto).ThenBy(x => x.Inmueble),
                ("inmueble", "desc") => baseQuery.OrderByDescending(x => x.Proyecto).ThenByDescending(x => x.Inmueble),
                ("predial", "asc") => baseQuery.OrderBy(x => x.Egreso.PredialMensual),
                ("predial", "desc") => baseQuery.OrderByDescending(x => x.Egreso.PredialMensual),
                ("ebitda", "asc") => baseQuery.OrderBy(x => x.Egreso.Ebitda),
                ("ebitda", "desc") => baseQuery.OrderByDescending(x => x.Egreso.Ebitda),
                ("caprate", "asc") => baseQuery.OrderBy(x => x.Egreso.RentabilidadCapRate),
                ("caprate", "desc") => baseQuery.OrderByDescending(x => x.Egreso.RentabilidadCapRate),
                (_, "asc") => baseQuery.OrderBy(x => x.Egreso.TotalEgresos),
                _ => baseQuery.OrderByDescending(x => x.Egreso.TotalEgresos)
            };

            pagina = pagina < 1 ? 1 : pagina;
            tamano = tamano is < 1 or > 100 ? 10 : tamano;

            var items = await baseQuery
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .Select(x => new EgresoListItemDto(
                    x.Egreso.Id,
                    x.IdInmueble,
                    x.Inmueble,
                    x.Proyecto,
                    x.Estado,
                    x.Egreso.PredialMensual,
                    x.Egreso.SeguroArriendo,
                    x.Egreso.ComisionAdministracionInmobiliaria,
                    x.Egreso.CamVacante,
                    x.Egreso.ComisionFiduciaria,
                    x.Egreso.MantenimientoMenor,
                    x.Egreso.TotalEgresos,
                    x.Egreso.Ebitda,
                    x.Egreso.RentabilidadCapRate
                ))
                .ToListAsync();

            return Results.Ok(new EgresosResponseDto(
                new PagedResult<EgresoListItemDto>(items, pagina, tamano, total),
                new EgresosKpisDto(totalEgresos, totalEbitda, predialTotal, enPerdida)));
        })
        .WithName("GetEgresos");

        group.MapGet("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var e = await db.EgresosMensuales.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (e is null)
                return Results.NotFound(new { message = "El egreso no existe." });

            var idProyecto = await db.Inmuebles.Where(i => i.Id == e.IdInmueble).Select(i => i.IdProyecto).FirstAsync();
            return Results.Ok(new EgresoDetalleDto(
                idProyecto,
                new CrearEgresoDto(
                    e.IdInmueble, e.NumeroContratoServicio, e.PredialMensual, e.SeguroArriendo,
                    e.ComisionAdministracionInmobiliaria, e.CamVacante, e.GravamenMovimientosFinancieros,
                    e.ComisionFiduciaria, e.ReembolsosTerceros, e.MantenimientoMenor)));
        })
        .WithName("GetEgreso");

        group.MapPost("/", async (CrearEgresoDto request, ApplicationDbContext db) =>
        {
            var egreso = new EgresosMensuale();
            if (await AplicarEgreso(request, egreso, db) is { } error)
                return error;

            db.EgresosMensuales.Add(egreso);
            await db.SaveChangesAsync();

            return Results.Ok(new EgresoCreadoDto(egreso.Id, egreso.TotalEgresos ?? 0m, egreso.Ebitda, egreso.RentabilidadCapRate));
        })
        .WithName("CrearEgreso");

        group.MapPut("/{id:int}", async (int id, CrearEgresoDto request, ApplicationDbContext db) =>
        {
            var egreso = await db.EgresosMensuales.FirstOrDefaultAsync(x => x.Id == id);
            if (egreso is null)
                return Results.NotFound(new { message = "El egreso no existe." });
            if (await AplicarEgreso(request, egreso, db) is { } error)
                return error;

            await db.SaveChangesAsync();
            return Results.Ok(new EgresoCreadoDto(egreso.Id, egreso.TotalEgresos ?? 0m, egreso.Ebitda, egreso.RentabilidadCapRate));
        })
        .WithName("ActualizarEgreso");

        group.MapDelete("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var egreso = await db.EgresosMensuales.FirstOrDefaultAsync(x => x.Id == id);
            if (egreso is null)
                return Results.NotFound(new { message = "El egreso no existe." });

            db.EgresosMensuales.Remove(egreso);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarEgreso");
    }

    /// <summary>Canon del contrato mas reciente y valor comercial: las bases del EBITDA y el cap rate.</summary>
    private static Task<BaseRentabilidad?> BaseAsync(ApplicationDbContext db, int idInmueble) =>
        db.Inmuebles
            .Where(i => i.Id == idInmueble)
            .Select(i => new BaseRentabilidad(
                i.ContratosArrendamientos
                    .OrderByDescending(c => c.FechaContrato)
                    .Select(c => c.CanonActualMensual)
                    .FirstOrDefault(),
                i.ValorComercial))
            .FirstOrDefaultAsync();

    private record BaseRentabilidad(decimal? Canon, decimal? ValorComercial);

    private static void AsignarRentabilidad(EgresosMensuale egreso, BaseRentabilidad baseRent)
    {
        // Sin contrato el inmueble no genera ingreso: el EBITDA es el egreso en negativo.
        egreso.Ebitda = (baseRent.Canon ?? 0m) - (egreso.TotalEgresos ?? 0m);
        egreso.RentabilidadCapRate = Negocio.Dividir(egreso.Ebitda, baseRent.ValorComercial, 4);
    }

    /// <summary>
    /// Recalcula EBITDA y cap rate del perfil de egresos de un inmueble cuando cambia su canon
    /// (alta, edicion o baja de contrato, incremento IPC) o su valor comercial. Conserva el total.
    /// </summary>
    public static async Task RecalcularAsync(ApplicationDbContext db, int idInmueble)
    {
        var egresos = await db.EgresosMensuales.Where(e => e.IdInmueble == idInmueble).ToListAsync();
        if (egresos.Count == 0)
            return;

        var baseRent = await BaseAsync(db, idInmueble);
        if (baseRent is null)
            return;

        foreach (var egreso in egresos)
            AsignarRentabilidad(egreso, baseRent);
        await db.SaveChangesAsync();
    }

    private static async Task<IResult?> AplicarEgreso(CrearEgresoDto request, EgresosMensuale egreso, ApplicationDbContext db)
    {
        var numeroServicio = Validacion.Texto(request.NumeroContratoServicio);
        if (Validacion.ExcedeLargo(("El numero de contrato de servicio", numeroServicio, 50)) is { } largo)
            return Validacion.Error(largo);

        decimal?[] conceptos =
        [
            request.PredialMensual, request.SeguroArriendo, request.ComisionAdministracionInmobiliaria,
            request.CamVacante, request.GravamenMovimientosFinancieros, request.ComisionFiduciaria,
            request.ReembolsosTerceros, request.MantenimientoMenor
        ];
        if (conceptos.Any(c => c is < 0))
            return Validacion.Error("Los egresos no pueden ser negativos.");
        if (conceptos.All(c => c is null))
            return Validacion.Error("Registra al menos un concepto de egreso.");

        var baseRent = await BaseAsync(db, request.IdInmueble);
        if (baseRent is null)
            return Validacion.Error("El inmueble no existe.");
        // egresos_mensuales es el perfil vigente del inmueble, no una serie: uno por inmueble.
        if (await db.EgresosMensuales.AnyAsync(e => e.IdInmueble == request.IdInmueble && e.Id != egreso.Id))
            return Results.Conflict(new { message = "El inmueble ya tiene un perfil de egresos registrado." });

        if (numeroServicio is not null && !await db.ServiciosPublicos.AnyAsync(s => s.NumeroContrato == numeroServicio))
            db.ServiciosPublicos.Add(new ServiciosPublico { NumeroContrato = numeroServicio, Precio = 0 });

        egreso.IdInmueble = request.IdInmueble;
        egreso.NumeroContratoServicio = numeroServicio;
        egreso.PredialMensual = request.PredialMensual;
        egreso.SeguroArriendo = request.SeguroArriendo;
        egreso.ComisionAdministracionInmobiliaria = request.ComisionAdministracionInmobiliaria;
        egreso.CamVacante = request.CamVacante;
        egreso.GravamenMovimientosFinancieros = request.GravamenMovimientosFinancieros;
        egreso.ComisionFiduciaria = request.ComisionFiduciaria;
        egreso.ReembolsosTerceros = request.ReembolsosTerceros;
        egreso.MantenimientoMenor = request.MantenimientoMenor;
        egreso.TotalEgresos = Negocio.TotalEgresos(conceptos);
        AsignarRentabilidad(egreso, baseRent);
        return null;
    }
}
