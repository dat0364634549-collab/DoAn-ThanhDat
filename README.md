# Đồ Án - Thời Trang Của ĐẠT

Website thương mại điện tử bán quần áo thời trang MLB với đầy đủ tính năng quản lý sản phẩm, đơn hàng, người dùng và báo cáo.

## Công Nghệ Sử Dụng

### Backend
- **.NET 8.0** - Framework chính
- **SQLite** - Database
- **ASP.NET Core Web API** - RESTful API

### Frontend
- **HTML5, CSS3, JavaScript** - Giao diện người dùng

## Yêu Cầu Hệ Thống

### Bắt Buộc
- **.NET 8.0 SDK** hoặc cao hơn  
  Link tải ASP.NET: https://dotnet.microsoft.com/en-us/apps/aspnet
- **C# Dev Kit** (Extension VSCode)
- **Live Server** (Extension VSCode)

### Khuyến Nghị
- **Visual Studio Code**

## Cài Đặt

### 1. Khôi Phục Dependencies

```bash
cd server
dotnet restore
dotnet build
```

## Chạy Dự Án

### Bước 1: Chạy Backend Server

```bash
cd server
dotnet run --urls "http://localhost:3900"
```

Server sẽ chạy tại: **http://localhost:3900**

Database SQLite sẽ tự động được tạo với dữ liệu mẫu khi chạy lần đầu.

### Bước 2: Chạy Frontend

#### Sử dụng Live Server (VS Code)
1. Mở thư mục gốc dự án trong VS Code
2. Cài đặt extension "Live Server" nếu chưa có
3. Click chuột phải vào file `index.html`
4. Chọn "Open with Live Server"

### Tài Khoản Admin
- **Email**: admin@gmail.com
- **Mật khẩu**: Matkhau@1
- **Truy cập**: http://127.0.0.1:5500/admin-login.html

### Tài Khoản User
- **Email**: user1@gmail.com hoặc user2@gmail.com
- **Mật khẩu**: Matkhau@1
- **Truy cập**: login.html

## Cấu Trúc Dự Án

```
DoAn-ThanhDat/
├── server/                  # Backend .NET
│   ├── Controllers/         # API Controllers
│   ├── Models/             # Data Models
│   ├── Data/               # Database Context
│   ├── database.db         # SQLite Database
│   └── Program.cs          # Entry point
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── images/                 # Hình ảnh sản phẩm
├── index.html             # Trang chủ
├── products.html          # Danh sách sản phẩm
├── login.html             # Đăng nhập user
├── admin-login.html       # Đăng nhập admin
├── admin.html             # Trang quản trị
└── README.md             # File này
```

## Tính Năng

### Người Dùng
- Xem danh sách sản phẩm với tìm kiếm và lọc
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng và thanh toán
- Xem chi tiết sản phẩm
- Đăng ký và đăng nhập tài khoản
- Quản lý thông tin cá nhân

### Quản Trị Viên
- Quản lý sản phẩm (thêm, sửa, xóa)
- Quản lý đơn hàng
- Quản lý người dùng
- Xem báo cáo thống kê
- Quản lý thông tin liên hệ

## API Endpoints

Backend cung cấp các API endpoints:

- **GET** `/api/products` - Lấy danh sách sản phẩm
- **GET** `/api/products/{id}` - Lấy chi tiết sản phẩm
- **POST** `/api/products` - Tạo sản phẩm mới
- **PUT** `/api/products/{id}` - Cập nhật sản phẩm
- **DELETE** `/api/products/{id}` - Xóa sản phẩm
- **GET** `/api/users` - Lấy danh sách người dùng
- **POST** `/api/users/login` - Đăng nhập
- **POST** `/api/users/register` - Đăng ký
- **GET** `/api/transactions` - Lấy danh sách giao dịch
- **POST** `/api/transactions` - Tạo giao dịch mới
- **GET** `/api/contact` - Lấy thông tin liên hệ

## Ghi Chú

- Database được tự động khởi tạo với dữ liệu mẫu khi chạy lần đầu
- CORS được cấu hình cho phép tất cả origins
- Hình ảnh sản phẩm nằm trong thư mục `images/`
- Port backend mặc định: 3900
- Port frontend khuyến nghị: 5500 (Live Server)
