using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Marca
{
    public int Id { get; set; }

    public int? IdCategoria { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Clasificacion { get; set; }

    public virtual ICollection<ContratosArrendamiento> ContratosArrendamientos { get; set; } = new List<ContratosArrendamiento>();

    public virtual CategoriaMarca? IdCategoriaNavigation { get; set; }
}
