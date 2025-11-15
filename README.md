# PharmaHub Backend

Hệ thống quản lý dược phẩm đa chi nhánh - Backend API

## 📋 Tổng Quan

PharmaHub là hệ thống quản lý dược phẩm được thiết kế theo kiến trúc module, hỗ trợ quản lý nhiều chi nhánh với các chức năng chính:

- Quản lý thuốc & nhà cung cấp
- Quản lý tồn kho & nhập hàng
- Quản lý bán hàng & doanh thu
- Quản lý nhân sự & chấm công
- Phân quyền người dùng theo vai trò

## 🏗️ Cấu Trúc Triển Khai

### Kiến Trúc Tổng Thể

```
PharmaHub_BE/
├── app.js                 # Ứng dụng Express chính
├── server.js             # Khởi động server & kết nối DB
├── src/
│   ├── config/           # Cấu hình (database, firebase)
│   ├── middlewares/      # Middleware (auth, validation, error)
│   ├── modules/          # Các module chức năng
│   ├── routes/           # Định tuyến chính
│   └── utils/            # Công cụ hỗ trợ
└── package.json
```

### Luồng Xử Lý API

1. **Khởi Động Server** (`server.js`)
   - Load environment variables
   - Kết nối MongoDB
   - Khởi động Express app

2. **App Chính** (`app.js`)
   - Cấu hình middleware (JSON parsing, logging)
   - Mount routes tại `/api`
   - Xử lý lỗi toàn cục

3. **Định Tuyến** (`src/routes/index.js`)
   - Mount các module routes:
     - `/api/auth` - Authentication
     - `/api/users` - Quản lý người dùng
     - `/api/branches` - Quản lý chi nhánh
     - `/api/medicines` - Quản lý thuốc
     - `/api/suppliers` - Quản lý nhà cung cấp
     - `/api/imports` - Quản lý nhập hàng
     - `/api/inventory` - Quản lý tồn kho
     - `/api/sales` - Quản lý bán hàng
     - `/api/attendance` - Chấm công
     - `/api/work-schedules` - Quản lý ca làm

4. **Module Pattern** (Mỗi module gồm):
   ```
   module/
   ├── module.controller.js    # Xử lý request/response
   ├── module.model.js         # Schema & validation
   ├── module.repository.js    # Database operations
   ├── module.service.js       # Business logic
   ├── module.routes.js        # Route definitions
   └── module.validation.js    # Input validation (tùy module)
   ```

## 🗃️ Cơ Sở Dữ Liệu

### Các Bảng (Collections)

#### 1. **users** - Quản lý người dùng

```javascript
{
  username: String (unique),
  password: String (hashed),
  fullName: String,
  phone: String,
  email: String,
  role: ['employee', 'branch-manager', 'system-admin', 'supplier-manager'],
  branchId: ObjectId (ref: Branch)
}
```

#### 2. **branches** - Quản lý chi nhánh

```javascript
{
  name: String,
  address: String,
  phone: String,
  revenue_target: Number
}
```

#### 3. **medicines** - Quản lý thuốc

```javascript
{
  name: String,
  description: String,
  category: String,
  unit: String,
  price: Number,
  expiry_date: Date,
  supplier_id: ObjectId (ref: Supplier),
  warning_threshold: Number,
  manufacturer: String
}
```

#### 4. **suppliers** - Quản lý nhà cung cấp

```javascript
{
  name: String (unique),
  contact: {
    phone: String,
    email: String,
    address: String
  },
  note: String,
  status: ['active', 'inactive']
}
```

#### 5. **import_records** - Quản lý nhập hàng

```javascript
{
  branch_id: ObjectId (ref: Branch),
  supplier_id: ObjectId (ref: Supplier),
  employee_id: ObjectId (ref: User),
  items: [{
    medicine_id: ObjectId (ref: Medicine),
    quantity: Number,
    unit_price: Number
  }],
  total_cost: Number,
  status: ['pending', 'completed', 'cancelled']
}
```

#### 6. **inventory** - Quản lý tồn kho

```javascript
{
  branch_id: ObjectId (ref: Branch),
  medicine_id: ObjectId (ref: Medicine),
  quantity: Number,
  last_updated: Date
}
```

#### 7. **sales_invoices** - Quản lý bán hàng

```javascript
{
  invoice_no: String (unique),
  branch_id: ObjectId (ref: Branch),
  employee_id: ObjectId (ref: User),
  customer_name: String,
  customer_phone: String,
  items: [{
    medicine_id: ObjectId (ref: Medicine),
    quantity: Number,
    unit_price: Number,
    line_total: Number
  }],
  subtotal: Number,
  discount: Number,
  tax_rate: Number,
  tax_amount: Number,
  total_amount: Number,
  payment_method: ['cash', 'card', 'bank', 'e-wallet'],
  status: ['completed', 'cancelled', 'refunded']
}
```

