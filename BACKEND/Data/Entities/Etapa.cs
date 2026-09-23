using System;
using System.Collections.Generic;

namespace ActivosLG.Api.Data.Entities;

public partial class Etapa
{
    public int Id { get; set; }

    public int IdProyecto { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual Proyecto IdProyectoNavigation { get; set; } = null!;

    public virtual ICollection<Inmueble> Inmuebles { get; set; } = new List<Inmueble>();
}
