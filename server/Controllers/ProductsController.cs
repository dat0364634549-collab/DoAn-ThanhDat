using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProductsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return product;
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(string category)
        {
            var products = await _context.Products
                .Where(p => p.Category == category)
                .ToListAsync();
            return products;
        }

        [HttpGet("hot")]
        public async Task<ActionResult<IEnumerable<Product>>> GetHotProducts()
        {
            var products = await _context.Products
                .Where(p => p.IsHot == true)
                .ToListAsync();
            return products;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Product>>> SearchProducts([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await _context.Products.ToListAsync();
            }

            var products = await _context.Products
                .Where(p => p.Name.Contains(query) || p.Description.Contains(query))
                .ToListAsync();
            return products;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            existingProduct.Name = product.Name?.Trim() ?? string.Empty;
            existingProduct.Description = product.Description?.Trim() ?? string.Empty;
            existingProduct.Price = product.Price;
            existingProduct.Category = product.Category;
            existingProduct.Image = string.IsNullOrWhiteSpace(product.Image) ? existingProduct.Image : product.Image;
            existingProduct.IsHot = product.IsHot;
            existingProduct.Discount = product.Discount;
            existingProduct.Stock = product.Stock;
            existingProduct.TotalSold = product.TotalSold;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ProductExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<ActionResult<string>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Không có file nào được upload!" });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)!" });
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "Kích thước file không được vượt quá 5MB!" });
            }

            var uploadsRoot = Environment.GetEnvironmentVariable("UPLOADS_PATH");
            var uploadsFolder = !string.IsNullOrWhiteSpace(uploadsRoot)
                ? uploadsRoot
                : Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "images"));
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var publicPath = !string.IsNullOrWhiteSpace(uploadsRoot)
                ? $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}"
                : $"images/{uniqueFileName}";

            return Ok(new { path = publicPath });
        }

        private async Task<bool> ProductExists(int id)
        {
            return await _context.Products.AnyAsync(e => e.Id == id);
        }
    }
}
