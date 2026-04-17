namespace FinanceTracker.Api.Models;

public class Budget
{
    public int Id { get; set; }
    public decimal MonthlyLimit { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}