using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public PaymentsController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("vnpay/create-url")]
    public async Task<ActionResult<object>> CreateVnPayUrl([FromBody] VnPayCreateRequest request)
    {
        var transaction = await _context.Transactions.FindAsync(request.TransactionId);
        if (transaction == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        if (transaction.PaymentMethod != "vnpay")
        {
            return BadRequest(new { message = "Đơn hàng không sử dụng VNPAY." });
        }

        var settings = GetSettings();
        if (!settings.IsConfigured)
        {
            return StatusCode(503, new
            {
                message = "VNPAY Sandbox chưa được cấu hình. Hãy thêm VNPAY_TMN_CODE và VNPAY_HASH_SECRET trên server."
            });
        }

        var now = DateTime.Now;
        var clientIp = GetClientIp();
        var vnpay = new VnPayService();
        vnpay.Add("vnp_Version", VnPayService.Version);
        vnpay.Add("vnp_Command", "pay");
        vnpay.Add("vnp_TmnCode", settings.TmnCode);
        vnpay.Add("vnp_Amount", decimal.ToInt64(transaction.TotalAmount * 100).ToString(CultureInfo.InvariantCulture));
        vnpay.Add("vnp_CreateDate", now.ToString("yyyyMMddHHmmss"));
        vnpay.Add("vnp_ExpireDate", now.AddMinutes(15).ToString("yyyyMMddHHmmss"));
        vnpay.Add("vnp_CurrCode", "VND");
        vnpay.Add("vnp_IpAddr", clientIp);
        vnpay.Add("vnp_Locale", "vn");
        vnpay.Add("vnp_OrderInfo", $"Thanh toan don hang {transaction.Id}");
        vnpay.Add("vnp_OrderType", "other");
        vnpay.Add("vnp_ReturnUrl", settings.ReturnUrl);
        vnpay.Add("vnp_TxnRef", transaction.Id.ToString(CultureInfo.InvariantCulture));

        return Ok(new
        {
            paymentUrl = vnpay.CreatePaymentUrl(settings.PaymentUrl, settings.HashSecret),
            transactionId = transaction.Id,
            expiresAt = now.AddMinutes(15)
        });
    }

    [HttpGet("vnpay-return")]
    public async Task<ContentResult> VnPayReturn()
    {
        var result = await ProcessVnPayResult();
        var title = result.Success ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất";
        var color = result.Success ? "#16804a" : "#c4322b";
        var payloadJson = JsonSerializer.Serialize(new
        {
            type = "vnpay-result",
            success = result.Success,
            transactionId = result.TransactionId,
            responseCode = result.ResponseCode,
            message = result.Message
        });
        var html = $$"""
            <!doctype html>
            <html lang="vi">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>{{title}}</title>
              <style>
                body{font-family:Arial,sans-serif;background:#f3f6fb;margin:0;padding:24px;color:#172033}
                .card{max-width:460px;margin:60px auto;background:white;border-radius:18px;padding:28px;text-align:center}
                h1{color:{{color}};font-size:24px} p{line-height:1.6;color:#667085}
              </style>
            </head>
            <body>
              <div class="card">
                <h1>{{title}}</h1>
                <p>{{WebUtility.HtmlEncode(result.Message)}}</p>
                <p>Mã đơn hàng: #{{result.TransactionId}}</p>
                <p>Bạn có thể đóng cửa sổ này để trở lại ứng dụng.</p>
              </div>
              <script>
                const payload = {{payloadJson}};
                if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                if (window.parent && window.parent !== window) window.parent.postMessage(payload, "*");
              </script>
            </body>
            </html>
            """;

        return Content(html, "text/html", Encoding.UTF8);
    }

    [HttpGet("vnpay-ipn")]
    public async Task<ActionResult<object>> VnPayIpn()
    {
        var result = await ProcessVnPayResult();
        if (!result.SignatureValid)
        {
            return Ok(new { RspCode = "97", Message = "Invalid signature" });
        }
        if (!result.TransactionFound)
        {
            return Ok(new { RspCode = "01", Message = "Order not found" });
        }
        if (!result.AmountValid)
        {
            return Ok(new { RspCode = "04", Message = "Invalid amount" });
        }
        return Ok(new { RspCode = "00", Message = "Confirm success" });
    }

    private async Task<VnPayResult> ProcessVnPayResult()
    {
        var settings = GetSettings();
        var responseData = Request.Query
            .Where(item => item.Key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase))
            .ToDictionary(item => item.Key, item => item.Value.ToString());

        responseData.TryGetValue("vnp_SecureHash", out var secureHash);
        responseData.TryGetValue("vnp_TxnRef", out var transactionIdText);
        responseData.TryGetValue("vnp_Amount", out var amountText);
        responseData.TryGetValue("vnp_ResponseCode", out var responseCode);
        responseData.TryGetValue("vnp_TransactionStatus", out var transactionStatus);

        _ = int.TryParse(transactionIdText, out var transactionId);
        var signatureValid = settings.IsConfigured &&
            !string.IsNullOrWhiteSpace(secureHash) &&
            VnPayService.ValidateSignature(responseData, secureHash, settings.HashSecret);

        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(item => item.Id == transactionId);
        var expectedAmount = transaction == null
            ? -1
            : decimal.ToInt64(transaction.TotalAmount * 100);
        var amountValid = long.TryParse(amountText, out var paidAmount) && paidAmount == expectedAmount;
        var paymentSuccessful = signatureValid &&
            transaction != null &&
            amountValid &&
            responseCode == "00" &&
            (string.IsNullOrWhiteSpace(transactionStatus) || transactionStatus == "00");

        if (transaction != null && signatureValid && amountValid)
        {
            if (paymentSuccessful && transaction.Status != "paid")
            {
                transaction.Status = "paid";
                AddProductSales(transaction.Products);
                await _context.SaveChangesAsync();
            }
            else if (!paymentSuccessful && transaction.Status == "payment_pending")
            {
                transaction.Status = "payment_failed";
                await _context.SaveChangesAsync();
            }
        }

        return new VnPayResult(
            paymentSuccessful,
            signatureValid,
            transaction != null,
            amountValid,
            transactionId,
            responseCode ?? string.Empty,
            paymentSuccessful
                ? "VNPAY đã xác nhận giao dịch thành công."
                : "Giao dịch bị hủy, thất bại hoặc chưa được VNPAY xác nhận.");
    }

    private void AddProductSales(string productsJson)
    {
        try
        {
            var products = JsonSerializer.Deserialize<List<ProductSale>>(productsJson);
            if (products == null) return;

            foreach (var product in products)
            {
                var databaseProduct = _context.Products.Find(product.ProductId);
                if (databaseProduct != null)
                {
                    databaseProduct.TotalSold += product.Quantity;
                }
            }
        }
        catch (JsonException)
        {
            // The payment remains valid even if legacy order product JSON cannot be parsed.
        }
    }

    private string GetClientIp()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        var ip = forwarded?.Split(',').FirstOrDefault()?.Trim()
            ?? HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? "127.0.0.1";
        return ip.Length <= 45 ? ip : "127.0.0.1";
    }

    private VnPaySettings GetSettings()
    {
        return new VnPaySettings(
            FirstNotEmpty(
                Environment.GetEnvironmentVariable("VNPAY_TMN_CODE"),
                _configuration["VNPay:TmnCode"]),
            FirstNotEmpty(
                Environment.GetEnvironmentVariable("VNPAY_HASH_SECRET"),
                _configuration["VNPay:HashSecret"]),
            FirstNotEmpty(
                Environment.GetEnvironmentVariable("VNPAY_PAYMENT_URL"),
                _configuration["VNPay:PaymentUrl"],
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"),
            FirstNotEmpty(
                Environment.GetEnvironmentVariable("VNPAY_RETURN_URL"),
                _configuration["VNPay:ReturnUrl"],
                $"{Request.Scheme}://{Request.Host}/api/payments/vnpay-return"));
    }

    private static string FirstNotEmpty(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;

    public record VnPayCreateRequest(int TransactionId);
    private record VnPaySettings(string TmnCode, string HashSecret, string PaymentUrl, string ReturnUrl)
    {
        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(TmnCode) &&
            !string.IsNullOrWhiteSpace(HashSecret);
    }
    private record VnPayResult(
        bool Success,
        bool SignatureValid,
        bool TransactionFound,
        bool AmountValid,
        int TransactionId,
        string ResponseCode,
        string Message);
    private class ProductSale
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
