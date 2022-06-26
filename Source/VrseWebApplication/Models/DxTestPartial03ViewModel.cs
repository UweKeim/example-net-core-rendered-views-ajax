namespace VrseWebApplication.Models;

using System.ComponentModel.DataAnnotations;

public sealed class DxTestPartial03ViewModel
{
    [Required, Range(1, 1000)]  public int Id { get; set; }
}