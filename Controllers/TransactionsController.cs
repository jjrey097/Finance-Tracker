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
public class TransactionsController(AppDbContext db) : ControllerBase
{
    private static readonly string[] MonthNames =
        ["", "January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"];

    private string UserId => User.FindFirstValue("sub") ?? "dev-user";

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Transactions
            .Where(t => t.UserId == UserId)
            .OrderByDescending(t => t.Date)
            .ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Add(Transaction t)
    {
        if (string.IsNullOrWhiteSpace(t.TransactionType))
            return BadRequest("TransactionType is required.");
        if (t.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");
        if (t.TransactionType == "Expense" && string.IsNullOrWhiteSpace(t.PaymentMethod))
            return BadRequest("PaymentMethod is required for Expense transactions.");
        if (t.TransactionType == "Expense" && string.IsNullOrWhiteSpace(t.ExpenseCategory))
            return BadRequest("ExpenseCategory is required for Expense transactions.");

        t.UserId = UserId;
        db.Transactions.Add(t);
        await db.SaveChangesAsync();
        return Ok(t);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Transaction updated)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (t is null) return NotFound();

        if (string.IsNullOrWhiteSpace(updated.TransactionType))
            return BadRequest("TransactionType is required.");
        if (updated.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");
        if (updated.TransactionType == "Expense" && string.IsNullOrWhiteSpace(updated.PaymentMethod))
            return BadRequest("PaymentMethod is required for Expense transactions.");
        if (updated.TransactionType == "Expense" && string.IsNullOrWhiteSpace(updated.ExpenseCategory))
            return BadRequest("ExpenseCategory is required for Expense transactions.");

        t.Date = updated.Date;
        t.TransactionType = updated.TransactionType;
        t.ExpenseCategory = updated.TransactionType == "Expense" ? updated.ExpenseCategory : null;
        t.Amount = updated.Amount;
        t.PaymentMethod = updated.PaymentMethod;
        t.Note = updated.Note;

        await db.SaveChangesAsync();
        return Ok(t);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (t is null) return NotFound();
        db.Transactions.Remove(t);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("annual-summary")]
    public async Task<IActionResult> AnnualSummary([FromQuery] int? year)
    {
        int y = year ?? DateTime.Today.Year;

        var txs = await db.Transactions
            .Where(t => t.UserId == UserId && t.Date.Year == y)
            .ToListAsync();

        var months = Enumerable.Range(1, 12).Select(m =>
        {
            var monthTxs = txs.Where(t => t.Date.Month == m).ToList();
            var income   = monthTxs.Where(t => t.TransactionType == "Income") .Sum(t => t.Amount);
            var expenses = monthTxs.Where(t => t.TransactionType == "Expense").Sum(t => t.Amount);
            var savings  = monthTxs.Where(t => t.TransactionType == "Savings").Sum(t => t.Amount);

            var breakdown = monthTxs
                .Where(t => t.TransactionType == "Expense")
                .GroupBy(t => t.ExpenseCategory ?? "other")
                .Select(g => new { category = g.Key, total = g.Sum(t => t.Amount) })
                .OrderByDescending(x => x.total)
                .ToList<object>();

            return new
            {
                month     = m,
                monthName = MonthNames[m],
                income,
                expenses,
                savings,
                remaining = income - (expenses + savings),
                expenseBreakdown = breakdown
            };
        }).ToList();

        var totals = new
        {
            income    = months.Sum(m => m.income),
            expenses  = months.Sum(m => m.expenses),
            savings   = months.Sum(m => m.savings),
            remaining = months.Sum(m => m.remaining)
        };

        return Ok(new { year = y, months, totals });
    }
}
