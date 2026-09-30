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
    string? NitArrendatario,
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

public record CrearContraparteDto(string? Nit, string? Nombre);

/// <summary>Alta/edicion de propietario. Inmuebles = ids de los que es dueño (null = no cambiarlos).</summary>
public record CrearPropietarioDto(string? Nit, string? Nombre, IReadOnlyList<int>? Inmuebles);

public record PropietarioDetalleDto(string Nit, string Nombre, IReadOnlyList<int> Inmuebles);

/// <summary>
/// Alta de contrato. Porcentajes en porcentaje (1,74 = 1,74 %). Si no se envian, se calculan:
/// vto. primera vigencia = fecha + plazo - 1 dia, proximo vencimiento = vto. primera vigencia,
/// proximo incremento = siguiente aniversario de la fecha del contrato; valor m2 canon y
/// rental rate salen del area y el valor comercial del inmueble.
/// </summary>
public record CrearContratoDto(
    int IdInmueble,
    string? NitArrendador,
    string? NitArrendatario,
    int? IdMarca,
    int? IdSeguro,
    DateOnly? FechaContrato,
    int? PlazoAnios,
    DateOnly? VtoPrimeraVigencia,
    DateOnly? ProximoVencimiento,
    DateOnly? ProximoIncremento,
    decimal? CanonActualMensual,
    string? TipoCanon,
    decimal? PorcentajeCanonVariable,
    decimal? PorcentajeVentas,
    string? TipoIncrementoActual,
    decimal? PuntosAdicionalesIpc,
    string? IncrementoAnual,
    string? AdmonIncrementaCanon,
    decimal? ValorReembolsoAdmon,
    string? ComisionEntidad,
    decimal? PorcentajeComisionEntidad,
    decimal? PorcentSeguro,
    string? Observaciones,
    bool MarcarArrendado = true
);

/// <summary>Contrato para editar: los datos del alta mas el proyecto del inmueble (para el selector).</summary>
public record ContratoDetalleDto(int IdProyecto, CrearContratoDto Datos);

public record ContratoCreadoDto(int Id, decimal? ValorM2Canon, decimal? RentalRate, DateOnly? ProximoVencimiento, DateOnly? ProximoIncremento);

public record ContratosResponseDto(
    PagedResult<ContratoListItemDto> Pagina,
    ContratosKpisDto Kpis
);
