using ActivosLG.Api.Data;

namespace ActivosLG.Api.Endpoints;

public static class DatabaseEndpoints
{
    public static void MapDatabaseEndpoints(this WebApplication app)
    {
        app.MapGet("/db-check", async (IDbConnectionFactory factory) =>
        {
            try
            {
                await using var connection = factory.CreateConnection();
                await connection.OpenAsync();
                return Results.Ok(new
                {
                    status = "ok",
                    server = connection.DataSource,
                    database = connection.Database
                });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("DbCheck")
        .WithTags("Database");
    }
}
