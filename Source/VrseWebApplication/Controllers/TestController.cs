namespace VrseWebApplication.Controllers;

using Code;
using Models;

public sealed class TestController : Controller
{
    private readonly ILogger _logger;
    private readonly IViewRenderService _viewRenderer;

    public TestController(
        ILogger<TestController> logger,
        IViewRenderService viewRenderer)
    {
        _logger = logger;
        _viewRenderer = viewRenderer;
    }

    [HttpGet]
    public IActionResult Test01()
    {
        return View();
    }

    [HttpGet]
    public IActionResult Test02()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> GetPartialView01(int id)
    {
        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/PartialView01", id, ViewData)
            });
    }

    [HttpPost]
    public async Task<IActionResult> GetPartialView02(int id)
    {
        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/PartialView02", id, ViewData)
            });
    }

    [HttpPost]
    public async Task<IActionResult> GetPartialView03(int id)
    {
        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/PartialView03",
                    new TestPartial03ViewModel { Id = id }, ViewData)
            });
    }

    [HttpPost]
    public async Task<IActionResult> PostPartialView03(TestPartial03ViewModel model)
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
                    html = await _viewRenderer.RenderPartialView(this, @"Partials/PartialView03", model, ViewData)
                });
        }

        return Json(
            new
            {
                html = await _viewRenderer.RenderPartialView(this, @"Partials/PartialView04", model.Id, ViewData)
            });
    }
}