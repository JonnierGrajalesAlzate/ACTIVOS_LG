using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ArrendadoresEndpoints
{
    public static void MapArrendadoresEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/arrendadores").WithTags("Arrendadores").CambiosSoloGestores();

        group.MapGet("/", async (
            ApplicationDbContext db,
            string? q,
            string orden = "giro",
            string dir = "desc",
            int pagina = 1,
            int tamano = 10) =>
        {
            // Inmuebles = de los que es dueño (inmueble.nit_propietario); contratos y giro salen de los contratos.
            var baseQuery =
                from a in db.Arrendadors
                select new
                {
                    a.Nit,
                    a.Nombre,
                    Contratos = a.ContratosArrendamientos.Count(),
                    Inmuebles = a.Inmuebles.Count(),
                    Giro = a.ContratosArrendamientos.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m
                };

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x => EF.Functions.Like(x.Nombre, term) || EF.Functions.Like(x.Nit, term));
            }

            var total = await baseQuery.CountAsync();
            var giroTotal = await baseQuery.SumAsync(x => (decimal?)x.Giro) ?? 0m;
            var inmueblesRepresentados = await db.Inmuebles.CountAsync(i => i.NitPropietario != null);

            dir = dir.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
            baseQuery = (orden.ToLowerInvariant(), dir) switch
            {
                ("nombre", "asc") => baseQuery.OrderBy(x => x.Nombre),
                ("nombre", "desc") => baseQuery.OrderByDescending(x => x.Nombre),
                ("inmuebles", "asc") => baseQuery.OrderBy(x => x.Inmuebles),
                ("inmuebles", "desc") => baseQuery.OrderByDescending(x => x.Inmuebles),
                (_, "asc") => baseQuery.OrderBy(x => x.Giro),
                _ => baseQuery.OrderByDescending(x => x.Giro)
            };

            pagina = pagina < 1 ? 1 : pagina;
            tamano = tamano is < 1 or > 100 ? 10 : tamano;

            var items = await baseQuery
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .Select(x => new ArrendadorListItemDto(x.Nit, x.Nombre, x.Inmuebles, x.Contratos, x.Giro))
                .ToListAsync();

            return Results.Ok(new ArrendadoresResponseDto(
                new PagedResult<ArrendadorListItemDto>(items, pagina, tamano, total),
                new ArrendadoresKpisDto(total, giroTotal, inmueblesRepresentados)));
        })
        .WithName("GetArrendadores");

        group.MapGet("/{nit}", async (string nit, ApplicationDbContext db) =>
        {
            var arrendador = await db.Arrendadors
                .Where(a => a.Nit == nit)
                .Select(a => new PropietarioDetalleDto(a.Nit, a.Nombre, a.Inmuebles.Select(i => i.Id).ToList()))
                .FirstOrDefaultAsync();
            return arrendador is null
                ? Results.NotFound(new { message = "El propietario no existe." })
                : Results.Ok(arrendador);
        })
        .WithName("GetArrendador");

        group.MapPost("/", async (CrearPropietarioDto request, ApplicationDbContext db) =>
        {
            var nit = Validacion.Texto(request.Nit);
            var nombre = Validacion.Texto(request.Nombre);
            if (nit is null || nombre is null)
                return Validacion.Error("El NIT y el nombre son obligatorios.");
            if (Validacion.ExcedeLargo(("El NIT", nit, 20), ("El nombre", nombre, 200)) is { } largo)
                return Validacion.Error(largo);

            if (await db.Arrendadors.AnyAsync(a => a.Nit == nit))
                return Results.Conflict(new { message = "Ya existe un propietario con ese NIT." });

            db.Arrendadors.Add(new Arrendador { Nit = nit, Nombre = nombre });
            if (await AsignarInmuebles(nit, request.Inmuebles, db) is { } error)
                return error;
            await db.SaveChangesAsync();

            return Results.Ok(new ContraparteDto(nit, nombre));
        })
        .WithName("CrearArrendador");

        // El NIT es la llave primaria y lo referencian contratos e inmuebles: se editan el nombre y sus inmuebles.
        group.MapPut("/{nit}", async (string nit, CrearPropietarioDto request, ApplicationDbContext db) =>
        {
            var arrendador = await db.Arrendadors.FirstOrDefaultAsync(a => a.Nit == nit);
            if (arrendador is null)
                return Results.NotFound(new { message = "El propietario no existe." });

            var nombre = Validacion.Texto(request.Nombre);
            if (nombre is null)
                return Validacion.Error("El nombre es obligatorio.");
            if (Validacion.ExcedeLargo(("El nombre", nombre, 200)) is { } largo)
                return Validacion.Error(largo);

            arrendador.Nombre = nombre;
            if (await AsignarInmuebles(nit, request.Inmuebles, db) is { } error)
                return error;
            await db.SaveChangesAsync();
            return Results.Ok(new ContraparteDto(arrendador.Nit, arrendador.Nombre));
        })
        .WithName("ActualizarArrendador");

        group.MapDelete("/{nit}", async (string nit, ApplicationDbContext db) =>
        {
            var arrendador = await db.Arrendadors.FirstOrDefaultAsync(a => a.Nit == nit);
            if (arrendador is null)
                return Results.NotFound(new { message = "El propietario no existe." });

            var contratos = await db.ContratosArrendamientos.CountAsync(c => c.NitArrendador == nit);
            if (contratos > 0)
                return Results.Conflict(new { message = $"No se puede eliminar: el propietario figura en {contratos} contrato(s)." });
            var inmuebles = await db.Inmuebles.CountAsync(i => i.NitPropietario == nit);
            if (inmuebles > 0)
                return Results.Conflict(new { message = $"No se puede eliminar: es dueño de {inmuebles} inmueble(s). Quitaselos en su formulario primero." });

            db.Arrendadors.Remove(arrendador);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("EliminarArrendador");
    }

    /// <summary>
    /// Deja al propietario como dueño exactamente de `ids`: asigna los marcados (aunque fueran de otro
    /// propietario) y libera los que tenia y ya no estan. null = no tocar sus inmuebles.
    /// </summary>
    private static async Task<IResult?> AsignarInmuebles(string nit, IReadOnlyList<int>? ids, ApplicationDbContext db)
    {
        if (ids is null)
            return null;

        var elegidos = ids.Distinct().ToList();
        var inmuebles = await db.Inmuebles
            .Where(i => elegidos.Contains(i.Id) || i.NitPropietario == nit)
            .ToListAsync();
        if (elegidos.Except(inmuebles.Select(i => i.Id)).Any())
            return Validacion.Error("Alguno de los inmuebles elegidos no existe.");

        foreach (var inmueble in inmuebles)
            inmueble.NitPropietario = elegidos.Contains(inmueble.Id) ? nit : null;
        return null;
    }
}
