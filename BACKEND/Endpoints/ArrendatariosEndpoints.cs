using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ArrendatariosEndpoints
{
    public static void MapArrendatariosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/arrendatarios").WithTags("Arrendatarios");

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
    }
}
