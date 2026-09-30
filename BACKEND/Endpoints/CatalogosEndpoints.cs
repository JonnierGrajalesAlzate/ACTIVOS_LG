using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

/// <summary>Listas para los desplegables de los formularios de alta.</summary>
public static class CatalogosEndpoints
{
    public static void MapCatalogosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/catalogos").WithTags("Catalogos");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var proyectos = await db.Proyectos.OrderBy(x => x.Nombre).Select(x => new OpcionDto(x.Id, x.Nombre)).ToListAsync();
            var etapas = await db.Etapas.OrderBy(x => x.Nombre).Select(x => new EtapaOpcionDto(x.Id, x.IdProyecto, x.Nombre)).ToListAsync();
            var estados = await db.Estados.OrderBy(x => x.Descripcion).Select(x => new OpcionDto(x.Id, x.Descripcion)).ToListAsync();
            var destinaciones = await db.Destinacions.OrderBy(x => x.Descripcion).Select(x => new OpcionDto(x.Id, x.Descripcion)).ToListAsync();
            var tiposLocal = await db.TipoLocals.OrderBy(x => x.Descripcion).Select(x => new OpcionDto(x.Id, x.Descripcion)).ToListAsync();
            var tiposInmueble = await db.TipoInmuebles.OrderBy(x => x.Descripcion).Select(x => new OpcionDto(x.Id, x.Descripcion)).ToListAsync();
            var marcas = await db.Marcas.OrderBy(x => x.Nombre).Select(x => new OpcionDto(x.Id, x.Nombre)).ToListAsync();
            var seguros = await db.Seguros.OrderBy(x => x.Nombre).Select(x => new OpcionDto(x.Id, x.Nombre)).ToListAsync();
            var arrendadores = await db.Arrendadors.OrderBy(x => x.Nombre).Select(x => new ContraparteDto(x.Nit, x.Nombre)).ToListAsync();
            var arrendatarios = await db.Arrendatarios.OrderBy(x => x.Nombre).Select(x => new ContraparteDto(x.Nit, x.Nombre)).ToListAsync();

            return Results.Ok(new CatalogosDto(
                proyectos, etapas, estados, destinaciones, tiposLocal, tiposInmueble,
                marcas, seguros, arrendadores, arrendatarios));
        })
        .WithName("GetCatalogos");

        group.MapGet("/inmuebles", async (ApplicationDbContext db, int? proyecto) =>
        {
            var query = db.Inmuebles.AsQueryable();
            if (proyecto.HasValue)
                query = query.Where(i => i.IdProyecto == proyecto.Value);

            // Canon actual = contrato mas reciente, igual que el listado de /api/inmuebles.
            var items = await query
                .OrderBy(i => i.IdProyectoNavigation.Nombre).ThenBy(i => i.NumeroLocal)
                .Select(i => new InmuebleOpcionDto(
                    i.Id,
                    (i.IdTipoLocalNavigation.Descripcion + " " + i.NumeroLocal).Trim(),
                    i.IdProyecto,
                    i.IdProyectoNavigation.Nombre,
                    i.MatriculaInmobiliaria,
                    i.AreaPiso1,
                    i.ValorComercial,
                    i.PredialAnual,
                    i.ContratosArrendamientos
                        .OrderByDescending(c => c.FechaContrato)
                        .Select(c => c.CanonActualMensual)
                        .FirstOrDefault(),
                    i.EgresosMensuales.Any(),
                    i.NitPropietario,
                    i.NitPropietarioNavigation != null ? i.NitPropietarioNavigation.Nombre : null))
                .ToListAsync();

            return Results.Ok(items);
        })
        .WithName("GetCatalogoInmuebles");
    }
}
