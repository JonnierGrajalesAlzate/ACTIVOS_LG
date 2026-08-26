using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class InmueblesEndpoints
{
    // El estado del inmueble lo manda el catalogo `estado` (dato de negocio),
    // no se deduce de las fechas del contrato: un contrato vencido significa
    // renovacion pendiente, no que el local este vacante.
    private const string EstadoArrendado = "Arrendado";

    public static void MapInmueblesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/inmuebles").WithTags("Inmuebles");

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
            string? estado,
            string? q,
            string orden = "proyecto",
            string dir = "asc",
            int pagina = 1,
            int tamano = 10) =>
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

            // Contrato vigente = el mas reciente por fecha, exista o no vencimiento futuro.
            var baseQuery =
                from i in db.Inmuebles
                let contrato = i.ContratosArrendamientos
                    .OrderByDescending(c => c.FechaContrato)
                    .FirstOrDefault()
                select new
                {
                    Inmueble = i,
                    Contrato = contrato,
                    ProyectoNombre = i.IdProyectoNavigation.Nombre,
                    EstadoDescripcion = i.IdEstadoNavigation.Descripcion,
                    TipoLocalDescripcion = i.IdTipoLocalNavigation.Descripcion,
                    ArrendatarioNombre = contrato != null && contrato.NitArrendatarioNavigation != null
                        ? contrato.NitArrendatarioNavigation.Nombre
                        : null
                };

            if (proyecto.HasValue)
                baseQuery = baseQuery.Where(x => x.Inmueble.IdProyecto == proyecto.Value);

            if (!string.IsNullOrWhiteSpace(estado))
                baseQuery = baseQuery.Where(x => x.EstadoDescripcion == estado);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x =>
                    EF.Functions.Like(x.ProyectoNombre, term) ||
                    EF.Functions.Like(x.Inmueble.NumeroLocal ?? "", term) ||
                    EF.Functions.Like(x.Inmueble.MatriculaInmobiliaria ?? "", term) ||
                    (x.ArrendatarioNombre != null && EF.Functions.Like(x.ArrendatarioNombre, term)));
            }

            var total = await baseQuery.CountAsync();
            var areaTotal = await baseQuery.SumAsync(x => (decimal?)x.Inmueble.AreaPiso1) ?? 0m;
            var arrendados = await baseQuery.CountAsync(x => x.EstadoDescripcion == EstadoArrendado);
            var canonTotal = await baseQuery
                .Where(x => x.EstadoDescripcion == EstadoArrendado && x.Contrato != null)
                .SumAsync(x => (decimal?)x.Contrato!.CanonActualMensual) ?? 0m;
            var vencen90 = await baseQuery.CountAsync(x =>
                x.Contrato != null &&
                x.Contrato.ProximoVencimiento != null &&
                x.Contrato.ProximoVencimiento >= hoy &&
                x.Contrato.ProximoVencimiento <= hoy.AddDays(90));
            var vencidos = await baseQuery.CountAsync(x =>
                x.EstadoDescripcion == EstadoArrendado &&
                x.Contrato != null &&
                x.Contrato.ProximoVencimiento != null &&
                x.Contrato.ProximoVencimiento < hoy);
            var ocupacionPct = total == 0 ? 0 : Math.Round(arrendados * 100m / total, 1);

            // Conteos por estado para los chips (sobre el filtro actual menos el de estado).
            var estadosQuery =
                from i in db.Inmuebles
                select new { i.IdProyecto, Estado = i.IdEstadoNavigation.Descripcion };
            if (proyecto.HasValue)
                estadosQuery = estadosQuery.Where(x => x.IdProyecto == proyecto.Value);
            // El GroupBy se proyecta a un tipo anonimo: EF Core no traduce la
            // construccion posicional de un record dentro del Select sobre el grupo.
            var estadosAgrupados = await estadosQuery
                .GroupBy(x => x.Estado)
                .Select(g => new { Estado = g.Key, Conteo = g.Count() })
                .ToListAsync();
            var estados = estadosAgrupados
                .OrderByDescending(e => e.Conteo)
                .Select(e => new EstadoConteoDto(e.Estado, e.Conteo))
                .ToList();

            dir = dir.Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
            baseQuery = (orden.ToLowerInvariant(), dir) switch
            {
                ("area", "asc") => baseQuery.OrderBy(x => x.Inmueble.AreaPiso1),
                ("area", "desc") => baseQuery.OrderByDescending(x => x.Inmueble.AreaPiso1),
                ("canon", "asc") => baseQuery.OrderBy(x => x.Contrato!.CanonActualMensual),
                ("canon", "desc") => baseQuery.OrderByDescending(x => x.Contrato!.CanonActualMensual),
                ("vence", "asc") => baseQuery.OrderBy(x => x.Contrato!.ProximoVencimiento),
                ("vence", "desc") => baseQuery.OrderByDescending(x => x.Contrato!.ProximoVencimiento),
                ("estado", "asc") => baseQuery.OrderBy(x => x.EstadoDescripcion),
                ("estado", "desc") => baseQuery.OrderByDescending(x => x.EstadoDescripcion),
                (_, "desc") => baseQuery.OrderByDescending(x => x.ProyectoNombre).ThenByDescending(x => x.Inmueble.NumeroLocal),
                _ => baseQuery.OrderBy(x => x.ProyectoNombre).ThenBy(x => x.Inmueble.NumeroLocal)
            };

            pagina = pagina < 1 ? 1 : pagina;
            tamano = tamano is < 1 or > 100 ? 10 : tamano;

            var items = await baseQuery
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .Select(x => new InmuebleListItemDto(
                    x.Inmueble.Id,
                    (x.TipoLocalDescripcion + " " + x.Inmueble.NumeroLocal).Trim(),
                    x.ProyectoNombre,
                    x.ArrendatarioNombre,
                    x.Inmueble.AreaPiso1,
                    x.Contrato != null ? x.Contrato.CanonActualMensual : null,
                    x.Contrato != null ? x.Contrato.ProximoVencimiento : null,
                    x.EstadoDescripcion,
                    x.Contrato != null &&
                        x.Contrato.ProximoVencimiento != null &&
                        x.Contrato.ProximoVencimiento < hoy
                ))
                .ToListAsync();

            var response = new InmueblesResponseDto(
                new PagedResult<InmuebleListItemDto>(items, pagina, tamano, total),
                new InmueblesKpisDto(canonTotal, areaTotal, ocupacionPct, vencen90, vencidos),
                estados);

            return Results.Ok(response);
        })
        .WithName("GetInmuebles");

        group.MapGet("/proyectos", async (ApplicationDbContext db) =>
        {
            var proyectos = await db.Proyectos
                .OrderBy(p => p.Nombre)
                .Select(p => new { p.Id, p.Nombre })
                .ToListAsync();
            return Results.Ok(proyectos);
        })
        .WithName("GetInmueblesProyectosFiltro");
    }
}
