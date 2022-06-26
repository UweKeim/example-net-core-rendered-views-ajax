namespace VrseWebApplication.Code;

public static class Cnh
{
    /// <summary>
    /// Hilfsroutine um "nameof(MyController)" beim Routing und Action-Building
    /// verwenden zu können. Entfernt das "Controller"-Suffix von einer Zeichenfolge.
    /// </summary>
    public static string Cn(this string fullControllerClassName)
    {
        const string suffix = @"Controller";

        return fullControllerClassName.EndsWith(suffix)
            ? fullControllerClassName[..^suffix.Length]
            : fullControllerClassName;
    }
}