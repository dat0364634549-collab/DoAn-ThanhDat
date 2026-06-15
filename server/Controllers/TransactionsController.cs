using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }
            return transaction;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByUserId(int userId)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Transaction>> CreateTransaction(Transaction transaction)
        {
            if (string.IsNullOrWhiteSpace(transaction.Products))
            {
                return BadRequest(new { error = "Order must contain at least one product" });
            }

            if (transaction.TotalAmount <= 0)
            {
                return BadRequest(new { error = "Total amount is invalid" });
            }

            transaction.Date = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            transaction.Status = string.IsNullOrWhiteSpace(transaction.Status) ? "pending" : transaction.Status;
            transaction.PaymentMethod = string.IsNullOrWhiteSpace(transaction.PaymentMethod) ? "cod" : transaction.PaymentMethod;
            _context.Transactions.Add(transaction);
            
            if (!string.IsNullOrEmpty(transaction.Products) && transaction.Status != "payment_pending")
            {
                try
                {
                    var products = System.Text.Json.JsonSerializer.Deserialize<List<ProductSale>>(transaction.Products);
                    if (products != null)
                    {
                        foreach (var product in products)
                        {
                            var dbProduct = await _context.Products.FindAsync(product.productId);
                            if (dbProduct != null)
                            {
                                dbProduct.TotalSold += product.quantity;
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    return StatusCode(500, new { error = "Error updating product sales" });
                }
            }
            
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        [HttpGet("revenue")]
        public async Task<ActionResult<decimal>> GetTotalRevenue()
        {
            var total = await _context.Transactions.SumAsync(t => t.TotalAmount);
            return total;
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetRecentTransactions([FromQuery] int limit = 5)
        {
            return await _context.Transactions
                .OrderByDescending(t => t.Date)
                .Take(limit)
                .ToListAsync();
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<Transaction>> UpdateTransactionStatus(int id, [FromBody] TransactionStatusUpdate statusUpdate)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            transaction.Status = statusUpdate.Status;
            await _context.SaveChangesAsync();

            return transaction;
        }

        public class TransactionStatusUpdate
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpGet("statistics/revenue-by-date")]
        public async Task<ActionResult<object>> GetRevenueByDate([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            var transactions = await _context.Transactions.ToListAsync();
            
            if (!string.IsNullOrEmpty(startDate))
            {
                transactions = transactions.Where(t => string.Compare(t.Date, startDate) >= 0).ToList();
            }
            
            if (!string.IsNullOrEmpty(endDate))
            {
                transactions = transactions.Where(t => string.Compare(t.Date, endDate) <= 0).ToList();
            }

            var revenueByDate = transactions
                .GroupBy(t => t.Date)
                .Select(g => new { 
                    Date = g.Key, 
                    Revenue = g.Sum(t => t.TotalAmount),
                    Orders = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToList();

            return Ok(revenueByDate);
        }

        [HttpGet("statistics/revenue-by-month")]
        public async Task<ActionResult<object>> GetRevenueByMonth([FromQuery] int? year)
        {
            var transactions = await _context.Transactions.ToListAsync();
            
            var filteredTransactions = transactions;
            if (year.HasValue)
            {
                filteredTransactions = transactions.Where(t => t.Date.StartsWith(year.Value.ToString())).ToList();
            }

            var revenueByMonth = filteredTransactions
                .GroupBy(t => t.Date.Length >= 7 ? t.Date.Substring(0, 7) : t.Date)
                .Select(g => new { 
                    Month = g.Key,
                    Revenue = g.Sum(t => t.TotalAmount),
                    Orders = g.Count()
                })
                .OrderBy(x => x.Month)
                .ToList();

            return Ok(revenueByMonth);
        }

        [HttpGet("statistics/best-selling-products")]
        public async Task<ActionResult<object>> GetBestSellingProducts([FromQuery] int limit = 10)
        {
            try
            {
                var bestSelling = await _context.Products
                    .Where(p => p.TotalSold > 0)
                    .OrderByDescending(p => p.TotalSold)
                    .Take(limit)
                    .Select(p => new {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        TotalQuantity = p.TotalSold,
                        TotalRevenue = p.Price * p.TotalSold
                    })
                    .ToListAsync();

                return Ok(bestSelling);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Error retrieving best selling products" });
            }
        }

        private class ProductSale
        {
            public int productId { get; set; }
            public string productName { get; set; } = string.Empty;
            public int quantity { get; set; }
            public decimal price { get; set; }
        }
    }
}
