# Deploy web dong cho Thanh Dat Shop

## 1. Deploy backend len Render

1. Dang nhap https://render.com
2. Chon New -> Blueprint
3. Ket noi GitHub repo cua project nay
4. Chon file `server/render.yaml`
5. Deploy service `thanhdatshop-api`

Sau khi deploy xong, Render se cho link dang:

```text
https://thanhdatshop-api.onrender.com
```

Kiem tra API:

```text
https://thanhdatshop-api.onrender.com/api/products
```

Neu hien JSON danh sach san pham la backend online da chay.

## 2. Noi frontend Netlify voi backend online

Mo file:

```text
js/api.js
```

Sua dong:

```js
const PUBLIC_SITE_ORIGIN = 'https://thanhdatshop-api.onrender.com';
```

Sau do copy lai file sang `netlify-deploy-ready/js/api.js` va deploy lai thu muc:

```text
netlify-deploy-ready
```

len project Netlify `thanhdatshop`.

## 3. Tai khoan admin

```text
Email: admin@gmail.com
Mat khau: Matkhau@1
```

## 4. Luu y

- Backend online dung SQLite nam tai `/data/database.db`.
- Anh upload tu admin duoc luu tai `/data/uploads`.
- Render free co the ngu sau mot luc khong dung; lan dau mo lai se cham vai chuc giay.