#### 8. **attendance** - Quản lý chấm công

```javascript
{
  user_id: ObjectId (ref: User),
  branch_id: ObjectId (ref: Branch),
  checkin_time: String,
  checkout_time: String,
  working_hours: Number,
  status: ['checked_in', 'checked_out', 'late', 'early', 'absent']
}
```

#### 9. **work_schedules** - Quản lý ca làm việc

```javascript
{
  user_id: ObjectId (ref: User),
  branch_id: ObjectId (ref: Branch),
  date: String,
  shift: String,
  created_by: ObjectId (ref: User)
}
```

#### 10. **login_attempts** - Theo dõi đăng nhập (auth module)

```javascript
{
  username: String,
  timestamp: Date,
  successful: Boolean,
  ip: String
}
```

## ⚙️ Các Chức Năng Đang Có

### 1. **Authentication & Authorization**

- Đăng nhập bằng Firebase ID Token
- Đăng nhập bằng username/password
- Xác thực JWT token
- Phân quyền theo vai trò

### 2. **Quản Lý Người Dùng**

- Lấy danh sách người dùng (system-admin, branch-manager)
- Phân quyền: employee, branch-manager, system-admin, supplier-manager

### 3. **Quản Lý Chi Nhánh**

- CRUD chi nhánh
- Thiết lập doanh số mục tiêu

### 4. **Quản Lý Thuốc**

- CRUD thuốc với validation
- Tìm kiếm theo tên/mô tả (text search)
- Cảnh báo thuốc hết hạn & tồn kho thấp
- Phân loại theo category

### 5. **Quản Lý Nhà Cung Cấp**

- CRUD nhà cung cấp
- Validation email & phone
- Trạng thái hoạt động

### 6. **Quản Lý Nhập Hàng**

- Tạo phiếu nhập hàng
- Tự động tính tổng chi phí
- Lọc theo chi nhánh, nhà cung cấp, thời gian
- Thống kê nhập hàng theo chi nhánh

### 7. **Quản Lý Tồn Kho**

- Theo dõi số lượng tồn kho theo chi nhánh
- Tự động cập nhật khi nhập/xuất
- Tìm hoặc tạo mới inventory record
- Cảnh báo tồn kho thấp

### 8. **Quản Lý Bán Hàng**

- Tạo hóa đơn bán hàng
- Tự động sinh số hóa đơn
- Tính toán chiết khấu, thuế
- Hỗ trợ nhiều phương thức thanh toán
- Trạng thái: completed, cancelled, refunded

### 9. **Chấm Công**

- Check-in/check-out
- Tính giờ làm việc
- Theo dõi trạng thái: late, early, absent

### 10. **Quản Lý Ca Làm Việc**

- Phân ca theo ngày & người dùng
- Hỗ trợ nhiều ca trong ngày

### 11. **Thống Kê Bán Hàng**

- Thống kê tổng quan (tổng số lượng thuốc, tổng doanh thu)
- Thống kê chi tiết theo từng thuốc
- Top thuốc bán chạy nhất
- Thống kê theo khoảng thời gian (ngày, tháng, năm)
- Thống kê theo chi nhánh
- Thống kê theo nhân viên
- Dashboard tổng hợp
- Lọc theo thời gian, chi nhánh, nhân viên
- Chỉ tính các hóa đơn completed

## 🚀 Công Nghệ Sử Dụng

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + Firebase Auth
- **Validation**: Joi
- **Security**: bcryptjs (mật khẩu)
- **Development**: nodemon, ESLint, Prettier
- **Logging**: Morgan

## 📦 Cài Đặt & Chạy Dự Án

### Yêu Cầu

- Node.js >= 18.x
- MongoDB
- Firebase project (tùy chọn)

### Cài Đặt

```bash
# Clone repository
git clone <repository-url>
cd PharmaHub_BE

# Cài đặt dependencies
npm install
# hoặc
yarn install
```

### Cấu Hình

Tạo file `.env`:

```env
NODE_ENV=development
PORT=5000
HOST=localhost
MONGO_URI=mongodb://localhost:27017/pharmahub
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Chạy Dự Án

```bash
# Development mode
npm run dev
# hoặc
yarn dev

# Production mode
npm start
# hoặc
yarn start
```

### Kiểm Tra API

```bash
# Health check
curl http://localhost:5000/ping

