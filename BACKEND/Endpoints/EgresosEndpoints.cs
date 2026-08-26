using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class EgresosEndpoints
{
    public static void MapEgresosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/egresos").WithTags("Egresos");

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
    }
}
