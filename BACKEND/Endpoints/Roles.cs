using System.Security.Claims;

namespace ActivosLG.Api.Endpoints;

/// <summary>
/// Roles de la columna usuario.rol. Cualquier sesion puede consultar; los cambios dependen del rol:
/// - admin: todo.
/// - admin_inmobiliario: gestiona inmuebles, contratos, egresos y contrapartes, pero no proyectos,
///   etapas ni parametros (IPC).
/// - lectura: solo consulta.
/// </summary>
public static class Roles
{
    public const string Admin = "admin";
    public const string AdministradorInmobiliario = "admin_inmobiliario";
    public const string Lectura = "lectura";

    // Mismo nombre literal con el que AuthEndpoints emite el claim (MapInboundClaims = false).
    private const string RolClaimType = "role";

    private static string? De(ClaimsPrincipal user) => user.FindFirst(RolClaimType)?.Value;

    private static IResult Prohibido(string message) => Results.Json(new { message }, statusCode: StatusCodes.Status403Forbidden);

    /// <summary>En el grupo, las consultas (GET) quedan libres y los cambios exigen admin o administrador inmobiliario.</summary>
    public static RouteGroupBuilder CambiosSoloGestores(this RouteGroupBuilder group) =>
        group.AddEndpointFilter(async (ctx, next) =>
            HttpMethods.IsGet(ctx.HttpContext.Request.Method) || De(ctx.HttpContext.User) is Admin or AdministradorInmobiliario
                ? await next(ctx)
                : Prohibido("Tu usuario es de solo lectura: no puede registrar ni modificar informacion."));

    /// <summary>El endpoint solo lo puede usar un administrador.</summary>
    public static TBuilder SoloAdmin<TBuilder>(this TBuilder builder) where TBuilder : IEndpointConventionBuilder =>
        builder.AddEndpointFilter(async (ctx, next) =>
            De(ctx.HttpContext.User) == Admin
                ? await next(ctx)
                : Prohibido("Solo un administrador puede hacer este cambio."));
}
