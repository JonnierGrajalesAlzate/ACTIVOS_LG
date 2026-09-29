using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ContratosEndpoints
{
    public static void MapContratosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/contratos").WithTags("Contratos").CambiosSoloGestores();

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
            string? arrendatario,
            string? gestion,
            string? q,
            string orden = "vence",
            string dir = "asc",
            int pagina = 1,
            int tamano = 10) =>
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var limiteVencimiento = hoy.AddDays(Negocio.DiasAlertaVencimiento);

            var baseQuery =
                from c in db.ContratosArrendamientos
                let inm = c.IdInmuebleNavigation
                select new
                {
                    Contrato = c,
                    IdProyecto = inm.IdProyecto,
                    Inmueble = (inm.IdTipoLocalNavigation.Descripcion + " " + inm.NumeroLocal).Trim(),
                    Proyecto = inm.IdProyectoNavigation.Nombre,
                    Arrendatario = c.NitArrendatarioNavigation != null ? c.NitArrendatarioNavigation.Nombre : null,
                    Arrendador = c.NitArrendadorNavigation != null ? c.NitArrendadorNavigation.Nombre : null,
                    Marca = c.IdMarcaNavigation != null ? c.IdMarcaNavigation.Nombre : null
                };

            if (proyecto.HasValue)
                baseQuery = baseQuery.Where(x => x.IdProyecto == proyecto.Value);

            // `arrendatario` es el NIT: la vista de contratos tambien hace de ficha del arrendatario.
            if (!string.IsNullOrWhiteSpace(arrendatario))
                baseQuery = baseQuery.Where(x => x.Contrato.NitArrendatario == arrendatario);

            // La base no guarda un estado de gestion de renovacion; se deriva de las fechas.
            baseQuery = gestion?.ToLowerInvariant() switch
            {
                "vencido" => baseQuery.Where(x => x.Contrato.ProximoVencimiento != null && x.Contrato.ProximoVencimiento < hoy),
                "por-vencer" => baseQuery.Where(x => x.Contrato.ProximoVencimiento != null &&
                                                     x.Contrato.ProximoVencimiento >= hoy &&
                                                     x.Contrato.ProximoVencimiento <= limiteVencimiento),
                "vigente" => baseQuery.Where(x => x.Contrato.ProximoVencimiento == null || x.Contrato.ProximoVencimiento > limiteVencimiento),
                _ => baseQuery
            };

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x =>
                    EF.Functions.Like(x.Proyecto, term) ||
                    EF.Functions.Like(x.Inmueble, term) ||
                    (x.Arrendatario != null && EF.Functions.Like(x.Arrendatario, term)) ||
                    (x.Marca != null && EF.Functions.Like(x.Marca, term)));
            }

            var total = await baseQuery.CountAsync();
            var canonTotal = await baseQuery.SumAsync(x => (decimal?)x.Contrato.CanonActualMensual) ?? 0m;
            var vencidos = await baseQuery.CountAsync(x => x.Contrato.ProximoVencimiento != null && x.Contrato.ProximoVencimiento < hoy);
            var porVencer = await baseQuery.CountAsync(x => x.Contrato.ProximoVencimiento != null &&
                                                            x.Contrato.ProximoVencimiento >= hoy &&
                                                            x.Contrato.ProximoVencimiento <= limiteVencimiento);

            dir = dir.Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
            baseQuery = (orden.ToLowerInvariant(), dir) switch
            {
                ("canon", "asc") => baseQuery.OrderBy(x => x.Contrato.CanonActualMensual),
                ("canon", "desc") => baseQuery.OrderByDescending(x => x.Contrato.CanonActualMensual),
                ("inmueble", "asc") => baseQuery.OrderBy(x => x.Proyecto).ThenBy(x => x.Inmueble),
                ("inmueble", "desc") => baseQuery.OrderByDescending(x => x.Proyecto).ThenByDescending(x => x.Inmueble),
                (_, "desc") => baseQuery.OrderByDescending(x => x.Contrato.ProximoVencimiento),
                _ => baseQuery.OrderBy(x => x.Contrato.ProximoVencimiento)
            };

            pagina = pagina < 1 ? 1 : pagina;
            tamano = tamano is < 1 or > 100 ? 10 : tamano;

            var raw = await baseQuery
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .Select(x => new
                {
                    x.Contrato.Id,
                    x.Inmueble,
                    x.Proyecto,
                    x.Arrendatario,
                    x.Contrato.NitArrendatario,
                    x.Arrendador,
                    x.Marca,
                    x.Contrato.CanonActualMensual,
                    x.Contrato.FechaContrato,
                    x.Contrato.ProximoVencimiento,
                    x.Contrato.ProximoIncremento,
                    x.Contrato.PlazoAnios,
                    x.Contrato.TipoIncrementoActual
                })
                .ToListAsync();

            // El calculo de dias y avance se hace en memoria sobre la pagina ya traida.
            var items = raw.Select(x =>
            {
                int? diasRestantes = x.ProximoVencimiento is { } vto ? vto.DayNumber - hoy.DayNumber : null;

                decimal? avance = null;
                if (x.FechaContrato is { } inicio && x.ProximoVencimiento is { } fin && fin.DayNumber > inicio.DayNumber)
                {
                    var transcurrido = hoy.DayNumber - inicio.DayNumber;
                    var duracion = fin.DayNumber - inicio.DayNumber;
                    avance = Math.Round(Math.Clamp(transcurrido * 100m / duracion, 0m, 100m), 1);
                }

                var gestionCalculada = diasRestantes switch
                {
                    null => "Sin vencimiento",
                    < 0 => "Vencido",
                    <= Negocio.DiasAlertaVencimiento => "Por vencer",
                    _ => "Vigente"
                };

                return new ContratoListItemDto(
                    x.Id, x.Inmueble, x.Proyecto, x.Arrendatario, x.NitArrendatario, x.Arrendador, x.Marca,
                    x.CanonActualMensual, x.FechaContrato, x.ProximoVencimiento, x.ProximoIncremento,
                    x.PlazoAnios, x.TipoIncrementoActual, diasRestantes, avance, gestionCalculada);
            }).ToList();

            var vigentes = total - vencidos;

            return Results.Ok(new ContratosResponseDto(
                new PagedResult<ContratoListItemDto>(items, pagina, tamano, total),
                new ContratosKpisDto(vigentes, porVencer, canonTotal)));
        })
        .WithName("GetContratos");

        // Aplica el incremento anual por IPC que la notificacion sugiere: actualiza el canon,
        // corre la fecha del proximo incremento un anio y deja el registro en el historial.
        group.MapPost("/{id:int}/aplicar-incremento", async (int id, ApplicationDbContext db, HttpContext http) =>
        {
            var contrato = await db.ContratosArrendamientos.FirstOrDefaultAsync(c => c.Id == id);
            if (contrato is null)
                return Results.NotFound(new { message = "El contrato no existe." });

            if (!Negocio.EsIncrementoIpc(contrato.TipoIncrementoActual))
                return Results.BadRequest(new { message = "El contrato no se incrementa por IPC." });

            if (contrato.CanonActualMensual is not { } canonAnterior || contrato.ProximoIncremento is not { } fechaIncremento)
                return Results.BadRequest(new { message = "El contrato no tiene canon o fecha de incremento registrados." });

            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            if (fechaIncremento > hoy.AddDays(Negocio.DiasAvisoIncremento))
                return Results.Conflict(new { message = "El incremento de este contrato todavia no esta proximo." });

            var ipc = await db.Parametros
                .Where(p => p.Clave == Negocio.ParametroIpc)
                .Select(p => p.Valor)
                .FirstOrDefaultAsync();
            if (ipc is null)
                return Results.Conflict(new { message = "Configura primero el IPC vigente." });

            var canonNuevo = Negocio.CanonConIncremento(canonAnterior, ipc.Value, contrato.PuntosAdicionalesIpc);

            db.HistorialIncrementosCanon.Add(new HistorialIncrementoCanon
            {
                IdContrato = contrato.Id,
                FechaIncremento = fechaIncremento,
                CanonAnterior = canonAnterior,
                CanonNuevo = canonNuevo,
                Ipc = ipc.Value,
                PuntosAdicionales = contrato.PuntosAdicionalesIpc,
                AplicadoPor = http.User.FindFirst("email")?.Value
            });
            contrato.CanonActualMensual = canonNuevo;
            contrato.ProximoIncremento = fechaIncremento.AddYears(1);
            await db.SaveChangesAsync();
            await EgresosEndpoints.RecalcularAsync(db, contrato.IdInmueble);

            return Results.Ok(new AplicarIncrementoResultDto(contrato.Id, canonAnterior, canonNuevo, contrato.ProximoIncremento));
        })
        .WithName("AplicarIncrementoContrato");

        group.MapGet("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var c = await db.ContratosArrendamientos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (c is null)
                return Results.NotFound(new { message = "El contrato no existe." });

            var idProyecto = await db.Inmuebles.Where(i => i.Id == c.IdInmueble).Select(i => i.IdProyecto).FirstAsync();
            // Mismo contrato que el alta, con los porcentajes de vuelta en porcentaje.
            return Results.Ok(new ContratoDetalleDto(idProyecto, new CrearContratoDto(
                c.IdInmueble, c.NitArrendador, c.NitArrendatario, c.IdMarca, c.IdSeguro,
                c.FechaContrato, c.PlazoAnios, c.VtoPrimeraVigencia, c.ProximoVencimiento, c.ProximoIncremento,
                c.CanonActualMensual, c.TipoCanon,
                Negocio.FraccionAPorcentaje(c.PorcentajeCanonVariable),
                Negocio.FraccionAPorcentaje(c.PorcentajeVentas),
                c.TipoIncrementoActual,
                Negocio.FraccionAPorcentaje(c.PuntosAdicionalesIpc),
                c.IncrementoAnual,
                c.AdmonIncrementaCanon?.Trim(),
                c.ValorReembolsoAdmon,
                c.ComisionEntidad?.Trim(),
                Negocio.FraccionAPorcentaje(c.PorcentajeComisionEntidad),
                Negocio.FraccionAPorcentaje(c.PorcentSeguro),
                c.Observaciones,
                MarcarArrendado: false)));
        })
        .WithName("GetContrato");

        group.MapPost("/", async (CrearContratoDto request, ApplicationDbContext db) =>
        {
            var contrato = new ContratosArrendamiento();
            if (await AplicarContrato(request, contrato, db) is { } error)
                return error;

            db.ContratosArrendamientos.Add(contrato);
            await MarcarArrendadoSiSePide(request, db);
            await db.SaveChangesAsync();
            await EgresosEndpoints.RecalcularAsync(db, contrato.IdInmueble);

            return Results.Ok(new ContratoCreadoDto(
                contrato.Id, contrato.ValorM2Canon, contrato.RentalRate, contrato.ProximoVencimiento, contrato.ProximoIncremento));
        })
        .WithName("CrearContrato");

        group.MapPut("/{id:int}", async (int id, CrearContratoDto request, ApplicationDbContext db) =>
        {
            var contrato = await db.ContratosArrendamientos.FirstOrDefaultAsync(c => c.Id == id);
            if (contrato is null)
                return Results.NotFound(new { message = "El contrato no existe." });

            var inmuebleAnterior = contrato.IdInmueble;
            if (await AplicarContrato(request, contrato, db) is { } error)
                return error;

            await MarcarArrendadoSiSePide(request, db);
            await db.SaveChangesAsync();
            await EgresosEndpoints.RecalcularAsync(db, contrato.IdInmueble);
            if (inmuebleAnterior != contrato.IdInmueble)
                await EgresosEndpoints.RecalcularAsync(db, inmuebleAnterior);

            return Results.Ok(new ContratoCreadoDto(
                contrato.Id, contrato.ValorM2Canon, contrato.RentalRate, contrato.ProximoVencimiento, contrato.ProximoIncremento));
        })
        .WithName("ActualizarContrato");

        group.MapDelete("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var contrato = await db.ContratosArrendamientos.FirstOrDefaultAsync(c => c.Id == id);
            if (contrato is null)
                return Results.NotFound(new { message = "El contrato no existe." });

            // El historial de incrementos solo tiene sentido con su contrato: se borra con el.
            db.HistorialIncrementosCanon.RemoveRange(db.HistorialIncrementosCanon.Where(h => h.IdContrato == id));
            db.ContratosArrendamientos.Remove(contrato);
            await db.SaveChangesAsync();
            await EgresosEndpoints.RecalcularAsync(db, contrato.IdInmueble);
            return Results.NoContent();
        })
        .WithName("EliminarContrato");
    }

    /// <summary>
    /// El estado del inmueble es un dato de negocio (ver Negocio.EstadoArrendado): solo se cambia
    /// si quien registra el contrato lo pide.
    /// </summary>
    private static async Task MarcarArrendadoSiSePide(CrearContratoDto request, ApplicationDbContext db)
    {
        if (!request.MarcarArrendado)
            return;

        var idArrendado = await db.Estados
            .Where(e => e.Descripcion == Negocio.EstadoArrendado)
            .Select(e => (int?)e.Id)
            .FirstOrDefaultAsync();
        if (idArrendado is { } idEstado)
        {
            var inmueble = await db.Inmuebles.FirstAsync(i => i.Id == request.IdInmueble);
            inmueble.IdEstado = idEstado;
        }
    }

    /// <summary>Valida el DTO y lo copia sobre la entidad (nueva o existente). Devuelve el error, o null.</summary>
    private static async Task<IResult?> AplicarContrato(CrearContratoDto request, ContratosArrendamiento contrato, ApplicationDbContext db)
    {
        var nitArrendador = Validacion.Texto(request.NitArrendador);
        var nitArrendatario = Validacion.Texto(request.NitArrendatario);
        var tipoCanon = Validacion.Texto(request.TipoCanon);
        var tipoIncremento = Validacion.Texto(request.TipoIncrementoActual);
        var incrementoAnual = Validacion.Texto(request.IncrementoAnual);
        var admonIncrementa = Validacion.Texto(request.AdmonIncrementaCanon)?.ToUpperInvariant();
        var comisionEntidad = Validacion.Texto(request.ComisionEntidad)?.ToUpperInvariant();

        if (Validacion.ExcedeLargo(
                ("El tipo de canon", tipoCanon, 50),
                ("El tipo de incremento", tipoIncremento, 50),
                ("El incremento anual", incrementoAnual, 100)) is { } largo)
            return Validacion.Error(largo);
        if (admonIncrementa is not (null or "S" or "N") || comisionEntidad is not (null or "S" or "N"))
            return Validacion.Error("Los campos Si/No solo admiten S o N.");
        if (request.CanonActualMensual is not { } canon || canon <= 0)
            return Validacion.Error("El canon mensual es obligatorio y debe ser mayor que cero.");
        if (request.PlazoAnios is <= 0)
            return Validacion.Error("El plazo debe ser de al menos un anio.");
        if (request.FechaContrato is { } f0 && request.VtoPrimeraVigencia is { } v0 && v0 <= f0)
            return Validacion.Error("El vencimiento de la primera vigencia debe ser posterior a la fecha del contrato.");

        var inmueble = await db.Inmuebles
            .Where(i => i.Id == request.IdInmueble)
            .Select(i => new { i.Id, i.AreaPiso1, i.ValorComercial })
            .FirstOrDefaultAsync();
        if (inmueble is null)
            return Validacion.Error("El inmueble no existe.");
        if (nitArrendador is not null && !await db.Arrendadors.AnyAsync(a => a.Nit == nitArrendador))
            return Validacion.Error("El propietario no existe.");
        if (nitArrendatario is not null && !await db.Arrendatarios.AnyAsync(a => a.Nit == nitArrendatario))
            return Validacion.Error("El arrendatario no existe.");
        if (request.IdMarca is { } idMarca && !await db.Marcas.AnyAsync(m => m.Id == idMarca))
            return Validacion.Error("La marca no existe.");
        if (request.IdSeguro is { } idSeguro && !await db.Seguros.AnyAsync(s => s.Id == idSeguro))
            return Validacion.Error("La aseguradora no existe.");

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var vtoPrimera = request.VtoPrimeraVigencia
            ?? (request.FechaContrato is { } fc && request.PlazoAnios is { } plazo
                ? fc.AddYears(plazo).AddDays(-1)
                : null);
        var proximoIncremento = request.ProximoIncremento;
        if (proximoIncremento is null && tipoIncremento is not null && request.FechaContrato is { } inicio)
        {
            var aniversario = inicio.AddYears(1);
            while (aniversario < hoy) aniversario = aniversario.AddYears(1);
            proximoIncremento = aniversario;
        }

        contrato.IdInmueble = inmueble.Id;
        contrato.NitArrendador = nitArrendador;
        contrato.NitArrendatario = nitArrendatario;
        contrato.IdMarca = request.IdMarca;
        contrato.IdSeguro = request.IdSeguro;
        contrato.FechaContrato = request.FechaContrato;
        contrato.PlazoAnios = request.PlazoAnios;
        contrato.VtoPrimeraVigencia = vtoPrimera;
        contrato.ProximoVencimiento = request.ProximoVencimiento ?? vtoPrimera;
        contrato.ProximoIncremento = proximoIncremento;
        contrato.CanonActualMensual = canon;
        contrato.ValorM2Canon = Negocio.Dividir(canon, inmueble.AreaPiso1, 2);
        contrato.RentalRate = Negocio.Dividir(canon, inmueble.ValorComercial, 4);
        contrato.TipoCanon = tipoCanon;
        contrato.PorcentajeCanonVariable = Negocio.PorcentajeAFraccion(request.PorcentajeCanonVariable);
        contrato.PorcentajeVentas = Negocio.PorcentajeAFraccion(request.PorcentajeVentas);
        contrato.TipoIncrementoActual = tipoIncremento;
        contrato.PuntosAdicionalesIpc = Negocio.PorcentajeAFraccion(request.PuntosAdicionalesIpc);
        contrato.IncrementoAnual = incrementoAnual;
        contrato.AdmonIncrementaCanon = admonIncrementa;
        contrato.ValorReembolsoAdmon = request.ValorReembolsoAdmon;
        contrato.ComisionEntidad = comisionEntidad;
        contrato.PorcentajeComisionEntidad = Negocio.PorcentajeAFraccion(request.PorcentajeComisionEntidad);
        contrato.PorcentSeguro = Negocio.PorcentajeAFraccion(request.PorcentSeguro);
        contrato.Observaciones = Validacion.Texto(request.Observaciones);
        return null;
    }
}
