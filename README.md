# Hệ Thống Bán Laptop Online

## Giới thiệu
Hệ thống bán laptop online được xây dựng với 3 phần chính:
- Frontend (Next.js)
- Backend (Laravel)
- Admin Dashboard (React)

## Yêu cầu hệ thống
- Node.js >= 14.x
- PHP >= 8.0
- Composer
- MySQL >= 5.7
- Yarn hoặc NPM

## Cài đặt và Chạy

### 1. Backend (Laravel)
```bash
# Di chuyển vào thư mục backend
cd be

# Cài đặt dependencies
composer install

# Tạo file .env từ .env.example
cp .env.example .env

# Tạo key cho ứng dụng
php artisan key:generate

# Tạo symbolic link cho storage
php artisan storage:link

# Chạy migration và seed dữ liệu
php artisan migrate:fresh --seeds

# Chạy server
php artisan serve
```

### 2. Frontend (Next.js)
```bash
# Di chuyển vào thư mục frontend
cd fe1

# Cài đặt dependencies
yarn install

# Build project (bỏ qua lint)
npm run build -- --no-lint

# Chạy server
npm start
```

### 3. Admin Dashboard (React)
```bash
# Di chuyển vào thư mục admin
cd admin

# Cài đặt dependencies
npm install

# Chạy server development
npm run dev
```

## Chạy tất cả các service cùng lúc
```bash
# Cài đặt dependencies cho tất cả các project
npm run install-all

# Chạy tất cả các service
npm run dev
```

## Cấu trúc thư mục
```
├── be/                 # Backend Laravel
├── fe1/               # Frontend Next.js
├── admin/            # Admin Dashboard React
└── package.json      # Root package.json
```

## Công nghệ sử dụng
- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Laravel, MySQL
- **Admin**: React, Material-UI

## API Documentation
API documentation có thể được truy cập tại: `http://localhost:8000/api/documentation`

## Tài khoản mặc định
- **Admin**:
  - Email: admin@example.com
  - Password: password
- **User**:
  - Email: user@example.com
  - Password: password

## Lưu ý
- Đảm bảo MySQL đang chạy trước khi chạy backend
- Các port mặc định:
  - Backend: 8000
  - Frontend: 3000
  - Admin: 3001
- Nếu gặp lỗi khi build frontend, sử dụng flag `--no-lint` để bỏ qua kiểm tra ESLint

## Hỗ trợ
Nếu bạn gặp vấn đề trong quá trình cài đặt hoặc chạy project, vui lòng tạo issue trong repository.