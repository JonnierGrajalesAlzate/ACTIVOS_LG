using ActivosLG.Api.Data;
using ActivosLG.Api.Endpoints;
using Microsoft.EntityFrameworkCore;

if (File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";

builder.Services.AddOpenApi();
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
// La base es Azure SQL serverless: se auto-pausa por inactividad y el primer
// intento tras la pausa falla mientras el servidor se reanuda. Los reintentos
// con espera y el timeout amplio absorben ese arranque en frio.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration["CONNECTION_STRING"], sql =>
    {
        sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(15), errorNumbersToAdd: null);
        sql.CommandTimeout(90);
    }));
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(FrontendCorsPolicy);

app.MapDatabaseEndpoints();
app.MapInmueblesEndpoints();
app.MapEgresosEndpoints();
app.MapArrendadoresEndpoints();
app.MapArrendatariosEndpoints();
app.MapContratosEndpoints();
app.MapResumenEndpoints();
app.MapReportesEndpoints();

app.Run();
