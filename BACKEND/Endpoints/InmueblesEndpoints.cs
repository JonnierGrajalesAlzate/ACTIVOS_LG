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
        var group = app.MapGroup("/api/inmuebles").WithTags("Inmuebles").CambiosSoloGestores();

        group.MapGet("/", async (
            ApplicationDbContext db,
            int? proyecto,
            int? etapa,
            string? estado,
            string? leasing,
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
                    TipoInmuebleDescripcion = i.IdTipoInmuebleNavigation.Descripcion,
                    TieneLeasing = i.Leasings.Any(),
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

            // leasing = "si" / "no": inmuebles con o sin registro en la tabla leasing.
            baseQuery = leasing?.ToLowerInvariant() switch
            {
                "si" => baseQuery.Where(x => x.TieneLeasing),
                "no" => baseQuery.Where(x => !x.TieneLeasing),
                _ => baseQuery
            };

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
                select new { i.IdProyecto, i.IdEtapa, Estado = i.IdEstadoNavigation.Descripcion, TieneLeasing = i.Leasings.Any() };
            if (proyecto.HasValue)
                estadosQuery = estadosQuery.Where(x => x.IdProyecto == proyecto.Value);
            if (etapa == 0)
                estadosQuery = estadosQuery.Where(x => x.IdEtapa == null);
            else if (etapa.HasValue)
                estadosQuery = estadosQuery.Where(x => x.IdEtapa == etapa.Value);
            estadosQuery = leasing?.ToLowerInvariant() switch
            {
                "si" => estadosQuery.Where(x => x.TieneLeasing),
                "no" => estadosQuery.Where(x => !x.TieneLeasing),
                _ => estadosQuery
            };
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
                ("local", "asc") => baseQuery.OrderBy(x => x.Inmueble.NumeroLocal),
                ("local", "desc") => baseQuery.OrderByDescending(x => x.Inmueble.NumeroLocal),
                ("nivel", "asc") => baseQuery.OrderBy(x => x.Inmueble.Nivel).ThenBy(x => x.Inmueble.NumeroLocal),
                ("nivel", "desc") => baseQuery.OrderByDescending(x => x.Inmueble.Nivel).ThenBy(x => x.Inmueble.NumeroLocal),
                ("tipologia", "asc") => baseQuery.OrderBy(x => x.TipoInmuebleDescripcion).ThenBy(x => x.Inmueble.NumeroLocal),
                ("tipologia", "desc") => baseQuery.OrderByDescending(x => x.TipoInmuebleDescripcion).ThenBy(x => x.Inmueble.NumeroLocal),
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
                    x.Inmueble.NumeroLocal,
                    x.Inmueble.Nivel,
                    x.TipoInmuebleDescripcion,
                    x.TipoLocalDescripcion,
                    x.TieneLeasing,
                    x.Inmueble.Observaciones,
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
            var proyecto = new Proyecto();
            if (await AplicarProyecto(request, proyecto, db) is { } error)
                return error;

            db.Proyectos.Add(proyecto);
            await db.SaveChangesAsync();

            return Results.Ok(new ProyectoDto(proyecto.Id, proyecto.Nombre));
        })
        .WithName("CrearProyecto")
        .SoloAdmin();

        group.MapPut("/proyectos/{id:int}", async (int id, CrearProyectoDto request, ApplicationDbContext db) =>
        {
            var proyecto = await db.Proyectos.FirstOrDefaultAsync(p => p.Id == id);
            if (proyecto is null)
                return Results.NotFound(new { message = "El proyecto no existe." });
            if (await AplicarProyecto(request, proyecto, db) is { } error)
                return error;

            await db.SaveChangesAsync();
            return Results.Ok(new ProyectoDto(proyecto.Id, proyecto.Nombre));
        })
        .WithName("ActualizarProyecto")
        .SoloAdmin();

        group.MapDelete("/proyectos/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var proyecto = await db.Proyectos.Include(p => p.Etapas).FirstOrDefaultAsync(p => p.Id == id);
            if (proyecto is null)
                return Results.NotFound(new { message = "El proyecto no existe." });

            var inmuebles = await db.Inmuebles.CountAsync(i => i.IdProyecto == id);
            if (inmuebles > 0)
                return Results.Conflict(new { message = $"No se puede eliminar: el proyecto tiene {inmuebles} inmueble(s). Eliminalos o muevelos primero." });

            // Sin inmuebles, las etapas del proyecto ya no agrupan nada y se borran con el.
            db.Etapas.RemoveRange(proyecto.Etapas);
            db.Proyectos.Remove(proyecto);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarProyecto")
        .SoloAdmin();

        group.MapPost("/proyectos/{id:int}/etapas", async (int id, CrearEtapaDto request, ApplicationDbContext db) =>
        {
            if (!await db.Proyectos.AnyAsync(p => p.Id == id))
                return Results.NotFound(new { message = "El proyecto no existe." });

            var etapa = new Etapa { IdProyecto = id };
            if (await AplicarEtapa(request, etapa, db) is { } error)
                return error;

            db.Etapas.Add(etapa);
            await db.SaveChangesAsync();
            return Results.Ok(new EtapaDto(etapa.Id, etapa.IdProyecto, etapa.Nombre));
        })
        .WithName("CrearEtapa")
        .SoloAdmin();

        group.MapPut("/etapas/{id:int}", async (int id, CrearEtapaDto request, ApplicationDbContext db) =>
        {
            var etapa = await db.Etapas.FirstOrDefaultAsync(e => e.Id == id);
            if (etapa is null)
                return Results.NotFound(new { message = "La etapa no existe." });
            if (await AplicarEtapa(request, etapa, db) is { } error)
                return error;

            await db.SaveChangesAsync();
            return Results.Ok(new EtapaDto(etapa.Id, etapa.IdProyecto, etapa.Nombre));
        })
        .WithName("ActualizarEtapa")
        .SoloAdmin();

        group.MapDelete("/etapas/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var etapa = await db.Etapas.FirstOrDefaultAsync(e => e.Id == id);
            if (etapa is null)
                return Results.NotFound(new { message = "La etapa no existe." });

            var inmuebles = await db.Inmuebles.CountAsync(i => i.IdEtapa == id);
            if (inmuebles > 0)
                return Results.Conflict(new { message = $"No se puede eliminar: la etapa tiene {inmuebles} inmueble(s). Asignalos a otra etapa primero." });

            db.Etapas.Remove(etapa);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarEtapa")
        .SoloAdmin();

        // Todos los contratos que ha tenido el inmueble, del mas reciente al mas antiguo,
        // con los incrementos de canon aplicados a cada uno.
        group.MapGet("/{id:int}/historial", async (int id, ApplicationDbContext db) =>
        {
            var inmueble = await db.Inmuebles
                .Where(i => i.Id == id)
                .Select(i => new
                {
                    Nombre = (i.IdTipoLocalNavigation.Descripcion + " " + i.NumeroLocal).Trim(),
                    Proyecto = i.IdProyectoNavigation.Nombre
                })
                .FirstOrDefaultAsync();
            if (inmueble is null)
                return Results.NotFound(new { message = "El inmueble no existe." });

            var contratos = await db.ContratosArrendamientos
                .Where(c => c.IdInmueble == id)
                .OrderByDescending(c => c.FechaContrato)
                .Select(c => new
                {
                    c.Id,
                    Arrendatario = c.NitArrendatarioNavigation != null ? c.NitArrendatarioNavigation.Nombre : null,
                    c.NitArrendatario,
                    Marca = c.IdMarcaNavigation != null ? c.IdMarcaNavigation.Nombre : null,
                    c.FechaContrato,
                    c.PlazoAnios,
                    c.ProximoVencimiento,
                    c.CanonActualMensual,
                    c.Observaciones
                })
                .ToListAsync();

            var idsContratos = contratos.Select(c => c.Id).ToList();
            var incrementos = await db.HistorialIncrementosCanon
                .Where(h => idsContratos.Contains(h.IdContrato))
                .OrderByDescending(h => h.FechaIncremento)
                .Select(h => new { h.IdContrato, Dto = new IncrementoCanonDto(h.FechaIncremento, h.CanonAnterior, h.CanonNuevo, h.Ipc, h.PuntosAdicionales, h.AplicadoPor) })
                .ToListAsync();

            // El contrato vigente es el mas reciente por fecha, igual que en el listado de inmuebles.
            var items = contratos.Select((c, indice) => new HistorialContratoDto(
                c.Id, c.Arrendatario, c.NitArrendatario, c.Marca, c.FechaContrato, c.PlazoAnios, c.ProximoVencimiento,
                c.CanonActualMensual, c.Observaciones, indice == 0,
                incrementos.Where(h => h.IdContrato == c.Id).Select(h => h.Dto).ToList())).ToList();

            return Results.Ok(new HistorialInmuebleDto(id, inmueble.Nombre, inmueble.Proyecto, items));
        })
        .WithName("GetHistorialInmueble");

        group.MapGet("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var i = await db.Inmuebles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (i is null)
                return Results.NotFound(new { message = "El inmueble no existe." });

            // Mismo contrato que el alta, con los porcentajes de vuelta en porcentaje.
            return Results.Ok(new CrearInmuebleDto(
                i.IdProyecto, i.IdEtapa, i.IdEstado, i.IdDestinacion, i.IdTipoLocal, i.IdTipoInmueble,
                i.MatriculaInmobiliaria, i.NumeroLocal, i.Nivel, i.Mesanine, i.Pisos,
                i.AreaPiso1, i.AreaLibrePriv, i.Coeficiente, i.ValorComercial, i.ValorM2Construido,
                i.AvaluoCatastral, Negocio.FraccionAPorcentaje(i.TarifaCatastro), i.PredialAnual,
                i.ValorM2Admon, i.Observaciones, i.NitPropietario));
        })
        .WithName("GetInmueble");

        group.MapPost("/", async (CrearInmuebleDto request, ApplicationDbContext db) =>
        {
            var inmueble = new Inmueble();
            if (await AplicarInmueble(request, inmueble, db) is { } error)
                return error;

            db.Inmuebles.Add(inmueble);
            await db.SaveChangesAsync();

            var tipoLocal = await db.TipoLocals.Where(x => x.Id == inmueble.IdTipoLocal).Select(x => x.Descripcion).FirstAsync();
            return Results.Ok(new InmuebleCreadoDto(inmueble.Id, $"{tipoLocal} {inmueble.NumeroLocal}".Trim()));
        })
        .WithName("CrearInmueble");

        group.MapPut("/{id:int}", async (int id, CrearInmuebleDto request, ApplicationDbContext db) =>
        {
            var inmueble = await db.Inmuebles.FirstOrDefaultAsync(x => x.Id == id);
            if (inmueble is null)
                return Results.NotFound(new { message = "El inmueble no existe." });
            if (await AplicarInmueble(request, inmueble, db) is { } error)
                return error;

            await db.SaveChangesAsync();
            // El cap rate del perfil de egresos depende del valor comercial.
            await EgresosEndpoints.RecalcularAsync(db, id);

            var tipoLocal = await db.TipoLocals.Where(x => x.Id == inmueble.IdTipoLocal).Select(x => x.Descripcion).FirstAsync();
            return Results.Ok(new InmuebleCreadoDto(inmueble.Id, $"{tipoLocal} {inmueble.NumeroLocal}".Trim()));
        })
        .WithName("ActualizarInmueble");

        group.MapDelete("/{id:int}", async (int id, ApplicationDbContext db) =>
        {
            var inmueble = await db.Inmuebles.FirstOrDefaultAsync(x => x.Id == id);
            if (inmueble is null)
                return Results.NotFound(new { message = "El inmueble no existe." });

            var contratos = await db.ContratosArrendamientos.CountAsync(c => c.IdInmueble == id);
            var leasings = await db.Leasings.CountAsync(l => l.IdInmueble == id);
            var administracion = await db.Administracions.CountAsync(a => a.IdInmueble == id);
            if (contratos + leasings + administracion > 0)
            {
                var partes = new List<string>();
                if (contratos > 0) partes.Add($"{contratos} contrato(s)");
                if (leasings > 0) partes.Add($"{leasings} leasing(s)");
                if (administracion > 0) partes.Add($"{administracion} registro(s) de administracion");
                return Results.Conflict(new { message = $"No se puede eliminar: el inmueble tiene {string.Join(", ", partes)}." });
            }

            // El perfil de egresos es un atributo del inmueble: se elimina con el.
            db.EgresosMensuales.RemoveRange(db.EgresosMensuales.Where(e => e.IdInmueble == id));
            db.Inmuebles.Remove(inmueble);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarInmueble");
    }

    private static async Task<IResult?> AplicarProyecto(CrearProyectoDto request, Proyecto proyecto, ApplicationDbContext db)
    {
        var nombre = Validacion.Texto(request.Nombre);
        if (nombre is null)
            return Validacion.Error("El nombre del proyecto es obligatorio.");
        if (Validacion.ExcedeLargo(("El nombre del proyecto", nombre, 200)) is { } largo)
            return Validacion.Error(largo);
        if (await db.Proyectos.AnyAsync(p => p.Nombre == nombre && p.Id != proyecto.Id))
            return Results.Conflict(new { message = "Ya existe un proyecto con ese nombre." });

        proyecto.Nombre = nombre;
        return null;
    }

    private static async Task<IResult?> AplicarEtapa(CrearEtapaDto request, Etapa etapa, ApplicationDbContext db)
    {
        var nombre = Validacion.Texto(request.Nombre);
        if (nombre is null)
            return Validacion.Error("El nombre de la etapa es obligatorio.");
        if (Validacion.ExcedeLargo(("El nombre de la etapa", nombre, 100)) is { } largo)
            return Validacion.Error(largo);
        if (await db.Etapas.AnyAsync(e => e.IdProyecto == etapa.IdProyecto && e.Nombre == nombre && e.Id != etapa.Id))
            return Results.Conflict(new { message = "El proyecto ya tiene una etapa con ese nombre." });

        etapa.Nombre = nombre;
        return null;
    }

    /// <summary>Valida el DTO y lo copia sobre la entidad (nueva o existente). Devuelve el error, o null.</summary>
    private static async Task<IResult?> AplicarInmueble(CrearInmuebleDto request, Inmueble inmueble, ApplicationDbContext db)
    {
        var matricula = Validacion.Texto(request.MatriculaInmobiliaria);
        var numeroLocal = Validacion.Texto(request.NumeroLocal);
        var nivel = Validacion.Texto(request.Nivel);

        if (numeroLocal is null)
            return Validacion.Error("El numero de local es obligatorio.");
        if (Validacion.ExcedeLargo(
                ("La matricula", matricula, 50),
                ("El numero de local", numeroLocal, 100),
                ("El nivel", nivel, 10)) is { } largo)
            return Validacion.Error(largo);
        if (request.AreaPiso1 is <= 0)
            return Validacion.Error("El area debe ser mayor que cero.");
        if (request.ValorComercial is < 0 || request.AvaluoCatastral is < 0 || request.PredialAnual is < 0)
            return Validacion.Error("Los valores monetarios no pueden ser negativos.");
        if (request.Pisos is < 0)
            return Validacion.Error("El numero de pisos no puede ser negativo.");

        if (!await db.Proyectos.AnyAsync(x => x.Id == request.IdProyecto))
            return Validacion.Error("El proyecto no existe.");
        if (request.IdEtapa is { } idEtapa &&
            !await db.Etapas.AnyAsync(x => x.Id == idEtapa && x.IdProyecto == request.IdProyecto))
            return Validacion.Error("La etapa no pertenece al proyecto.");
        if (!await db.Estados.AnyAsync(x => x.Id == request.IdEstado))
            return Validacion.Error("El estado no existe.");
        if (!await db.Destinacions.AnyAsync(x => x.Id == request.IdDestinacion))
            return Validacion.Error("La destinacion no existe.");
        if (!await db.TipoLocals.AnyAsync(x => x.Id == request.IdTipoLocal))
            return Validacion.Error("El uso no existe.");
        if (!await db.TipoInmuebles.AnyAsync(x => x.Id == request.IdTipoInmueble))
            return Validacion.Error("El tipo de inmueble no existe.");
        var nitPropietario = Validacion.Texto(request.NitPropietario);
        if (nitPropietario is not null && !await db.Arrendadors.AnyAsync(a => a.Nit == nitPropietario))
            return Validacion.Error("El propietario no existe.");

        // Misma llave con la que 005_carga_inmuebles_excel.sql identifica un inmueble existente.
        if (await db.Inmuebles.AnyAsync(x => x.Id != inmueble.Id &&
                                             x.IdProyecto == request.IdProyecto &&
                                             x.NumeroLocal == numeroLocal &&
                                             x.MatriculaInmobiliaria == matricula))
            return Results.Conflict(new { message = "Ya existe un inmueble con ese numero de local y matricula en el proyecto." });

        var tarifa = Negocio.PorcentajeAFraccion(request.TarifaCatastro);
        inmueble.IdProyecto = request.IdProyecto;
        inmueble.IdEtapa = request.IdEtapa;
        inmueble.IdEstado = request.IdEstado;
        inmueble.IdDestinacion = request.IdDestinacion;
        inmueble.IdTipoLocal = request.IdTipoLocal;
        inmueble.IdTipoInmueble = request.IdTipoInmueble;
        inmueble.NitPropietario = nitPropietario;
        inmueble.MatriculaInmobiliaria = matricula;
        inmueble.NumeroLocal = numeroLocal;
        inmueble.Nivel = nivel;
        inmueble.Mesanine = request.Mesanine ?? false;
        inmueble.Pisos = request.Pisos;
        inmueble.AreaPiso1 = request.AreaPiso1;
        inmueble.AreaLibrePriv = request.AreaLibrePriv;
        inmueble.Coeficiente = request.Coeficiente;
        inmueble.ValorComercial = request.ValorComercial;
        // Los derivados se recalculan siempre que haya con que (asi no quedan desactualizados al editar);
        // el valor digitado solo se usa cuando faltan los datos de la formula.
        inmueble.ValorM2Construido = Negocio.Dividir(request.ValorComercial, request.AreaPiso1, 2) ?? request.ValorM2Construido;
        inmueble.AvaluoCatastral = request.AvaluoCatastral;
        inmueble.TarifaCatastro = tarifa;
        inmueble.PredialAnual = Negocio.PredialAnual(request.AvaluoCatastral, tarifa) ?? request.PredialAnual;
        inmueble.PorcentValorCatastral = Negocio.Dividir(request.AvaluoCatastral, request.ValorComercial, 4);
        inmueble.ValorM2Admon = request.ValorM2Admon;
        inmueble.Observaciones = Validacion.Texto(request.Observaciones);
        return null;
    }
}
