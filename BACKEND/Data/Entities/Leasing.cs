using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Leasing
{
    public int Id { get; set; }

    public int IdInmueble { get; set; }

    public string? EntidadLeasing { get; set; }

    public DateOnly? FechaSaldoLeasing { get; set; }

    public decimal? ValorLeasing { get; set; }

    public decimal? ValorRecompra { get; set; }

    public string? Observaciones { get; set; }

    public int? CuotaLeasing { get; set; }

    public DateOnly? FechaVtoLeasing { get; set; }

    public int? ValorActLeasing { get; set; }

    public virtual Inmueble IdInmuebleNavigation { get; set; } = null!;
}
