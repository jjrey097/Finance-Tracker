namespace FinanceTracker.Api.Models;

using System.Text.Json.Serialization;

public class Transaction
{
    public int Id { get; set; }
    [JsonPropertyName("date")]
    public DateTime Date { get; set; } = DateTime.Today;
    [JsonPropertyName("transactionType")]
    public string TransactionType { get; set; } = string.Empty;  // "Income", "Savings", "Expense"
    [JsonPropertyName("expenseCategory")]
    public string? ExpenseCategory { get; set; }
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
    [JsonPropertyName("paymentMethod")]
    public string PaymentMethod { get; set; } = string.Empty;
    [JsonPropertyName("note")]
    public string? Note { get; set; }
}
