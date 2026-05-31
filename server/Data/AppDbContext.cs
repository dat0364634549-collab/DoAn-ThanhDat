using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Price).HasColumnName("price").HasColumnType("REAL");
                entity.Property(e => e.Category).HasColumnName("category");
                entity.Property(e => e.Image).HasColumnName("image");
                entity.Property(e => e.IsHot).HasColumnName("isHot").HasColumnType("INTEGER");
                entity.Property(e => e.Discount).HasColumnName("discount");
                entity.Property(e => e.Stock).HasColumnName("stock").HasDefaultValue(0);
                entity.Property(e => e.TotalSold).HasColumnName("totalSold").HasDefaultValue(0);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.RegisteredDate).HasColumnName("registeredDate");
                entity.Property(e => e.Role).HasColumnName("role").HasDefaultValue("user");
                entity.Property(e => e.IsLocked).HasColumnName("isLocked").HasColumnType("INTEGER").HasDefaultValue(0);
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("transactions");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("userId");
                entity.Property(e => e.Products).HasColumnName("products");
                entity.Property(e => e.TotalAmount).HasColumnName("totalAmount").HasColumnType("REAL");
                entity.Property(e => e.Date).HasColumnName("date");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.CustomerName).HasColumnName("customerName").HasDefaultValue("");
                entity.Property(e => e.CustomerEmail).HasColumnName("customerEmail").HasDefaultValue("");
                entity.Property(e => e.CustomerPhone).HasColumnName("customerPhone").HasDefaultValue("");
                entity.Property(e => e.ShippingAddress).HasColumnName("shippingAddress").HasDefaultValue("");
                entity.Property(e => e.PaymentMethod).HasColumnName("paymentMethod").HasDefaultValue("");
                entity.Property(e => e.Note).HasColumnName("note").HasDefaultValue("");
            });

            modelBuilder.Entity<Contact>(entity =>
            {
                entity.ToTable("contact");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Facebook).HasColumnName("facebook");
                entity.Property(e => e.Description).HasColumnName("description");
            });
        }
    }
}
