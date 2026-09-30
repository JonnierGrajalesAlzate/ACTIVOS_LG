using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ArrendatariosEndpoints
{
    public static void MapArrendatariosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/arrendatarios").WithTags("Arrendatarios").CambiosSoloGestores();

        group.MapGet("/", async (
            ApplicationDbContext db,
            string? q,
            string orden = "canon",
            string dir = "desc",
            int pagina = 1,
            int tamano = 10) =>
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

            // No hay tablas de cartera ni de pagos: solo lo derivable del contrato.
            var baseQuery =
                from a in db.Arrendatarios
                let principal = a.ContratosArrendamientos
                    .OrderByDescending(c => c.CanonActualMensual)
                    .FirstOrDefault()
                select new
                {
                    a.Nit,
                    a.Nombre,
                    Inmuebles = a.ContratosArrendamientos.Select(c => c.IdInmueble).Distinct().Count(),
                    Canon = a.ContratosArrendamientos.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m,
                    PrincipalInmueble = principal != null
                        ? (principal.IdInmuebleNavigation.IdTipoLocalNavigation.Descripcion + " " +
                           principal.IdInmuebleNavigation.NumeroLocal).Trim()
                        : null,
                    PrincipalProyecto = principal != null
                        ? principal.IdInmuebleNavigation.IdProyectoNavigation.Nombre
                        : null,
                    ProximoVencimiento = a.ContratosArrendamientos
                        .Where(c => c.ProximoVencimiento != null)
                        .Min(c => c.ProximoVencimiento)
                };

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x => EF.Functions.Like(x.Nombre, term) || EF.Functions.Like(x.Nit, term));
            }

            var total = await baseQuery.CountAsync();
            var canonTotal = await baseQuery.SumAsync(x => (decimal?)x.Canon) ?? 0m;
            var limiteVencimiento = hoy.AddDays(Negocio.DiasAlertaVencimiento);
            var porVencer = await baseQuery.CountAsync(x =>
                x.ProximoVencimiento != null &&
                x.ProximoVencimiento >= hoy &&
                x.ProximoVencimiento <= limiteVencimiento);

            dir = dir.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
            baseQuery = (orden.ToLowerInvariant(), dir) switch
            {
                ("nombre", "asc") => baseQuery.OrderBy(x => x.Nombre),
                ("nombre", "desc") => baseQuery.OrderByDescending(x => x.Nombre),
                ("vence", "asc") => baseQuery.OrderBy(x => x.ProximoVencimiento),
                ("vence", "desc") => baseQuery.OrderByDescending(x => x.ProximoVencimiento),
                (_, "asc") => baseQuery.OrderBy(x => x.Canon),
                _ => baseQuery.OrderByDescending(x => x.Canon)
            };

            pagina = pagina < 1 ? 1 : pagina;
            tamano = tamano is < 1 or > 100 ? 10 : tamano;

            var items = await baseQuery
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .Select(x => new ArrendatarioListItemDto(
                    x.Nit,
                    x.Nombre,
                    x.Inmuebles,
                    x.PrincipalInmueble,
                    x.PrincipalProyecto,
                    x.Canon,
                    x.ProximoVencimiento,
                    x.ProximoVencimiento != null && x.ProximoVencimiento < hoy
                ))
                .ToListAsync();

            return Results.Ok(new ArrendatariosResponseDto(
                new PagedResult<ArrendatarioListItemDto>(items, pagina, tamano, total),
                new ArrendatariosKpisDto(total, canonTotal, porVencer)));
        })
        .WithName("GetArrendatarios");

        group.MapPost("/", async (CrearContraparteDto request, ApplicationDbContext db) =>
        {
            var nit = Validacion.Texto(request.Nit);
            var nombre = Validacion.Texto(request.Nombre);
            if (nit is null || nombre is null)
                return Validacion.Error("El NIT y el nombre son obligatorios.");
            if (Validacion.ExcedeLargo(("El NIT", nit, 20), ("El nombre", nombre, 200)) is { } largo)
                return Validacion.Error(largo);

            if (await db.Arrendatarios.AnyAsync(a => a.Nit == nit))
                return Results.Conflict(new { message = "Ya existe un arrendatario con ese NIT." });

            db.Arrendatarios.Add(new Arrendatario { Nit = nit, Nombre = nombre });
            await db.SaveChangesAsync();

            return Results.Ok(new ContraparteDto(nit, nombre));
        })
        .WithName("CrearArrendatario");

        // El NIT es la llave primaria y lo referencian los contratos: solo se edita el nombre.
        group.MapPut("/{nit}", async (string nit, CrearContraparteDto request, ApplicationDbContext db) =>
        {
            var arrendatario = await db.Arrendatarios.FirstOrDefaultAsync(a => a.Nit == nit);
            if (arrendatario is null)
                return Results.NotFound(new { message = "El arrendatario no existe." });

            var nombre = Validacion.Texto(request.Nombre);
            if (nombre is null)
                return Validacion.Error("El nombre es obligatorio.");
            if (Validacion.ExcedeLargo(("El nombre", nombre, 200)) is { } largo)
                return Validacion.Error(largo);

            arrendatario.Nombre = nombre;
            await db.SaveChangesAsync();
            return Results.Ok(new ContraparteDto(arrendatario.Nit, arrendatario.Nombre));
        })
        .WithName("ActualizarArrendatario");

        group.MapDelete("/{nit}", async (string nit, ApplicationDbContext db) =>
        {
            var arrendatario = await db.Arrendatarios.FirstOrDefaultAsync(a => a.Nit == nit);
            if (arrendatario is null)
                return Results.NotFound(new { message = "El arrendatario no existe." });

            var contratos = await db.ContratosArrendamientos.CountAsync(c => c.NitArrendatario == nit);
            if (contratos > 0)
                return Results.Conflict(new { message = $"No se puede eliminar: el arrendatario figura en {contratos} contrato(s)." });

            db.Arrendatarios.Remove(arrendatario);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarArrendatario");
    }
}
