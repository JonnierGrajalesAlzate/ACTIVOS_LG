using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Arrendatario
{
    public string Nit { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public virtual ICollection<ContratosArrendamiento> ContratosArrendamientos { get; set; } = new List<ContratosArrendamiento>();
}
