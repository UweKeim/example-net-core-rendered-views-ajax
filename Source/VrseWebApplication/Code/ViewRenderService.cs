namespace VrseWebApplication.Code;

using JetBrains.Annotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Text;

public interface IViewRenderService
{
    /// <summary>
    /// <para>Calling this method is always useful if JSON from an action is to be returned in addition to
    /// the actual HTML of a partial. The return value of this method call can then be returned as an "html" 
    /// property in JSON, for example.</para>
    /// 
    /// <para>If only the HTML of a partial is to be returned, i.e. no additional JSON, then a 
    /// "return PartialView(...)" from the action is sufficient and this method is not needed.</para>
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
