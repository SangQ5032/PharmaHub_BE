# PharmaHub Backend API

> Hệ thống backend quản lý nhà thuốc, xây dựng với Node.js, Express và MongoDB

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-5.1.0-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.19.2-green)](https://www.mongodb.com/)

## 🏗️ Công nghệ sử dụng

### Core
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Authentication & Security
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing

### Validation & Utilities
- **Joi** - Schema validation
- **multer** - File upload handling
- **xlsx** - Excel file processing
- **firebase-admin** - Firebase Admin SDK
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **nodemon** - Auto-restart development server

## 💻 Yêu cầu

- **Node.js**: >= 18.0.0
- **MongoDB**: >= 5.0 (hoặc MongoDB Atlas)
- **npm** hoặc **yarn**

## 🚀 Cài đặt

```bash
# Clone repository
git clone https://github.com/SangQ5032/PharmaHub_BE.git
cd PharmaHub_BE

# Cài đặt dependencies
npm install
```

## ⚙️ Cấu hình

Sao chép file `env.example` và đổi tên thành `.env`, sau đó cấu hình các biến môi trường theo hướng dẫn trong file:

```bash
cp env.example .env
```

## 🎮 Chạy project

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:8080`

### Health check

```bash
curl http://localhost:8080/ping
```

## 🛠️ Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Chạy server production |
| `npm run dev` | Chạy server development (nodemon) |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run lint:fix` | Tự động sửa lỗi ESLint |
| `npm run format` | Format code với Prettier |
| `npm run seed:units` | Seed dữ liệu đơn vị |
| `npm run create:sample-excel` | Tạo file Excel mẫu cho medicines |

## 📡 API

Tất cả API endpoints được mount dưới prefix `/api`:

- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/branches` - Branch management
- `/api/medicines` - Medicine management
- `/api/inventory` - Inventory management
- `/api/imports` - Import management
- `/api/sales` - Sales management
- `/api/customers` - Customer management
- `/api/suppliers` - Supplier management
- `/api/categories` - Category management
- `/api/batches` - Batch management
- `/api/work-schedules` - Work schedule
- `/api/attendance` - Attendance
- `/api/statistics` - Statistics
- `/api/payrolls` - Payroll

---
thông tin tài khoản: 
0364050902: tài khoản quản lý hệ thống
0395257193: tài khoản quản lý chi nhánh
0869016375: tài khoản nhân viên
Made with ❤️ by PharmaHub Team
