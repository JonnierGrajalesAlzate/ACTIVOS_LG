namespace ActivosLG.Api.Dtos;

public record ResumenKpisDto(
    decimal CanonMensual,
    decimal EgresosMensuales,
    decimal EbitdaMensual,
    decimal OcupacionPorcentaje,
    int TotalInmuebles,
    int Arrendados,
    int Disponibles,
    decimal AreaTotalM2,
    decimal ValorPortafolio
);

public record OcupacionProyectoDto(
    int Id,
    string Proyecto,
    int Inmuebles,
    int Arrendados,
    decimal OcupacionPorcentaje,
    decimal CanonMensual,
    int Etapas
);

/// <summary>
/// Alertas derivadas de datos reales: contratos por vencer, incrementos de canon por IPC
/// e inmuebles vacantes que generan egresos sin ingreso (EBITDA negativo).
/// Los campos de contrato/canon solo vienen en las alertas de incremento IPC.
/// </summary>
public record AlertaDto(
    string Tipo,
    string Titulo,
    string Contexto,
    string Motivo,
    string Detalle,
    string Severidad,
    int? IdContrato = null,
    decimal? CanonActual = null,
    decimal? CanonNuevo = null
);

public record ResumenResponseDto(
    ResumenKpisDto Kpis,
    IReadOnlyList<OcupacionProyectoDto> OcupacionPorProyecto,
    IReadOnlyList<AlertaDto> Alertas
);

public record DistribucionDto(string Etiqueta, decimal Valor, int Conteo);

public record VencimientoAnioDto(int Anio, int Contratos, decimal CanonMensual);

public record ComposicionEgresosDto(string Concepto, decimal Valor);

/// <summary>Indicadores por proyecto para Reportes: ocupacion, canon, egresos, EBITDA y valor comercial.</summary>
public record ProyectoFinancieroDto(
    int Id,
    string Proyecto,
    int Inmuebles,
    int Arrendados,
    decimal OcupacionPorcentaje,
    decimal CanonMensual,
    decimal EgresosMensuales,
    decimal EbitdaMensual,
    decimal ValorComercial
);

public record ReportesResponseDto(
    IReadOnlyList<DistribucionDto> CanonPorProyecto,
    IReadOnlyList<DistribucionDto> CanonPorTipoInmueble,
    IReadOnlyList<ComposicionEgresosDto> ComposicionEgresos,
    IReadOnlyList<VencimientoAnioDto> VencimientosPorAnio,
    IReadOnlyList<ProyectoFinancieroDto> Proyectos
);

public record IpcDto(decimal? Valor, DateTime? FechaActualizacion, string? ActualizadoPor);

/// <summary>Valor en porcentaje, como lo publica el DANE (5,2 = 5,2 %).</summary>
public record ActualizarIpcDto(decimal Valor);
