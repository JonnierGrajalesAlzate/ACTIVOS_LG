using ActivosLG.Api.Data;
using ActivosLG.Api.Data.Entities;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Endpoints;

public static class ParametrosEndpoints
{
    public static void MapParametrosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/parametros").WithTags("Parametros");

        group.MapGet("/ipc", async (ApplicationDbContext db) =>
        {
            var p = await db.Parametros.FirstOrDefaultAsync(x => x.Clave == Negocio.ParametroIpc);
            // Se expone en porcentaje (5,2), igual que se captura.
            return Results.Ok(new IpcDto(p?.Valor * 100, p?.FechaActualizacion, p?.ActualizadoPor));
        })
        .WithName("GetIpc");

        group.MapPut("/ipc", async (ActualizarIpcDto request, ApplicationDbContext db, HttpContext http) =>
        {
            if (request.Valor is <= 0 or > 50)
                return Results.BadRequest(new { message = "El IPC debe ser un porcentaje entre 0 y 50." });

            var p = await db.Parametros.FirstOrDefaultAsync(x => x.Clave == Negocio.ParametroIpc);
            if (p is null)
            {
                p = new Parametro { Clave = Negocio.ParametroIpc, Descripcion = "IPC anual vigente (DANE) usado para el incremento de canon" };
                db.Parametros.Add(p);
            }

            p.Valor = Math.Round(request.Valor / 100m, 4);
            p.FechaActualizacion = DateTime.UtcNow;
            p.ActualizadoPor = http.User.FindFirst("email")?.Value;
            await db.SaveChangesAsync();

            return Results.Ok(new IpcDto(p.Valor * 100, p.FechaActualizacion, p.ActualizadoPor));
        })
        .WithName("ActualizarIpc")
        .SoloAdmin();
    }
}
