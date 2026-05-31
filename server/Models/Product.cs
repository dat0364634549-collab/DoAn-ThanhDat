namespace server.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public bool IsHot { get; set; }
        public int? Discount { get; set; }
        public int Stock { get; set; } = 0;
        public int TotalSold { get; set; } = 0;
    }
}
