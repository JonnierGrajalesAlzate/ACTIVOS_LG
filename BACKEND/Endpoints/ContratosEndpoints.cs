using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ContratosEndpoints
{
    public static void MapContratosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/contratos").WithTags("Contratos");

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
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
                    x.Id, x.Inmueble, x.Proyecto, x.Arrendatario, x.Arrendador, x.Marca,
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

            return Results.Ok(new AplicarIncrementoResultDto(contrato.Id, canonAnterior, canonNuevo, contrato.ProximoIncremento));
        })
        .WithName("AplicarIncrementoContrato");
    }
}
