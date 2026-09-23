using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ResumenEndpoints
{
    private const string EstadoArrendado = Negocio.EstadoArrendado;

    public static void MapResumenEndpoints(this WebApplication app)
    {
        app.MapGet("/api/resumen", async (ApplicationDbContext db) =>
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var limiteVencimiento = hoy.AddDays(Negocio.DiasAlertaVencimiento);
            var limiteIncremento = hoy.AddDays(Negocio.DiasAvisoIncremento);

            var totalInmuebles = await db.Inmuebles.CountAsync();
            var arrendados = await db.Inmuebles.CountAsync(i => i.IdEstadoNavigation.Descripcion == EstadoArrendado);
            var disponibles = totalInmuebles - arrendados;
            var areaTotal = await db.Inmuebles.SumAsync(i => (decimal?)i.AreaPiso1) ?? 0m;
            var canonMensual = await db.ContratosArrendamientos
                .Where(c => c.IdInmuebleNavigation.IdEstadoNavigation.Descripcion == EstadoArrendado)
                .SumAsync(c => (decimal?)c.CanonActualMensual) ?? 0m;
            var egresosMensuales = await db.EgresosMensuales.SumAsync(e => (decimal?)e.TotalEgresos) ?? 0m;
            var ebitdaMensual = await db.EgresosMensuales.SumAsync(e => (decimal?)e.Ebitda) ?? 0m;
            var valorPortafolio = await db.Inmuebles.SumAsync(i => (decimal?)i.ValorComercial) ?? 0m;
            var ocupacion = totalInmuebles == 0 ? 0m : Math.Round(arrendados * 100m / totalInmuebles, 1);

            var kpis = new ResumenKpisDto(
                canonMensual, egresosMensuales, ebitdaMensual, ocupacion,
                totalInmuebles, arrendados, disponibles, areaTotal, valorPortafolio);

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
                        .Sum(c => (decimal?)c.CanonActualMensual)) ?? 0m,
                    Etapas = p.Etapas.Count
                })
                .ToListAsync();

            var ocupacionPorProyecto = porProyectoRaw
                .Select(x => new OcupacionProyectoDto(
                    x.Id, x.Proyecto, x.Inmuebles, x.Arrendados,
                    x.Inmuebles == 0 ? 0m : Math.Round(x.Arrendados * 100m / x.Inmuebles, 1),
                    x.Canon,
                    x.Etapas))
                .OrderByDescending(x => x.CanonMensual)
                .ToList();

            // Alertas reales: incrementos de canon por IPC, contratos proximos a vencer y
            // vacantes con EBITDA negativo (generan egresos sin ingreso). Los contratos ya
            // vencidos no generan alerta: significan renovacion pendiente.
            var alertas = new List<AlertaDto>();

            var ipc = await db.Parametros
                .Where(p => p.Clave == Negocio.ParametroIpc)
                .Select(p => p.Valor)
                .FirstOrDefaultAsync();

            var incrementos = await db.ContratosArrendamientos
                .Where(c => c.ProximoIncremento != null && c.ProximoIncremento <= limiteIncremento &&
                            c.TipoIncrementoActual != null && c.TipoIncrementoActual.Contains("IPC"))
                .OrderBy(c => c.ProximoIncremento)
                .Select(c => new
                {
                    c.Id,
                    Inmueble = (c.IdInmuebleNavigation.IdTipoLocalNavigation.Descripcion + " " +
                                c.IdInmuebleNavigation.NumeroLocal).Trim(),
                    Proyecto = c.IdInmuebleNavigation.IdProyectoNavigation.Nombre,
                    Arrendatario = c.NitArrendatarioNavigation != null ? c.NitArrendatarioNavigation.Nombre : null,
                    c.ProximoIncremento,
                    c.CanonActualMensual,
                    c.PuntosAdicionalesIpc
                })
                .ToListAsync();

            foreach (var c in incrementos)
            {
                var dias = c.ProximoIncremento!.Value.DayNumber - hoy.DayNumber;
                var pendiente = dias < 0;
                decimal? canonNuevo = ipc is { } v && c.CanonActualMensual is { } canon
                    ? Negocio.CanonConIncremento(canon, v, c.PuntosAdicionalesIpc)
                    : null;
                var detalle = canonNuevo is null
                    ? $"Canon {c.CanonActualMensual:N0} · configura el IPC para calcular el nuevo"
                    : $"Canon {c.CanonActualMensual:N0} → {canonNuevo:N0} (IPC {ipc * 100:0.##} %{(c.PuntosAdicionalesIpc is > 0 ? $" + {c.PuntosAdicionalesIpc * 100:0.##} pts" : "")})";
                alertas.Add(new AlertaDto(
                    "incremento-ipc",
                    c.Inmueble,
                    $"{c.Proyecto} · {c.Arrendatario ?? "sin arrendatario"}",
                    pendiente
                        ? $"Incremento IPC pendiente desde {c.ProximoIncremento:dd/MM/yyyy}"
                        : dias == 0 ? "Incremento IPC hoy" : $"Incremento IPC en {dias} dias",
                    detalle,
                    pendiente ? "danger" : "warn",
                    c.Id,
                    c.CanonActualMensual,
                    canonNuevo));
            }

            var contratosCriticos = await db.ContratosArrendamientos
                .Where(c => c.ProximoVencimiento != null && c.ProximoVencimiento >= hoy && c.ProximoVencimiento <= limiteVencimiento)
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
                .Take(10)
                .ToListAsync();

            foreach (var c in contratosCriticos)
            {
                var dias = c.ProximoVencimiento!.Value.DayNumber - hoy.DayNumber;
                alertas.Add(new AlertaDto(
                    "contrato-por-vencer",
                    c.Inmueble,
                    $"{c.Proyecto} · {c.Arrendatario ?? "sin arrendatario"}",
                    dias == 0 ? "Vence hoy" : $"Vence en {dias} dias",
                    $"Canon {c.CanonActualMensual:N0}",
                    "warn"));
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
