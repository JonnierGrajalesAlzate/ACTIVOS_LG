using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class EgresosMensuale
{
    public int Id { get; set; }

    public int IdInmueble { get; set; }

    public string? NumeroContratoServicio { get; set; }

    public decimal? PredialMensual { get; set; }

    public decimal? SeguroArriendo { get; set; }

    public decimal? ComisionAdministracionInmobiliaria { get; set; }

    public decimal? CamVacante { get; set; }

    public decimal? GravamenMovimientosFinancieros { get; set; }

    public decimal? ComisionFiduciaria { get; set; }

    public decimal? ReembolsosTerceros { get; set; }

    public decimal? MantenimientoMenor { get; set; }

    public decimal? TotalEgresos { get; set; }

    public decimal? Ebitda { get; set; }

    public decimal? RentabilidadCapRate { get; set; }

    public virtual Inmueble IdInmuebleNavigation { get; set; } = null!;

    public virtual ServiciosPublico? NumeroContratoServicioNavigation { get; set; }
}
