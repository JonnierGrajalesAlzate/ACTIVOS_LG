namespace ActivosLG.Api.Dtos;

/// <summary>
/// Perfil de egresos mensuales de un inmueble. La tabla egresos_mensuales no
/// tiene columna de fecha: es el costo mensual vigente, no una serie de tiempo.
/// </summary>
public record EgresoListItemDto(
    int Id,
    int IdInmueble,
    string Inmueble,
    string Proyecto,
    string EstadoInmueble,
    decimal? PredialMensual,
    decimal? SeguroArriendo,
    decimal? ComisionAdministracion,
    decimal? CamVacante,
    decimal? ComisionFiduciaria,
    decimal? MantenimientoMenor,
    decimal? TotalEgresos,
    decimal? Ebitda,
    decimal? RentabilidadCapRate
);

public record EgresosKpisDto(
    decimal TotalEgresos,
    decimal TotalEbitda,
    decimal PredialTotal,
    int InmueblesEnPerdida
);

/// <summary>
/// Alta del perfil de egresos de un inmueble (uno por inmueble). El total, el EBITDA
/// (canon del contrato vigente - total) y el cap rate (EBITDA / valor comercial) se calculan.
/// </summary>
public record CrearEgresoDto(
    int IdInmueble,
    string? NumeroContratoServicio,
    decimal? PredialMensual,
    decimal? SeguroArriendo,
    decimal? ComisionAdministracionInmobiliaria,
    decimal? CamVacante,
    decimal? GravamenMovimientosFinancieros,
    decimal? ComisionFiduciaria,
    decimal? ReembolsosTerceros,
    decimal? MantenimientoMenor
);

/// <summary>Egreso para editar: los datos del alta mas el proyecto del inmueble (para el selector).</summary>
public record EgresoDetalleDto(int IdProyecto, CrearEgresoDto Datos);

public record EgresoCreadoDto(int Id, decimal TotalEgresos, decimal? Ebitda, decimal? RentabilidadCapRate);

public record EgresosResponseDto(
    PagedResult<EgresoListItemDto> Pagina,
    EgresosKpisDto Kpis
);
