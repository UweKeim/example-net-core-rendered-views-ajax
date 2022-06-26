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
                Id = 1,
                Name = "Anton"
            },
            new()
            {
                Id = 2,
                Name = "Berta"
            },
            new()
            {
                Id = 3,
                Name = "Cäsar"
            },
            new()
            {
                Id = 4,
                Name = "Dora"
            },
        };

        return Json(DataSourceLoader.Load(all, loadOptions));
    }
}