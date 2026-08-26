using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ReportesEndpoints
{
    public static void MapReportesEndpoints(this WebApplication app)
    {
        // No hay historico mensual en la base (egresos_mensuales no tiene fecha),
        // asi que los informes son agregaciones del estado actual, no series de tiempo.
        app.MapGet("/api/reportes", async (ApplicationDbContext db) =>
        {
            var canonPorProyectoRaw = await db.ContratosArrendamientos
                .GroupBy(c => c.IdInmuebleNavigation.IdProyectoNavigation.Nombre)
                .Select(g => new
                {
                    Etiqueta = g.Key,
                    Valor = g.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m,
                    Conteo = g.Count()
                })
                .ToListAsync();
            var canonPorProyecto = canonPorProyectoRaw
                .OrderByDescending(x => x.Valor)
                .Select(x => new DistribucionDto(x.Etiqueta, x.Valor, x.Conteo))
                .ToList();

            var canonPorTipoRaw = await db.ContratosArrendamientos
                .GroupBy(c => c.IdInmuebleNavigation.IdTipoInmuebleNavigation.Descripcion)
                .Select(g => new
                {
                    Etiqueta = g.Key,
                    Valor = g.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m,
                    Conteo = g.Count()
                })
                .ToListAsync();
            var canonPorTipo = canonPorTipoRaw
                .OrderByDescending(x => x.Valor)
                .Select(x => new DistribucionDto(x.Etiqueta, x.Valor, x.Conteo))
                .ToList();

            var totales = await db.EgresosMensuales
                .Select(e => new
                {
                    Predial = e.PredialMensual ?? 0m,
                    Seguro = e.SeguroArriendo ?? 0m,
                    ComisionAdmon = e.ComisionAdministracionInmobiliaria ?? 0m,
                    Cam = e.CamVacante ?? 0m,
                    Fiduciaria = e.ComisionFiduciaria ?? 0m,
                    Mantenimiento = e.MantenimientoMenor ?? 0m,
                    Reembolsos = e.ReembolsosTerceros ?? 0m
                })
                .ToListAsync();

            var composicion = new List<ComposicionEgresosDto>
            {
                new("Predial", totales.Sum(t => t.Predial)),
                new("Comision administracion", totales.Sum(t => t.ComisionAdmon)),
                new("Comision fiduciaria", totales.Sum(t => t.Fiduciaria)),
                new("Seguro de arriendo", totales.Sum(t => t.Seguro)),
                new("CAM vacante", totales.Sum(t => t.Cam)),
                new("Mantenimiento menor", totales.Sum(t => t.Mantenimiento)),
                new("Reembolsos a terceros", totales.Sum(t => t.Reembolsos)),
            }
            .Where(c => c.Valor > 0)
            .OrderByDescending(c => c.Valor)
            .ToList();

            var vencimientosRaw = await db.ContratosArrendamientos
                .Where(c => c.ProximoVencimiento != null)
                .GroupBy(c => c.ProximoVencimiento!.Value.Year)
                .Select(g => new
                {
                    Anio = g.Key,
                    Contratos = g.Count(),
                    Canon = g.Sum(c => (decimal?)c.CanonActualMensual) ?? 0m
                })
                .ToListAsync();
            var vencimientos = vencimientosRaw
                .OrderBy(x => x.Anio)
                .Select(x => new VencimientoAnioDto(x.Anio, x.Contratos, x.Canon))
                .ToList();

            return Results.Ok(new ReportesResponseDto(
                canonPorProyecto, canonPorTipo, composicion, vencimientos));
        })
        .WithName("GetReportes")
        .WithTags("Reportes");
    }
}
