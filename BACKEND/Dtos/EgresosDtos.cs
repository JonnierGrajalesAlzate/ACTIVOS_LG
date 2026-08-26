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

public record EgresosResponseDto(
    PagedResult<EgresoListItemDto> Pagina,
    EgresosKpisDto Kpis
);
