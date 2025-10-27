# PharmaHub_BE

Backend của ứng dụng quản lý chuỗi nhà thuốc, viết bằng **Node.js**, **Express**, **MongoDB**, **JavaScript (ESM)**.  
Sử dụng kiến trúc **module-based + layered** (`controller -> service -> repository -> model`).  

---

## 📁 Root

- **`app.js`**  
  - 🔹 Tạo instance **Express**, mount routes, thêm middleware (error handler)  
  - 🔹 Không start server trực tiếp, xuất app để `server.js` dùng

- **`server.js`**  
  - 🔹 Load **dotenv**  
  - 🔹 Kết nối **MongoDB** (`connectDB()`)  
  - 🔹 Start server (`app.listen(PORT)`)

- **`package.json / package-lock.json`**  
  - 🔹 Quản lý **dependencies**, **scripts**

- **`eslint.config.js`**  
  - 🔹 Cấu hình **ESLint** (linting rules, import checks)

- **`jsconfig.json`**  
  - 🔹 Giúp **VSCode** hiểu đường dẫn module, hỗ trợ IntelliSense

---

## 📁 src/config

- **`db.js`**  
  - 🔹 Kết nối MongoDB với **Mongoose**  
  - 🔹 Export `connectDB()` dùng trong `server.js`

- **`default.js`**  
  - 🔹 Chứa config mặc định: JWT secret, expires, các setting khác  
  - 🔹 Export **config object**

- **`index.js`**  
  - 🔹 Nhúng `default.js` + **env vars**  
  - 🔹 Export **config tổng hợp**  
  - 🔹 Ví dụ: `config.jwt.secret`

---

## 📁 src/middlewares

- **`authMiddleware.js`**  
  - 🔹 Kiểm tra **JWT token**  
  - 🔹 Kiểm tra **role** của user trước khi gọi controller

- **`validate.js`**  
  - 🔹 Validate dữ liệu request (**body, params, query**)  
  - 🔹 Dùng chung cho các API CRUD

- **`errorHandler.js`**  
  - 🔹 Catch tất cả lỗi trong **controller/service**  
  - 🔹 Gửi response chuẩn: `{ statusCode, message }`

---

## 📁 src/modules

Mỗi module (auth, users) đều có cấu trúc **layered**:

<module>/
├── <module>.routes.js
├── <module>.controller.js
├── <module>.service.js
├── <module>.repository.js
└── <module>.model.js


### Module: auth

- **`auth.model.js`**  
  - 🔹 Thường dùng lại **User model** từ module users  
  - 🔹 Có thể khai báo schema riêng (refresh token, login history…)

- **`auth.repository.js`**  
  - 🔹 Tương tác DB liên quan auth  
  - 🔹 Ví dụ: tìm user theo username, id

- **`auth.service.js`**  
  - 🔹 Logic nghiệp vụ auth: login, tạo **access token**, **refresh token**  
  - 🔹 So sánh password với **bcrypt**

- **`auth.controller.js`**  
  - 🔹 Nhận request từ `/auth/login` hoặc `/auth/refresh`  
  - 🔹 Gọi service, trả response

- **`auth.routes.js`**  
  - 🔹 Định nghĩa endpoint `/login`, `/refresh`  
  - 🔹 Map tới controller

### Module: users

- **`users.model.js`**  
  - 🔹 Schema MongoDB cho User  
  - 🔹 Fields: `username, password, fullName, phone, email, role, branchId…`

- **`users.repository.js`**  
  - 🔹 CRUD trực tiếp với MongoDB

- **`users.service.js`**  
  - 🔹 Logic nghiệp vụ: hash password, kiểm tra trùng username, validate business rules

- **`users.controller.js`**  
  - 🔹 Nhận request từ route `/users`  
  - 🔹 Gọi service và trả response

- **`users.routes.js`**  
  - 🔹 Định nghĩa route `/users` (POST, GET, PUT, DELETE)  
  - 🔹 Map tới controller

---

## 📁 src/routes

- **`index.js`**  
  - 🔹 Mount tất cả route module:

```js
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
🔹 Xuất router để app.js dùng



📁 src/utils

AppError.js

🔹 Custom error class: throw new AppError(statusCode, message)

asyncHandler.js

🔹 Wrapper cho async function, tự động next(err) nếu lỗi xảy ra

logger.js

🔹 Ghi log console / file

🔄 Luồng xây dựng API

Model → Repository → Service → Controller → Route → Middleware → App

Model → tạo schema DB

Repository → CRUD/DB access

Service → logic nghiệp vụ

Controller → nhận request, gọi service, trả response

Route → map URL -> controller

Mount route vào app.js / routes/index.js

Middleware → auth, validate, errorHandler

Utils → hỗ trợ chung: error, async wrapper, logger



Ví dụ luồng chạy api 
Client
  |
  v
routes/auth.routes.js
  |
  v
controllers/auth.controller.js
  |
  v
services/auth.service.js
  |
  v
repositories/auth.repository.js
  |
  v
models/users.model.js (truy vấn MongoDB)

Quy trình xây dựng 1 API:

Tạo Model → Tạo Repository → Tạo Service → Tạo Controller → Tạo Router → Mount Route vào App