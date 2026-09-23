using System;

namespace ActivosLG.Api.Data.Entities;

public partial class Parametro
{
    public string Clave { get; set; } = null!;

    public decimal? Valor { get; set; }

    public string? Descripcion { get; set; }

    public DateTime FechaActualizacion { get; set; }

    public string? ActualizadoPor { get; set; }
}
