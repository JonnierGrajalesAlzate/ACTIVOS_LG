using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class ContratosArrendamiento
{
    public int Id { get; set; }

    public int IdInmueble { get; set; }

    public int? IdSeguro { get; set; }

    public int? IdMarca { get; set; }

    public string? NitArrendador { get; set; }

    public string? NitArrendatario { get; set; }

    public DateOnly? FechaContrato { get; set; }

    public int? PlazoAnios { get; set; }

    public DateOnly? VtoPrimeraVigencia { get; set; }

    public DateOnly? ProximoVencimiento { get; set; }

    public DateOnly? ProximoIncremento { get; set; }

    public decimal? CanonActualMensual { get; set; }

    public decimal? ValorM2Canon { get; set; }

    public decimal? RentalRate { get; set; }

    public decimal? PorcentajeVentas { get; set; }

    public string? ComisionEntidad { get; set; }

    public decimal? PorcentajeComisionEntidad { get; set; }

    public string? AdmonIncrementaCanon { get; set; }

    public decimal? ValorReembolsoAdmon { get; set; }

    public string? TipoIncrementoActual { get; set; }

    public decimal? PuntosAdicionalesIpc { get; set; }

    public string? IncrementoAnual { get; set; }

    public string? TipoCanon { get; set; }

    public decimal? PorcentajeCanonVariable { get; set; }

    public string? Observaciones { get; set; }

    public decimal? PorcentSeguro { get; set; }

    public virtual Inmueble IdInmuebleNavigation { get; set; } = null!;

    public virtual Marca? IdMarcaNavigation { get; set; }

    public virtual Seguro? IdSeguroNavigation { get; set; }

    public virtual Arrendador? NitArrendadorNavigation { get; set; }

    public virtual Arrendatario? NitArrendatarioNavigation { get; set; }
}
