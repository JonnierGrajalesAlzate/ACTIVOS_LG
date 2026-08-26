namespace ActivosLG.Api.Dtos;

public record ResumenKpisDto(
    decimal CanonMensual,
    decimal EgresosMensuales,
    decimal EbitdaMensual,
    decimal OcupacionPorcentaje,
    int TotalInmuebles,
    int Arrendados,
    int Disponibles,
    decimal AreaTotalM2
);

public record OcupacionProyectoDto(
    string Proyecto,
    int Inmuebles,
    int Arrendados,
    decimal OcupacionPorcentaje,
    decimal CanonMensual
);

/// <summary>
/// Alertas derivadas de datos reales: contratos vencidos o por vencer, e
/// inmuebles vacantes que generan egresos sin ingreso (EBITDA negativo).
/// </summary>
public record AlertaDto(
    string Tipo,
    string Titulo,
    string Contexto,
    string Motivo,
    string Detalle,
    string Severidad
);

public record ResumenResponseDto(
    ResumenKpisDto Kpis,
    IReadOnlyList<OcupacionProyectoDto> OcupacionPorProyecto,
    IReadOnlyList<AlertaDto> Alertas
);

public record DistribucionDto(string Etiqueta, decimal Valor, int Conteo);

public record VencimientoAnioDto(int Anio, int Contratos, decimal CanonMensual);

public record ComposicionEgresosDto(string Concepto, decimal Valor);

public record ReportesResponseDto(
    IReadOnlyList<DistribucionDto> CanonPorProyecto,
    IReadOnlyList<DistribucionDto> CanonPorTipoInmueble,
    IReadOnlyList<ComposicionEgresosDto> ComposicionEgresos,
    IReadOnlyList<VencimientoAnioDto> VencimientosPorAnio
);
