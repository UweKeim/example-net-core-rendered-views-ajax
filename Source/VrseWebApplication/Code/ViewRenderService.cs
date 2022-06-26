namespace VrseWebApplication.Code;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

public interface IViewRenderService
{
    /// <summary>
    /// <para>Ein Aufruf dieser Methode ist immer dann sinnvoll, wenn neben dem eigentlichen HTML eines Partials noch
    /// JSON aus einer Action zurück gegeben werden soll. Der Rückgabewert dieses Methodenaufrufs kann dann z. B.
    /// als eine "html"-Property im JSON zurück gegeben werden.</para>
    /// 
    /// <para>Wenn ausschließlich das HTML eines Partials zurück gegeben werden soll, also kein zusätzliches JSON,
    /// dann reicht ein "return PartialView(...)" aus der Action heraus aus, und diese Methode wird nicht benötigt.</para>
    /// </summary>
    Task<string> RenderPartialView(
        ControllerBase controller,
        [AspMvcPartialView] string viewPath,
        object model,
        ViewDataDictionary? viewData = null);
}

public sealed class ViewRenderService : IViewRenderService
{
    private readonly IRazorViewEngine _razorViewEngine;
    private readonly ITempDataProvider _tempDataProvider;
    private readonly HttpContext? _context;

    public ViewRenderService(
        IRazorViewEngine razorViewEngine,
        ITempDataProvider tempDataProvider,
        IHttpContextAccessor accessor)
    {
        _razorViewEngine = razorViewEngine;
        _tempDataProvider = tempDataProvider;
        _context = accessor.HttpContext;
    }

    /// <inheritdoc cref="IViewRenderService.RenderPartialView"/>
    public async Task<string> RenderPartialView(
        ControllerBase controller,
        [AspMvcPartialView] string viewPath,
        object model,
        ViewDataDictionary? viewData = null)
    {
        var actionContext = controller.ControllerContext;

        await using var sw = new StringWriter();
        var viewResult = _razorViewEngine.FindView(actionContext, viewPath, false);
        if (!viewResult.Success)
        {
            // https://stackoverflow.com/questions/62900334/irazorviewengine-findview-with-getview-cant-find-view
            viewResult = _razorViewEngine.GetView(executingFilePath: null, viewPath: viewPath, isMainPage: false);
        }

        if (!viewResult.Success)
        {
            var msg = new StringBuilder();
            msg.AppendLine($@"{viewPath} does not match any available view.");
            msg.AppendLine(@"SearchedLocations:");
            msg.AppendLine(string.Join($@"{Environment.NewLine}", viewResult.SearchedLocations));

            throw new Exception(msg.ToString());
        }

        var viewDictionary =
            viewData ?? new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary());
        viewDictionary.Model = model;

        var viewContext =
            new ViewContext(actionContext, viewResult.View, viewDictionary,
                new TempDataDictionary(actionContext.HttpContext, _tempDataProvider),
                sw, new HtmlHelperOptions())
            {
                RouteData = _context?.GetRouteData() ?? new RouteData()
            };

        await viewResult.View.RenderAsync(viewContext);
        return sw.ToString();
    }
}