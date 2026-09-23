namespace ActivosLG.Api.Dtos;

public record InmuebleListItemDto(
    int Id,
    string Nombre,
    string Proyecto,
    string? Etapa,
    string? Arrendatario,
    decimal? AreaM2,
    decimal? CanonMensual,
    decimal? RentalRate,
    DateOnly? ProximoVencimiento,
    string Estado,
    bool ContratoVencido
);

public record InmueblesKpisDto(
    decimal CanonMensualTotal,
    decimal AreaTotalM2,
    decimal OcupacionPorcentaje,
    int VencenEn120Dias
);

public record EstadoConteoDto(string Estado, int Conteo);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int Total
);

public record InmueblesResponseDto(
    PagedResult<InmuebleListItemDto> Pagina,
    InmueblesKpisDto Kpis,
    IReadOnlyList<EstadoConteoDto> Estados
);

public record ProyectoDto(int Id, string Nombre);

/// <summary>
/// Tarjeta de etapa. Id = 0 agrupa los inmuebles del proyecto que aun no tienen etapa asignada.
/// </summary>
public record EtapaResumenDto(
    int Id,
    string Nombre,
    int Inmuebles,
    int Arrendados,
    decimal OcupacionPorcentaje,
    decimal CanonMensual
);

public record ProyectoEtapasDto(int Id, string Nombre, IReadOnlyList<EtapaResumenDto> Etapas);

public record CrearProyectoDto(string Nombre);
