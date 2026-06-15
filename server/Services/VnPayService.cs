using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace server.Services;

public class VnPayService
{
    public const string Version = "2.1.0";
    private readonly SortedDictionary<string, string> _data = new(StringComparer.Ordinal);

    public void Add(string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _data[key] = value;
        }
    }

    public string CreatePaymentUrl(string baseUrl, string hashSecret)
    {
        var query = BuildQuery(_data);
        var secureHash = HmacSha512(hashSecret, query);
        return $"{baseUrl}?{query}&vnp_SecureHash={secureHash}";
    }

    public static bool ValidateSignature(
        IEnumerable<KeyValuePair<string, string>> responseData,
        string inputHash,
        string hashSecret)
    {
        var filtered = responseData
            .Where(item => item.Key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase))
            .Where(item => !item.Key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
            .Where(item => !item.Key.Equals("vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
            .Where(item => !string.IsNullOrWhiteSpace(item.Value))
            .OrderBy(item => item.Key, StringComparer.Ordinal);

        var signData = BuildQuery(filtered);
        var expectedHash = HmacSha512(hashSecret, signData);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedHash.ToLowerInvariant()),
            Encoding.UTF8.GetBytes(inputHash.ToLowerInvariant()));
    }

    private static string BuildQuery(IEnumerable<KeyValuePair<string, string>> data)
    {
        return string.Join("&", data.Select(item =>
            $"{WebUtility.UrlEncode(item.Key)}={WebUtility.UrlEncode(item.Value)}"));
    }

    private static string HmacSha512(string key, string input)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
