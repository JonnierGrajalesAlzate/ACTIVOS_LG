namespace ActivosLG.Api.Dtos;

/// <summary>Opcion de un catalogo por id (estado, destinacion, tipo de local, marca, seguro...).</summary>
public record OpcionDto(int Id, string Nombre);

public record EtapaOpcionDto(int Id, int IdProyecto, string Nombre);

/// <summary>Contraparte (arrendador o arrendatario): su llave es el NIT.</summary>
public record ContraparteDto(string Nit, string Nombre);

/// <summary>Todo lo que necesitan los formularios de alta para llenar sus listas desplegables.</summary>
public record CatalogosDto(
    IReadOnlyList<OpcionDto> Proyectos,
    IReadOnlyList<EtapaOpcionDto> Etapas,
    IReadOnlyList<OpcionDto> Estados,
    IReadOnlyList<OpcionDto> Destinaciones,
    IReadOnlyList<OpcionDto> TiposLocal,
    IReadOnlyList<OpcionDto> TiposInmueble,
    IReadOnlyList<OpcionDto> Marcas,
    IReadOnlyList<OpcionDto> Seguros,
    IReadOnlyList<ContraparteDto> Arrendadores,
    IReadOnlyList<ContraparteDto> Arrendatarios
);

/// <summary>
/// Inmueble para elegir en los formularios de egreso y contrato, con los datos que
/// esos formularios usan para previsualizar los campos derivados.
/// </summary>
public record InmuebleOpcionDto(
    int Id,
    string Nombre,
    int IdProyecto,
    string Proyecto,
    string? Matricula,
    decimal? AreaM2,
    decimal? ValorComercial,
    decimal? PredialAnual,
    decimal? CanonActual,
    bool TieneEgreso,
    string? NitPropietario,
    string? Propietario
);
