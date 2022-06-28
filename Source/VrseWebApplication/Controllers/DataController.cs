namespace VrseWebApplication.Controllers;

using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Models;

public sealed class DataController : Controller
{
    public IActionResult LoadAllData01(DataSourceLoadOptions loadOptions)
    {
        var all = new List<Data01Model>
        {
            new()
            {
                id = 1,
                name = "Anton"
            },
            new()
            {
                id = 2,
                name = "Berta"
            },
            new()
            {
                id = 3,
                name = "Cäsar"
            },
            new()
            {
                id = 4,
                name = "Dora"
            },
        };

        return Json(DataSourceLoader.Load(all, loadOptions));
    }
}