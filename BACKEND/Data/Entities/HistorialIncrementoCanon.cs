using System;

namespace ActivosLG.Api.Data.Entities;

public partial class HistorialIncrementoCanon
{
    public int Id { get; set; }

    public int IdContrato { get; set; }

    public DateOnly FechaIncremento { get; set; }

    public decimal CanonAnterior { get; set; }

    public decimal CanonNuevo { get; set; }

    public decimal Ipc { get; set; }

    public decimal? PuntosAdicionales { get; set; }

    public DateTime FechaAplicacion { get; set; }

    public string? AplicadoPor { get; set; }

    public virtual ContratosArrendamiento IdContratoNavigation { get; set; } = null!;
}
