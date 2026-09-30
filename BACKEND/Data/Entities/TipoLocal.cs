using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class TipoLocal
{
    public int Id { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<Inmueble> Inmuebles { get; set; } = new List<Inmueble>();
}
