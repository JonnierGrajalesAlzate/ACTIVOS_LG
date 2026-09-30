using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class ServiciosPublico
{
    public string NumeroContrato { get; set; } = null!;

    public decimal Precio { get; set; }

    public virtual ICollection<EgresosMensuale> EgresosMensuales { get; set; } = new List<EgresosMensuale>();
}
