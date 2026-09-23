namespace ActivosLG.Api.Endpoints;

/// <summary>Reglas de negocio compartidas por los endpoints.</summary>
public static class Negocio
{
    /// <summary>Horizonte para considerar que un contrato esta "por vencer".</summary>
    public const int DiasAlertaVencimiento = 120;

    /// <summary>Con cuantos dias de anticipacion se notifica un incremento de canon por IPC.</summary>
    public const int DiasAvisoIncremento = 60;

    /// <summary>
    /// El estado del inmueble lo manda el catalogo `estado` (dato de negocio), no se deduce de las
    /// fechas del contrato: un contrato vencido significa renovacion pendiente, no que el local este vacante.
    /// </summary>
    public const string EstadoArrendado = "Arrendado";

    /// <summary>Clave en la tabla `parametro` del IPC anual vigente (fraccion: 0.052 = 5,2 %).</summary>
    public const string ParametroIpc = "IPC_ANUAL";

    public static bool EsIncrementoIpc(string? tipoIncremento) =>
        tipoIncremento is not null && tipoIncremento.Contains("IPC", StringComparison.OrdinalIgnoreCase);

    /// <summary>Canon tras el incremento anual: canon x (1 + IPC + puntos adicionales), redondeado al peso.</summary>
    public static decimal CanonConIncremento(decimal canon, decimal ipc, decimal? puntosAdicionales) =>
        Math.Round(canon * (1 + ipc + (puntosAdicionales ?? 0m)), 0, MidpointRounding.AwayFromZero);
}