# API base URL
http://localhost:5000/api
```

## 📝 API Documentation

### Authentication

- `POST /api/auth/login` - Đăng nhập Firebase
- `POST /api/auth/login-username` - Đăng nhập username/password
- `POST /api/auth/validate-token` - Xác thực token

### Users

- `GET /api/users` - Lấy danh sách người dùng (cần auth)

### Medicines

- `POST /api/medicines` - Tạo thuốc mới
- `GET /api/medicines` - Lấy danh sách thuốc
- `GET /api/medicines/:id` - Lấy chi tiết thuốc
- `PUT /api/medicines/:id` - Cập nhật thuốc
- `DELETE /api/medicines/:id` - Xóa thuốc

### Suppliers

- `GET /api/suppliers` - Lấy danh sách nhà cung cấp
- `GET /api/suppliers/:id` - Lấy chi tiết nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp mới
- `PUT /api/suppliers/:id` - Cập nhật nhà cung cấp
- `DELETE /api/suppliers/:id` - Xóa nhà cung cấp

### Imports

- `POST /api/imports` - Tạo phiếu nhập hàng
- `GET /api/imports` - Lấy danh sách phiếu nhập
- `GET /api/imports/:id` - Lấy chi tiết phiếu nhập
- `GET /api/imports/stats/:branchId` - Thống kê nhập hàng

### Sales

- `POST /api/sales` - Tạo hóa đơn bán hàng
- `GET /api/sales` - Lấy danh sách hóa đơn
- `GET /api/sales/:id` - Lấy chi tiết hóa đơn

### Inventory

- `GET /api/inventory` - Lấy tồn kho theo chi nhánh/thuốc

### Attendance

- `POST /api/attendance` - Check-in
- `PUT /api/attendance/:id` - Check-out
- `GET /api/attendance` - Lấy lịch sử chấm công

### Work Schedules

- `POST /api/work-schedules` - Tạo ca làm việc
- `GET /api/work-schedules` - Lấy lịch làm việc
- `DELETE /api/work-schedules/:id` - Hủy ca làm việc

### Statistics (Thống Kê Bán Hàng)

- `GET /api/statistics/overall` - Lấy thống kê tổng quan
  - Query: `startDate`, `endDate`, `branchId`, `employeeId`
  - Response: Tổng số lượng thuốc, tổng doanh thu, số hóa đơn, tổng giảm giá, tổng thuế

- `GET /api/statistics/medicines` - Lấy thống kê chi tiết theo từng thuốc
  - Query: `startDate`, `endDate`, `branchId`, `employeeId`
  - Response: Danh sách thuốc với số lượng bán, doanh thu, giá trung bình, số lần mua

- `GET /api/statistics/top-selling` - Lấy top thuốc bán chạy nhất
  - Query: `startDate`, `endDate`, `branchId`, `employeeId`, `limit` (default: 10)
  - Response: Top thuốc sắp xếp theo số lượng bán ra

- `GET /api/statistics/by-period` - Lấy thống kê theo khoảng thời gian
  - Query: `startDate`, `endDate`, `branchId`, `employeeId`, `groupBy` (day|month|year)
  - Response: Thống kê nhóm theo ngày/tháng/năm

- `GET /api/statistics/by-branch` - Lấy thống kê theo chi nhánh
  - Query: `startDate`, `endDate`
  - Response: Thống kê từng chi nhánh

- `GET /api/statistics/by-employee` - Lấy thống kê theo nhân viên
  - Query: `startDate`, `endDate`, `branchId`
  - Response: Thống kê hiệu suất từng nhân viên

- `GET /api/statistics/dashboard` - Lấy dashboard tổng hợp
  - Query: `startDate`, `endDate`, `branchId`, `employeeId`
  - Response: Kết hợp thống kê tổng quan, top 5 thuốc, thống kê chi nhánh và nhân viên

## 🔐 Phân Quyền

### Roles

- **system-admin**: Toàn quyền hệ thống
- **branch-manager**: Quản lý chi nhánh
- **employee**: Nhân viên bán hàng
- **supplier-manager**: Quản lý nhà cung cấp

### Middleware

- `protect`: Yêu cầu authentication
- `authorizeRoles(...)`: Kiểm tra quyền hạn cụ thể

## 🛠️ Development

### Code Style

- ESLint + Prettier
- Husky pre-commit hooks
- Import validation

### Structure Convention

- Controller: Xử lý HTTP request/response
- Service: Business logic
- Repository: Database operations
- Model: Schema & validation
- Routes: Route definitions
- Validation: Input validation schemas

## 📊 Monitoring

### Logging

- Morgan HTTP logger (development)
- Console logs for errors & status

### Health Check

- `GET /ping` - Server health check

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Environment mode
- `PORT`: Server port
- `HOST`: Server host
- `MONGO_URI`: MongoDB connection string
- `FIREBASE_PROJECT_ID`: Firebase project ID

### Database

- MongoDB with Mongoose ODM
- Indexes for performance optimization
- Text search for medicines & suppliers

---

**Project maintained by**: [Your Name]  
**License**: [License Type]
