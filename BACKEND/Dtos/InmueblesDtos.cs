namespace ActivosLG.Api.Dtos;

/// <summary>
/// Nombre = uso + numero de local (para textos); NumeroLocal, Nivel y Tipologia (tipo de inmueble) van
/// por separado para las columnas del inventario. TieneLeasing = hay registro en la tabla leasing.
/// </summary>
public record InmuebleListItemDto(
    int Id,
    string Nombre,
    string? NumeroLocal,
    string? Nivel,
    string Tipologia,
    string Uso,
    bool TieneLeasing,
    string? Observaciones,
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

public record CrearEtapaDto(string? Nombre);

public record EtapaDto(int Id, int IdProyecto, string Nombre);

public record IncrementoCanonDto(
    DateOnly FechaIncremento,
    decimal CanonAnterior,
    decimal CanonNuevo,
    decimal Ipc,
    decimal? PuntosAdicionales,
    string? AplicadoPor
);

/// <summary>Un contrato del historial del inmueble. Actual = el mas reciente (el que cuenta como vigente).</summary>
public record HistorialContratoDto(
    int Id,
    string? Arrendatario,
    string? NitArrendatario,
    string? Marca,
    DateOnly? FechaContrato,
    int? PlazoAnios,
    DateOnly? ProximoVencimiento,
    decimal? CanonMensual,
    string? Observaciones,
    bool Actual,
    IReadOnlyList<IncrementoCanonDto> Incrementos
);

public record HistorialInmuebleDto(int Id, string Inmueble, string Proyecto, IReadOnlyList<HistorialContratoDto> Contratos);

/// <summary>
/// Alta de inmueble. Porcentajes en porcentaje (1,5 = 1,5 %). Si no se envian, se calculan:
/// valor m2 construido = valor comercial / area, predial anual = avaluo x tarifa,
/// % valor catastral = avaluo / valor comercial.
/// </summary>
public record CrearInmuebleDto(
    int IdProyecto,
    int? IdEtapa,
    int IdEstado,
    int IdDestinacion,
    int IdTipoLocal,
    int IdTipoInmueble,
    string? MatriculaInmobiliaria,
    string? NumeroLocal,
    string? Nivel,
    bool? Mesanine,
    int? Pisos,
    decimal? AreaPiso1,
    decimal? AreaLibrePriv,
    decimal? Coeficiente,
    decimal? ValorComercial,
    decimal? ValorM2Construido,
    decimal? AvaluoCatastral,
    decimal? TarifaCatastro,
    decimal? PredialAnual,
    int? ValorM2Admon,
    string? Observaciones,
    string? NitPropietario = null
);

public record InmuebleCreadoDto(int Id, string Nombre);
