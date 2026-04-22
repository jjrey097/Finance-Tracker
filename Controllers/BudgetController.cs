using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirstValue("sub") ?? "dev-user";

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? month, [FromQuery] int? year)
    {
        int m = month ?? DateTime.Today.Month;
        int y = year  ?? DateTime.Today.Year;
        var budget = await db.Budgets.FirstOrDefaultAsync(b => b.UserId == UserId && b.Month == m && b.Year == y);
        return Ok(budget);
    }

    [HttpPut]
    public async Task<IActionResult> Set(Budget incoming)
    {
        var existing = await db.Budgets
            .FirstOrDefaultAsync(b => b.UserId == UserId && b.Month == incoming.Month && b.Year == incoming.Year);

        if (existing is null)
        {
            incoming.UserId = UserId;
            db.Budgets.Add(incoming);
        }
        else
        {
            existing.MonthlyLimit = incoming.MonthlyLimit;
        }

        await db.SaveChangesAsync();
        return Ok(incoming);
    }
}
