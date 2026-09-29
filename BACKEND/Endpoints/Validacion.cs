namespace ActivosLG.Api.Endpoints;

/// <summary>Utilidades de validacion para los endpoints de alta.</summary>
public static class Validacion
{
    /// <summary>Texto recortado, o null si viene vacio.</summary>
    public static string? Texto(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    /// <summary>Primer campo que supera su largo maximo de columna, en formato de mensaje.</summary>
    public static string? ExcedeLargo(params (string Campo, string? Valor, int Maximo)[] campos)
    {
        foreach (var (campo, valor, maximo) in campos)
        {
            if (valor is not null && valor.Length > maximo)
                return $"{campo} no puede superar {maximo} caracteres.";
        }
        return null;
    }

    public static IResult Error(string mensaje) => Results.BadRequest(new { message = mensaje });
}
