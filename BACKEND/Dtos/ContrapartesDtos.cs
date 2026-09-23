namespace ActivosLG.Api.Dtos;

/// <summary>
/// La tabla arrendador solo guarda nit y nombre; inmuebles y giro mensual se
/// derivan de contratos_arrendamiento.
/// </summary>
public record ArrendadorListItemDto(
    string Nit,
    string Nombre,
    int Inmuebles,
    int Contratos,
    decimal GiroMensual
);

public record ArrendadoresKpisDto(
    int TotalArrendadores,
    decimal GiroMensualTotal,
    int InmueblesRepresentados
);

public record ArrendadoresResponseDto(
    PagedResult<ArrendadorListItemDto> Pagina,
    ArrendadoresKpisDto Kpis
);

/// <summary>
/// Igual que arrendador: nit y nombre en tabla, el resto se deriva del contrato.
/// No existe informacion de cartera ni de mora en la base de datos.
/// </summary>
public record ArrendatarioListItemDto(
    string Nit,
    string Nombre,
    int Inmuebles,
    string? PrincipalInmueble,
    string? PrincipalProyecto,
    decimal CanonMensual,
    DateOnly? ProximoVencimiento,
    bool ContratoVencido
);

public record ArrendatariosKpisDto(
    int TotalArrendatarios,
    decimal CanonMensualTotal,
    int VencenEn120Dias
);

public record ArrendatariosResponseDto(
    PagedResult<ArrendatarioListItemDto> Pagina,
    ArrendatariosKpisDto Kpis
);

public record ContratoListItemDto(
    int Id,
    string Inmueble,
    string Proyecto,
    string? Arrendatario,
    string? Arrendador,
    string? Marca,
    decimal? CanonMensual,
    DateOnly? FechaContrato,
    DateOnly? ProximoVencimiento,
    DateOnly? ProximoIncremento,
    int? PlazoAnios,
    string? TipoIncremento,
    int? DiasRestantes,
    decimal? PorcentajeTranscurrido,
    string Gestion
);

public record ContratosKpisDto(
    int ContratosVigentes,
    int VencenEn120Dias,
    decimal CanonMensualTotal
);

public record AplicarIncrementoResultDto(
    int IdContrato,
    decimal CanonAnterior,
    decimal CanonNuevo,
    DateOnly? ProximoIncremento
);

public record ContratosResponseDto(
    PagedResult<ContratoListItemDto> Pagina,
    ContratosKpisDto Kpis
);
