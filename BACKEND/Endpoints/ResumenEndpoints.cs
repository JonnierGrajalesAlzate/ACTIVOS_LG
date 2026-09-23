using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ResumenEndpoints
{
    private const string EstadoArrendado = "Arrendado";

    public static void MapResumenEndpoints(this WebApplication app)
    {
        app.MapGet("/api/resumen", async (ApplicationDbContext db) =>
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var limite90 = hoy.AddDays(90);

            var totalInmuebles = await db.Inmuebles.CountAsync();
            var arrendados = await db.Inmuebles.CountAsync(i => i.IdEstadoNavigation.Descripcion == EstadoArrendado);
            var disponibles = totalInmuebles - arrendados;
            var areaTotal = await db.Inmuebles.SumAsync(i => (decimal?)i.AreaPiso1) ?? 0m;
            var canonMensual = await db.ContratosArrendamientos
                .Where(c => c.IdInmuebleNavigation.IdEstadoNavigation.Descripcion == EstadoArrendado)
                .SumAsync(c => (decimal?)c.CanonActualMensual) ?? 0m;
            var egresosMensuales = await db.EgresosMensuales.SumAsync(e => (decimal?)e.TotalEgresos) ?? 0m;
            var ebitdaMensual = await db.EgresosMensuales.SumAsync(e => (decimal?)e.Ebitda) ?? 0m;
            var ocupacion = totalInmuebles == 0 ? 0m : Math.Round(arrendados * 100m / totalInmuebles, 1);

            var kpis = new ResumenKpisDto(
                canonMensual, egresosMensuales, ebitdaMensual, ocupacion,
                totalInmuebles, arrendados, disponibles, areaTotal);

            // Se parte de Proyectos (no de Inmuebles) para que un proyecto recien
            // creado, aun sin inmuebles, aparezca igual en el listado.
            var porProyectoRaw = await db.Proyectos
                .Select(p => new
                {
                    p.Id,
                    Proyecto = p.Nombre,
                    Inmuebles = p.Inmuebles.Count,
                    Arrendados = p.Inmuebles.Count(i => i.IdEstadoNavigation.Descripcion == EstadoArrendado),
                    Canon = p.Inmuebles.Sum(i => (decimal?)i.ContratosArrendamientos
                        .Sum(c => (decimal?)c.CanonActualMensual)) ?? 0m
                })
                .ToListAsync();

            var ocupacionPorProyecto = porProyectoRaw
                .Select(x => new OcupacionProyectoDto(
                    x.Id, x.Proyecto, x.Inmuebles, x.Arrendados,
                    x.Inmuebles == 0 ? 0m : Math.Round(x.Arrendados * 100m / x.Inmuebles, 1),
                    x.Canon))
                .OrderByDescending(x => x.CanonMensual)
                .ToList();

            // Alertas reales: contratos vencidos, proximos a vencer y vacantes con
            // EBITDA negativo (generan egresos sin ingreso).
            var alertas = new List<AlertaDto>();

            var contratosCriticos = await db.ContratosArrendamientos
                .Where(c => c.ProximoVencimiento != null && c.ProximoVencimiento <= limite90)
                .OrderBy(c => c.ProximoVencimiento)
                .Select(c => new
                {
                    Inmueble = (c.IdInmuebleNavigation.IdTipoLocalNavigation.Descripcion + " " +
                                c.IdInmuebleNavigation.NumeroLocal).Trim(),
                    Proyecto = c.IdInmuebleNavigation.IdProyectoNavigation.Nombre,
                    Arrendatario = c.NitArrendatarioNavigation != null ? c.NitArrendatarioNavigation.Nombre : null,
                    c.ProximoVencimiento,
                    c.CanonActualMensual
                })
                .Take(6)
                .ToListAsync();

            foreach (var c in contratosCriticos)
            {
                var dias = c.ProximoVencimiento!.Value.DayNumber - hoy.DayNumber;
                var vencido = dias < 0;
                alertas.Add(new AlertaDto(
                    vencido ? "contrato-vencido" : "contrato-por-vencer",
                    c.Inmueble,
                    $"{c.Proyecto} · {c.Arrendatario ?? "sin arrendatario"}",
                    vencido ? $"Vencido hace {Math.Abs(dias)} dias" : $"Vence en {dias} dias",
                    $"Canon {c.CanonActualMensual:N0}",
                    vencido ? "danger" : "warn"));
            }

            var vacantesCostosas = await db.EgresosMensuales
                .Where(e => e.Ebitda < 0)
                .OrderBy(e => e.Ebitda)
                .Select(e => new
                {
                    Inmueble = (e.IdInmuebleNavigation.IdTipoLocalNavigation.Descripcion + " " +
                                e.IdInmuebleNavigation.NumeroLocal).Trim(),
                    Proyecto = e.IdInmuebleNavigation.IdProyectoNavigation.Nombre,
                    Estado = e.IdInmuebleNavigation.IdEstadoNavigation.Descripcion,
                    e.Ebitda,
                    e.TotalEgresos
                })
                .Take(5)
                .ToListAsync();

            foreach (var v in vacantesCostosas)
            {
                alertas.Add(new AlertaDto(
                    "ebitda-negativo",
                    v.Inmueble,
                    $"{v.Proyecto} · {v.Estado}",
                    $"EBITDA {v.Ebitda:N0}",
                    $"Egresos {v.TotalEgresos:N0} sin ingreso",
                    "danger"));
            }

            return Results.Ok(new ResumenResponseDto(kpis, ocupacionPorProyecto, alertas));
        })
        .WithName("GetResumen")
        .WithTags("Resumen");
    }
}
