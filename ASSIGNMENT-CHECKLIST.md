# Project Assignment Checklist

## Da dap ung

- React Native/Expo mobile app, khong con boc website bang WebView.
- Kien truc 3 tang: React Native client, ASP.NET Core REST API, SQLite database.
- Dang ky, dang nhap, luu phien, dang xuat va cap nhat ho so.
- Phan quyen giao dien user/admin theo `role`.
- Danh sach, danh muc, tim kiem, loc, sap xep va chi tiet san pham.
- Gio hang: them, xoa, tang/giam so luong, tong tien va luu tren thiet bi.
- Thanh toan COD va QR mo phong.
- Tao don hang, xem lich su va trang thai don.
- Admin native: dashboard, CRUD san pham, don hang, khach hang va bao cao.
- Loading, empty state, error state, pull-to-refresh va animation.
- Backend CRUD va API thong ke.
- Cong thanh toan VNPAY Sandbox co xac thuc chu ky callback/IPN.

## Can hoan thien truoc khi bao ve

- Them JWT/access token va bao ve API admin o phia server.
- Bam mat khau (BCrypt/Argon2) thay vi luu plain text.
- Bo sung validation email trung lap va validation du lieu o backend.
- Viet unit/integration test cho cac luong auth, gio hang va dat hang.
- Tao APK/AAB bang EAS Build va chuan bi slide/demo video.

## Lenh chay

```powershell
cd mobile-expo
npm install
npx expo start
```

Backend local:

```powershell
dotnet run --project server/server.csproj
```

## Cau hinh VNPAY Sandbox

Khong dua `HashSecret` vao source code hoac ung dung mobile. Tren Render, mo
`thanhdatshop-api` -> `Environment` va them:

```text
VNPAY_TMN_CODE=<ma website VNPAY cap>
VNPAY_HASH_SECRET=<chuoi bi mat VNPAY cap>
VNPAY_RETURN_URL=https://thanhdatshop-api.onrender.com/api/payments/vnpay-return
```

Sau khi luu bien moi truong, chon `Manual Deploy` -> `Deploy latest commit`.
