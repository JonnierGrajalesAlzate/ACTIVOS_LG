using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ArrendadoresEndpoints
{
    public static void MapArrendadoresEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/arrendadores").WithTags("Arrendadores");

        group.MapGet("/", async (
            ApplicationDbContext db,
            string? q,
            string orden = "giro",
            string dir = "desc",
            int pagina = 1,
            int tamano = 10) =>
        {
            // La tabla solo tiene nit y nombre: inmuebles y giro salen de los contratos.
            var baseQuery =
                from a in db.Arrendadors
                select new
                {
                    a.Nit,
                    a.Nombre,
                    Contratos = a.ContratosArrendamientos.Count(),
                    Inmuebles = a.ContratosArrendamientos.Select(c => c.IdInmueble).Distinct().Count(),
                    Giro = a.ContratosArrendamientos.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m
                };

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = $"%{q.Trim()}%";
                baseQuery = baseQuery.Where(x => EF.Functions.Like(x.Nombre, term) || EF.Functions.Like(x.Nit, term));
            }

            var total = await baseQuery.CountAsync();
            var giroTotal = await baseQuery.SumAsync(x => (decimal?)x.Giro) ?? 0m;
            var inmueblesRepresentados = await db.ContratosArrendamientos
                .Where(c => c.NitArrendador != null)
                .Select(c => c.IdInmueble)
                .Distinct()
                .CountAsync();

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
    }
}
