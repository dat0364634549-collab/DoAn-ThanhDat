using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using server.Data;
using server.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    var port = Environment.GetEnvironmentVariable("PORT");
    serverOptions.ListenAnyIP(int.TryParse(port, out var parsedPort) ? parsedPort : 3900);
});

var databasePath = Environment.GetEnvironmentVariable("DATABASE_PATH");
var connectionString = !string.IsNullOrWhiteSpace(databasePath)
    ? $"Data Source={databasePath}"
    : builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();
var webRootPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, ".."));
var uploadsPath = Environment.GetEnvironmentVariable("UPLOADS_PATH");
var uploadRootPath = !string.IsNullOrWhiteSpace(uploadsPath)
    ? uploadsPath
    : Path.Combine(webRootPath, "images");

if (!string.IsNullOrWhiteSpace(databasePath))
{
    var persistentDatabasePath = Path.GetFullPath(databasePath);
    var persistentDatabaseDirectory = Path.GetDirectoryName(persistentDatabasePath);
    if (!string.IsNullOrWhiteSpace(persistentDatabaseDirectory))
    {
        Directory.CreateDirectory(persistentDatabaseDirectory);
    }

    var bundledDatabasePath = Path.Combine(app.Environment.ContentRootPath, "database.db");
    if (!File.Exists(persistentDatabasePath) && File.Exists(bundledDatabasePath))
    {
        File.Copy(bundledDatabasePath, persistentDatabasePath);
    }
}

