using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Proyecto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Inmueble> Inmuebles { get; set; } = new List<Inmueble>();
}
