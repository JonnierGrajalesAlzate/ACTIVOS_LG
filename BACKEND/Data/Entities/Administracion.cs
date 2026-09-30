using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Administracion
{
    public int Id { get; set; }

    public int IdInmueble { get; set; }

    public DateOnly Fecha { get; set; }

    public decimal ValorMensual { get; set; }

    public decimal? PorcentCanonArriendo { get; set; }

    public virtual Inmueble IdInmuebleNavigation { get; set; } = null!;
}
