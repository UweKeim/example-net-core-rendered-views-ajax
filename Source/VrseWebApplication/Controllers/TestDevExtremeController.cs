namespace VrseWebApplication.Controllers;

using Code;
using Models;

public sealed class TestDevExtremeController : Controller
{
    private readonly ILogger _logger;
    private readonly IViewRenderService _viewRenderer;

    public TestDevExtremeController(
        ILogger<TestDevExtremeController> logger,
        IViewRenderService viewRenderer)
    {
        _logger = logger;
        _viewRenderer = viewRenderer;
    }

    [HttpGet]
    public IActionResult DxTest01()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> GetPartialView01(int id)
    {
        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/DxPartialView01",
                    new DxTestPartial01ViewModel { Id = id }, ViewData)
            });
    }

    [HttpPost]
    public async Task<IActionResult> DxPostPartialView01(DxTestPartial01ViewModel model)
    {
        if (model.Id <= 0)
        {
            ModelState.AddModelError(string.Empty, "Value must be greater than zero.");
        }

        if (!ModelState.IsValid)
        {
            return Json(
                new
                {
                    error = true,
                    html = await _viewRenderer.RenderPartialView(this, @"Partials/DxPartialView01", model, ViewData)
                });
        }

        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/DxPartialView02", model.Id, ViewData)
            });
    }
}