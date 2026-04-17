using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite("Data Source=finance.db"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(opt =>
    opt.AddPolicy("Dev", p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyMethod()
         .AllowAnyHeader()));

var app = builder.Build();

// Ensure the database schema is current. If the schema is missing or out of date
// (e.g. after a model change), the database is automatically recreated.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.EnsureCreated();
        _ = db.Transactions.Count(); // verify schema is actually in place
    }
    catch
    {
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }
}

app.UseCors("Dev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve static files from wwwroot
app.UseStaticFiles();

app.MapControllers();

// SPA fallback - serve index.html for any non-API routes
app.MapFallbackToFile("index.html");

app.Run();