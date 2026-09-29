using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Arrendador
{
    public string Nit { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public virtual ICollection<ContratosArrendamiento> ContratosArrendamientos { get; set; } = new List<ContratosArrendamiento>();

    /// <summary>Inmuebles de los que es dueño (inmueble.nit_propietario).</summary>
    public virtual ICollection<Inmueble> Inmuebles { get; set; } = new List<Inmueble>();
}
