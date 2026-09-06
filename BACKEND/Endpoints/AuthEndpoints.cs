using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ActivosLG.Api.Data;
using ActivosLG.Api.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ActivosLG.Api.Endpoints;

public static class AuthEndpoints
{
    private const string RolClaimType = "role";

    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequestDto request, ApplicationDbContext db, IConfiguration config) =>
        {
            var email = request.Email?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { message = "Email y contrasena son obligatorios." });
            }

            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == email && u.Activo);
            if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var (token, expiraEn) = GenerarToken(usuario.Id, usuario.Email, usuario.Nombre, usuario.Rol, config);

            return Results.Ok(new LoginResponseDto(
                token,
                expiraEn,
                new UsuarioDto(usuario.Id, usuario.Email, usuario.Nombre, usuario.Rol)));
        })
        .AllowAnonymous()
        .WithName("Login");

        group.MapGet("/me", (ClaimsPrincipal user) =>
        {
            var id = int.Parse(user.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
            var email = user.FindFirstValue(JwtRegisteredClaimNames.Email)!;
            var nombre = user.FindFirstValue(JwtRegisteredClaimNames.Name)!;
            var rol = user.FindFirstValue(RolClaimType)!;

            return Results.Ok(new UsuarioDto(id, email, nombre, rol));
        })
        .WithName("Me");
    }

    private static (string Token, DateTime ExpiraEn) GenerarToken(int id, string email, string nombre, string rol, IConfiguration config)
    {
        var secret = config["JWT_SECRET"]
            ?? throw new InvalidOperationException("JWT_SECRET no esta configurada. Revisa el archivo .env");

        var expiraEn = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Name, nombre),
            new Claim(RolClaimType, rol),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiraEn,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEn);
    }
}
