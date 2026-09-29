using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Inmueble
{
    public int Id { get; set; }

    public int IdProyecto { get; set; }

    public int? IdEtapa { get; set; }

    public int IdEstado { get; set; }

    public int IdDestinacion { get; set; }

    public int IdTipoLocal { get; set; }

    public int IdTipoInmueble { get; set; }

    /// <summary>NIT del propietario (tabla arrendador). Script 008_inmueble_propietario.sql.</summary>
    public string? NitPropietario { get; set; }

    public string? MatriculaInmobiliaria { get; set; }

    public string? NumeroLocal { get; set; }

    public bool? Mesanine { get; set; }

    public int? Pisos { get; set; }

    /// <summary>Nivel/piso donde esta el inmueble segun el Excel: "1", "-3", "M" (mezanine)...</summary>
    public string? Nivel { get; set; }

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

    public virtual Etapa? IdEtapaNavigation { get; set; }

    public virtual Proyecto IdProyectoNavigation { get; set; } = null!;

    public virtual Arrendador? NitPropietarioNavigation { get; set; }

    public virtual TipoInmueble IdTipoInmuebleNavigation { get; set; } = null!;

    public virtual TipoLocal IdTipoLocalNavigation { get; set; } = null!;

    public virtual ICollection<Leasing> Leasings { get; set; } = new List<Leasing>();
}
