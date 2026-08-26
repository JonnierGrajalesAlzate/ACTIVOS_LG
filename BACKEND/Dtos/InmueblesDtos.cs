namespace ActivosLG.Api.Dtos;

public record InmuebleListItemDto(
    int Id,
    string Nombre,
    string Proyecto,
    string? Arrendatario,
    decimal? AreaM2,
    decimal? CanonMensual,
    DateOnly? ProximoVencimiento,
    string Estado,
    bool ContratoVencido
);

public record InmueblesKpisDto(
    decimal CanonMensualTotal,
    decimal AreaTotalM2,
    decimal OcupacionPorcentaje,
    int VencenEn90Dias,
    int ContratosVencidos
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
