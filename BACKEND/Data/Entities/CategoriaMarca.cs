using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class CategoriaMarca
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();
}
