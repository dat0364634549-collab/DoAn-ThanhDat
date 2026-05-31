# Chay website trong Expo

App nay dung WebView de mo website HTML co san cua do an.

## Chay tren dien thoai

1. Chay backend o thu muc goc:

```bash
dotnet run --project server/server.csproj
```

2. Cai dependency va mo Expo:

```bash
cd mobile-expo
npm install
npx expo start
```

3. Quet QR bang Expo Go.

Dien thoai va may tinh phai dung chung Wi-Fi. Neu Windows Firewall hoi quyen truy cap cho .NET hoac Node, chon Allow.
