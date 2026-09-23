using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class InmueblesEndpoints
{
    private const string EstadoArrendado = Negocio.EstadoArrendado;

    public static void MapInmueblesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/inmuebles").WithTags("Inmuebles");

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
            int? etapa,
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
                    EtapaNombre = i.IdEtapaNavigation != null ? i.IdEtapaNavigation.Nombre : null,
                    EstadoDescripcion = i.IdEstadoNavigation.Descripcion,
                    TipoLocalDescripcion = i.IdTipoLocalNavigation.Descripcion,
                    ArrendatarioNombre = contrato != null && contrato.NitArrendatarioNavigation != null
                        ? contrato.NitArrendatarioNavigation.Nombre
                        : null
                };

            if (proyecto.HasValue)
                baseQuery = baseQuery.Where(x => x.Inmueble.IdProyecto == proyecto.Value);

            // etapa = 0 filtra los inmuebles sin etapa asignada.
            if (etapa == 0)
                baseQuery = baseQuery.Where(x => x.Inmueble.IdEtapa == null);
            else if (etapa.HasValue)
                baseQuery = baseQuery.Where(x => x.Inmueble.IdEtapa == etapa.Value);

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
            var limiteVencimiento = hoy.AddDays(Negocio.DiasAlertaVencimiento);
            var porVencer = await baseQuery.CountAsync(x =>
                x.Contrato != null &&
                x.Contrato.ProximoVencimiento != null &&
                x.Contrato.ProximoVencimiento >= hoy &&
                x.Contrato.ProximoVencimiento <= limiteVencimiento);
            var ocupacionPct = total == 0 ? 0 : Math.Round(arrendados * 100m / total, 1);

            // Conteos por estado para los chips (sobre el filtro actual menos el de estado).
            var estadosQuery =
                from i in db.Inmuebles
                select new { i.IdProyecto, i.IdEtapa, Estado = i.IdEstadoNavigation.Descripcion };
            if (proyecto.HasValue)
                estadosQuery = estadosQuery.Where(x => x.IdProyecto == proyecto.Value);
            if (etapa == 0)
                estadosQuery = estadosQuery.Where(x => x.IdEtapa == null);
            else if (etapa.HasValue)
                estadosQuery = estadosQuery.Where(x => x.IdEtapa == etapa.Value);
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
                ("rental", "asc") => baseQuery.OrderBy(x => x.Contrato!.RentalRate),
                ("rental", "desc") => baseQuery.OrderByDescending(x => x.Contrato!.RentalRate),
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
                    x.EtapaNombre,
                    x.ArrendatarioNombre,
                    x.Inmueble.AreaPiso1,
                    x.Contrato != null ? x.Contrato.CanonActualMensual : null,
                    x.Contrato != null ? x.Contrato.RentalRate : null,
                    x.Contrato != null ? x.Contrato.ProximoVencimiento : null,
                    x.EstadoDescripcion,
                    x.Contrato != null &&
                        x.Contrato.ProximoVencimiento != null &&
                        x.Contrato.ProximoVencimiento < hoy
                ))
                .ToListAsync();

            var response = new InmueblesResponseDto(
                new PagedResult<InmuebleListItemDto>(items, pagina, tamano, total),
                new InmueblesKpisDto(canonTotal, areaTotal, ocupacionPct, porVencer),
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

        // Etapas del proyecto con indicadores por etapa (mismo calculo de canon que /api/resumen).
        // Si el proyecto maneja etapas y tiene inmuebles sin etapa, se agregan como grupo Id = 0.
        group.MapGet("/proyectos/{id:int}/etapas", async (int id, ApplicationDbContext db) =>
        {
            var proyecto = await db.Proyectos
                .Where(p => p.Id == id)
                .Select(p => new { p.Id, p.Nombre })
                .FirstOrDefaultAsync();
            if (proyecto is null)
                return Results.NotFound(new { message = "El proyecto no existe." });

            // Se agrupa en memoria: SQL Server no admite un agregado sobre la subconsulta del canon
            // y un proyecto tiene a lo sumo unos cientos de inmuebles.
            var filas = await db.Inmuebles
                .Where(i => i.IdProyecto == id)
                .Select(i => new
                {
                    i.IdEtapa,
                    Arrendado = i.IdEstadoNavigation.Descripcion == EstadoArrendado,
                    Canon = i.ContratosArrendamientos.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m
                })
                .ToListAsync();
            var grupos = filas
                .GroupBy(f => f.IdEtapa)
                .Select(g => new
                {
                    IdEtapa = g.Key,
                    Inmuebles = g.Count(),
                    Arrendados = g.Count(f => f.Arrendado),
                    Canon = g.Sum(f => f.Canon)
                })
                .ToList();

            var etapasCatalogo = await db.Etapas
                .Where(e => e.IdProyecto == id)
                .OrderBy(e => e.Nombre)
                .Select(e => new { e.Id, e.Nombre })
                .ToListAsync();

            EtapaResumenDto Tarjeta(int etapaId, string nombre)
            {
                var g = grupos.FirstOrDefault(x => (x.IdEtapa ?? 0) == etapaId);
                var inmuebles = g?.Inmuebles ?? 0;
                var arrendados = g?.Arrendados ?? 0;
                return new EtapaResumenDto(
                    etapaId, nombre, inmuebles, arrendados,
                    inmuebles == 0 ? 0m : Math.Round(arrendados * 100m / inmuebles, 1),
                    g?.Canon ?? 0m);
            }

            var etapas = etapasCatalogo.Select(e => Tarjeta(e.Id, e.Nombre)).ToList();
            if (etapas.Count > 0 && grupos.Any(x => x.IdEtapa is null))
                etapas.Add(Tarjeta(0, "Sin etapa asignada"));

            return Results.Ok(new ProyectoEtapasDto(proyecto.Id, proyecto.Nombre, etapas));
        })
        .WithName("GetEtapasProyecto");

        group.MapPost("/proyectos", async (CrearProyectoDto request, ApplicationDbContext db) =>
        {
            var nombre = request.Nombre?.Trim();
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return Results.BadRequest(new { message = "El nombre del proyecto es obligatorio." });
            }

            if (nombre.Length > 200)
            {
                return Results.BadRequest(new { message = "El nombre del proyecto no puede superar 200 caracteres." });
            }

            var existe = await db.Proyectos.AnyAsync(p => p.Nombre == nombre);
            if (existe)
            {
                return Results.Conflict(new { message = "Ya existe un proyecto con ese nombre." });
            }

            var proyecto = new Proyecto { Nombre = nombre };
            db.Proyectos.Add(proyecto);
            await db.SaveChangesAsync();

            return Results.Ok(new ProyectoDto(proyecto.Id, proyecto.Nombre));
        })
        .WithName("CrearProyecto");
    }
}
