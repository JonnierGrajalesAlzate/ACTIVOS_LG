using ActivosLG.Api.Data;
using ActivosLG.Api.Endpoints;

if (File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDatabaseEndpoints();

app.Run();
