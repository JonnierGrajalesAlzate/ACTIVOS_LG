using System.Text;
using ActivosLG.Api.Data;
using ActivosLG.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

if (File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";

var jwtSecret = builder.Configuration["JWT_SECRET"]
    ?? throw new InvalidOperationException("JWT_SECRET no esta configurada. Revisa el archivo .env");

builder.Services.AddOpenApi();
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Sin este flag, ASP.NET Core remapea claims cortos (sub, email, role) a los
        // URI largos de ClaimTypes de forma implicita y dependiente de la version.
        // Lo desactivamos y usamos los nombres literales en AuthEndpoints en ambos sentidos.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization(options =>
{
    // Todo endpoint requiere sesion salvo que se marque explicitamente .AllowAnonymous().
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
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

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapDatabaseEndpoints();
app.MapInmueblesEndpoints();
app.MapEgresosEndpoints();
app.MapArrendadoresEndpoints();
app.MapArrendatariosEndpoints();
app.MapContratosEndpoints();
app.MapResumenEndpoints();
app.MapReportesEndpoints();
app.MapParametrosEndpoints();

app.Run();