Directory.CreateDirectory(uploadRootPath);

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();

    void AddColumnIfMissing(string table, string column, string definition)
    {
        var connection = dbContext.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            connection.Open();
        }

        using var checkCommand = connection.CreateCommand();
        checkCommand.CommandText = $"PRAGMA table_info({table})";
        using var reader = checkCommand.ExecuteReader();
        var exists = false;
        while (reader.Read())
        {
            if (string.Equals(reader["name"]?.ToString(), column, StringComparison.OrdinalIgnoreCase))
            {
                exists = true;
                break;
            }
        }
        reader.Close();

        if (!exists)
        {
            using var alterCommand = connection.CreateCommand();
            alterCommand.CommandText = $"ALTER TABLE {table} ADD COLUMN {column} {definition}";
            alterCommand.ExecuteNonQuery();
        }
    }

    AddColumnIfMissing("transactions", "customerName", "TEXT NOT NULL DEFAULT ''");
    AddColumnIfMissing("transactions", "customerEmail", "TEXT NOT NULL DEFAULT ''");
    AddColumnIfMissing("transactions", "customerPhone", "TEXT NOT NULL DEFAULT ''");
    AddColumnIfMissing("transactions", "shippingAddress", "TEXT NOT NULL DEFAULT ''");
    AddColumnIfMissing("transactions", "paymentMethod", "TEXT NOT NULL DEFAULT ''");
    AddColumnIfMissing("transactions", "note", "TEXT NOT NULL DEFAULT ''");
    
    if (!dbContext.Products.Any())
    {
        dbContext.Products.AddRange(
            new Product { Name = "MLB - Áo thun nam nữ cổ tròn Graphic Tee", Description = "Áo thun nam nữ cổ tròn Graphic Tee thiết kế trẻ trung, năng động, chất liệu cotton mềm mại, thoáng mát.", Price = 349000, Category = "ao-thun", Image = "images/mlb3.jpg", IsHot = true, Discount = 0, Stock = 50 },
            new Product { Name = "MLB - Áo thun nam nữ cổ tròn Oversized", Description = "Áo thun nam nữ cổ tròn Oversized phong cách hiện đại, form rộng thoải mái, dễ phối đồ.", Price = 449000, Category = "ao-thun", Image = "images/mlb4.jpg", IsHot = true, Discount = 0, Stock = 45 },
            new Product { Name = "MLB - Áo sơ mi nam nữ dài tay", Description = "Áo sơ mi nam nữ dài tay sang trọng, lịch sự, phù hợp đi làm và dạo phố.", Price = 499000, Category = "ao-thun", Image = "images/mlb1.jpg", IsHot = false, Discount = 10, Stock = 30 },
            new Product { Name = "MLB - Quần thun nam nữ ống bó Basic", Description = "Quần thun nam nữ ống bó Basic thiết kế cơ bản, thoải mái, dễ mix đồ cho mọi hoạt động.", Price = 399000, Category = "quan-thun", Image = "images/mlb7.jpg", IsHot = true, Discount = 0, Stock = 60 },
            new Product { Name = "MLB - Quần thun nam nữ ống bó Logo Print", Description = "Quần thun nam nữ ống bó Logo Print nổi bật với họa tiết logo MLB, phong cách thể thao.", Price = 449000, Category = "quan-thun", Image = "images/mlb8.jpg", IsHot = false, Discount = 5, Stock = 40 },
            new Product { Name = "MLB - Quần thun nam nữ ống bó Graphic", Description = "Quần thun nam nữ ống bó Graphic với họa tiết độc đáo, cá tính, thích hợp cho giới trẻ.", Price = 349000, Category = "quan-thun", Image = "images/mlb9.jpg", IsHot = true, Discount = 0, Stock = 55 },
            new Product { Name = "MLB - Quần thun nam nữ ống bó Classic", Description = "Quần thun nam nữ ống bó Classic phong cách cổ điển, màu sắc trung tính, dễ phối đồ.", Price = 399000, Category = "quan-thun", Image = "images/mlb7.jpg", IsHot = false, Discount = 0, Stock = 35 },
            new Product { Name = "MLB - Áo khoác bomber nam nữ", Description = "Áo khoác bomber nam nữ cao cấp, thiết kế năng động, chất liệu dày dặn, giữ ấm tốt.", Price = 1299000, Category = "ao-khoac", Image = "images/mlb11.jpg", IsHot = true, Discount = 10, Stock = 25 },
            new Product { Name = "MLB - Váy nữ midi dài tay", Description = "Váy nữ midi dài tay thanh lịch, nữ tính, phù hợp cho nhiều dịp khác nhau.", Price = 799000, Category = "vay", Image = "images/mlb2.jpg", IsHot = true, Discount = 0, Stock = 30 },
            new Product { Name = "MLB - Áo thun Limited Edition", Description = "Áo thun Limited Edition phiên bản giới hạn, thiết kế độc quyền.", Price = 599000, Category = "ao-thun", Image = "images/mlb1.jpg", IsHot = false, Discount = 0, Stock = 5 },
            new Product { Name = "MLB - Quần thun Premium", Description = "Quần thun Premium chất liệu cao cấp, thiết kế sang trọng.", Price = 699000, Category = "quan-thun", Image = "images/mlb7.jpg", IsHot = false, Discount = 0, Stock = 0 }
        );
    }
    
    if (!dbContext.Users.Any())
    {
        dbContext.Users.AddRange(
            new User { Name = "Admin", Email = "admin@gmail.com", Password = "Matkhau@1", Phone = "0348588823", Address = "123 Đường Thời Trang, Quận 1, TP.HCM", RegisteredDate = DateTime.Now.ToString("yyyy-MM-dd"), Role = "admin" },
            new User { Name = "Nguyễn Văn A", Email = "user1@gmail.com", Password = "Matkhau@1", Phone = "0912345678", Address = "45 Lê Lợi, Quận 1, TP.HCM", RegisteredDate = DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd"), Role = "user" },
            new User { Name = "Trần Thị B", Email = "user2@gmail.com", Password = "Matkhau@1", Phone = "0987654321", Address = "78 Nguyễn Huệ, Quận 1, TP.HCM", RegisteredDate = DateTime.Now.AddDays(-20).ToString("yyyy-MM-dd"), Role = "user" }
        );
    }
    
    if (!dbContext.Contacts.Any())
    {
        dbContext.Contacts.Add(new Contact { Name = "Thời Trang của ĐẠT", Email = "dat0364634549@gmail.com", Phone = "0348588823", Facebook = "https://facebook.com/thoitrangcuadat", Description = "Cửa hàng thời trang đẳng cấp, mang đến phong cách và sự thoải mái. Khám phá bộ sưu tập quần áo thời thượng dành riêng cho bạn." });
    }
    
    if (!dbContext.Transactions.Any())
    {
        dbContext.Transactions.AddRange(
            new Transaction { UserId = 2, Products = "[{\"productName\":\"MLB - Áo thun nam nữ cổ tròn Graphic Tee\",\"quantity\":2,\"price\":349000}]", TotalAmount = 698000, Date = DateTime.Now.AddDays(-15).ToString("yyyy-MM-dd"), Status = "completed" },
            new Transaction { UserId = 3, Products = "[{\"productName\":\"MLB - Quần thun nam nữ ống bó Basic\",\"quantity\":1,\"price\":399000},{\"productName\":\"MLB - Áo thun nam nữ cổ tròn Oversized\",\"quantity\":1,\"price\":449000}]", TotalAmount = 848000, Date = DateTime.Now.AddDays(-10).ToString("yyyy-MM-dd"), Status = "completed" },
            new Transaction { UserId = 2, Products = "[{\"productName\":\"MLB - Váy nữ midi dài tay\",\"quantity\":1,\"price\":799000}]", TotalAmount = 799000, Date = DateTime.Now.AddDays(-7).ToString("yyyy-MM-dd"), Status = "completed" },
            new Transaction { UserId = 3, Products = "[{\"productName\":\"MLB - Áo khoác bomber nam nữ\",\"quantity\":1,\"price\":1299000}]", TotalAmount = 1299000, Date = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd"), Status = "completed" },
            new Transaction { UserId = 2, Products = "[{\"productName\":\"MLB - Quần thun nam nữ ống bó Graphic\",\"quantity\":2,\"price\":349000},{\"productName\":\"MLB - Áo sơ mi nam nữ dài tay\",\"quantity\":1,\"price\":499000}]", TotalAmount = 1197000, Date = DateTime.Now.AddDays(-3).ToString("yyyy-MM-dd"), Status = "completed" },
            new Transaction { UserId = 3, Products = "[{\"productName\":\"MLB - Quần thun nam nữ ống bó Logo Print\",\"quantity\":1,\"price\":449000}]", TotalAmount = 449000, Date = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd"), Status = "pending" }
        );
    }
    
    dbContext.SaveChanges();
}

app.UseCors("AllowAll");

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(webRootPath)
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(webRootPath)
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadRootPath),
    RequestPath = "/uploads"
});

app.UseAuthorization();

app.MapControllers();

app.Run();
