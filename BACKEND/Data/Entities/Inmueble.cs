using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Inmueble
{
    public int Id { get; set; }

    public int IdProyecto { get; set; }

    public int IdEstado { get; set; }

    public int IdDestinacion { get; set; }

    public int IdTipoLocal { get; set; }

    public int IdTipoInmueble { get; set; }

    public string? MatriculaInmobiliaria { get; set; }

    public string? NumeroLocal { get; set; }

    public bool? Mesanine { get; set; }

    public int? Pisos { get; set; }

    public decimal? AreaPiso1 { get; set; }

    public decimal? ValorM2Construido { get; set; }

    public decimal? ValorComercial { get; set; }

    public decimal? AvaluoCatastral { get; set; }

    public decimal? TarifaCatastro { get; set; }

    public decimal? PorcentajeCatastral { get; set; }

    public decimal? PredialAnual { get; set; }

    public string? Observaciones { get; set; }

    public decimal? Coeficiente { get; set; }

    public decimal? AreaLibrePriv { get; set; }

    public int? ValorM2Admon { get; set; }

    public int? ValorPredialAnual { get; set; }

    public decimal? PorcentValorCatastral { get; set; }

    public virtual ICollection<Administracion> Administracions { get; set; } = new List<Administracion>();

    public virtual ICollection<ContratosArrendamiento> ContratosArrendamientos { get; set; } = new List<ContratosArrendamiento>();

    public virtual ICollection<EgresosMensuale> EgresosMensuales { get; set; } = new List<EgresosMensuale>();

    public virtual Destinacion IdDestinacionNavigation { get; set; } = null!;

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual Proyecto IdProyectoNavigation { get; set; } = null!;

    public virtual TipoInmueble IdTipoInmuebleNavigation { get; set; } = null!;

    public virtual TipoLocal IdTipoLocalNavigation { get; set; } = null!;

    public virtual ICollection<Leasing> Leasings { get; set; } = new List<Leasing>();
}
