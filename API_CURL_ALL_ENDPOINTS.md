# Tài liệu API cURL - PharmaHub Backend

## Cấu hình cơ bản

- **Base URL**: `http://localhost:5000/api`
- **Port mặc định**: `5000` (có thể thay đổi trong file `.env`)
- **Header bắt buộc cho các API protected**: `Authorization: Bearer <accessToken>`

---

## 🔐 1. Authentication APIs

### 1.1. Đăng nhập với Firebase ID Token

```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_FIREBASE_ID_TOKEN"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "username": "user123",
      "role": "employee"
    }
  }
}
```

---

### 1.2. Đăng nhập với Username/Password

```bash
curl -X POST "http://localhost:5000/api/auth/login-username" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "username": "user123",
      "role": "employee"
    }
  }
}
```

---

### 1.3. Xác thực JWT Token

```bash
curl -X POST "http://localhost:5000/api/auth/validate-token" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_ACCESS_TOKEN"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "username": "user123",
    "role": "employee"
  }
}
```

---

## 👥 2. Users APIs

### 2.1. Lấy danh sách tất cả users

**Yêu cầu quyền**: `system-admin` hoặc `branch-manager`

```bash
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "username": "user123",
      "fullName": "Nguyễn Văn A",
      "role": "employee",
      "branchId": "65a1b2c3d4e5f6g7h8i9j0k3"
    }
  ]
}
```

---

## 🏢 3. Branches APIs

### 3.1. Lấy danh sách tất cả chi nhánh

```bash
curl -X GET "http://localhost:5000/api/branches" \
  -H "Content-Type: application/json"
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Chi nhánh 1",
      "address": "123 Đường ABC",
      "phone": "0123456789",
      "revenue_target": 1000000
    }
  ]
}
```

---

### 3.2. Tạo chi nhánh mới

```bash
curl -X POST "http://localhost:5000/api/branches" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chi nhánh 2",
    "address": "456 Đường XYZ",
    "phone": "0987654321",
    "revenue_target": 2000000
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "name": "Chi nhánh 2",
    "address": "456 Đường XYZ",
    "phone": "0987654321",
    "revenue_target": 2000000
  }
}
```

---

### 3.3. Lấy thông tin chi nhánh theo ID

```bash
curl -X GET "http://localhost:5000/api/branches/65a1b2c3d4e5f6g7h8i9j0k3" \
  -H "Content-Type: application/json"
```

---

### 3.4. Cập nhật chi nhánh

```bash
curl -X PUT "http://localhost:5000/api/branches/65a1b2c3d4e5f6g7h8i9j0k3" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chi nhánh 1 - Cập nhật",
    "revenue_target": 1500000
  }'
```

---

### 3.5. Xóa chi nhánh

```bash
curl -X DELETE "http://localhost:5000/api/branches/65a1b2c3d4e5f6g7h8i9j0k3" \
  -H "Content-Type: application/json"
```

---

### 3.6. Lấy tồn kho theo chi nhánh

**Yêu cầu quyền**: `employee`, `branch-manager`, hoặc `system-admin`

```bash
curl -X GET "http://localhost:5000/api/branches/65a1b2c3d4e5f6g7h8i9j0k3/inventory" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 3.7. Lấy báo cáo tồn kho theo chi nhánh

**Yêu cầu quyền**: `branch-manager` hoặc `system-admin`

```bash
curl -X GET "http://localhost:5000/api/branches/65a1b2c3d4e5f6g7h8i9j0k3/reports/inventory" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 💊 4. Medicines APIs

### 4.1. Tạo thuốc mới

```bash
curl -X POST "http://localhost:5000/api/medicines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracetamol 500mg",
    "description": "Thuốc giảm đau, hạ sốt",
    "category": "Giảm đau",
    "unit": "Viên",
    "price": 5000,
    "expiry_date": "2025-12-31",
    "supplier_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "warning_threshold": 100
  }'
```

---

### 4.2. Lấy danh sách thuốc (có filter và search)

**Query parameters:**
- `name` hoặc `q`: Tìm kiếm theo tên
- `category`: Lọc theo loại thuốc
- `supplier_id`: Lọc theo nhà cung cấp
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)
- `sort`: Sắp xếp (JSON string, ví dụ: `{"createdAt":-1}`)

```bash
# Lấy tất cả thuốc
curl -X GET "http://localhost:5000/api/medicines" \
  -H "Content-Type: application/json"

# Tìm kiếm theo tên
curl -X GET "http://localhost:5000/api/medicines?name=paracetamol" \
  -H "Content-Type: application/json"

# Lọc theo category và phân trang
curl -X GET "http://localhost:5000/api/medicines?category=Giảm đau&page=1&limit=20" \
  -H "Content-Type: application/json"
```

---

### 4.3. Lấy thông tin thuốc theo ID

```bash
curl -X GET "http://localhost:5000/api/medicines/65a1b2c3d4e5f6g7h8i9j0k6" \
  -H "Content-Type: application/json"
```

---

### 4.4. Cập nhật thuốc

```bash
curl -X PUT "http://localhost:5000/api/medicines/65a1b2c3d4e5f6g7h8i9j0k6" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 6000,
    "warning_threshold": 150
  }'
```

---

### 4.5. Xóa thuốc

```bash
curl -X DELETE "http://localhost:5000/api/medicines/65a1b2c3d4e5f6g7h8i9j0k6" \
  -H "Content-Type: application/json"
```

---

## 📦 5. Suppliers APIs

### 5.1. Lấy danh sách nhà cung cấp

**Query parameters:**
- `page`: Số trang
- `limit`: Số lượng mỗi trang
- `q`: Tìm kiếm
- `status`: Lọc theo trạng thái

```bash
curl -X GET "http://localhost:5000/api/suppliers" \
  -H "Content-Type: application/json"

# Với query parameters
curl -X GET "http://localhost:5000/api/suppliers?q=ABC&page=1&limit=10&status=active" \
  -H "Content-Type: application/json"
```

---

### 5.2. Lấy thông tin nhà cung cấp theo ID

```bash
curl -X GET "http://localhost:5000/api/suppliers/65a1b2c3d4e5f6g7h8i9j0k5" \
  -H "Content-Type: application/json"
```

---

### 5.3. Tạo nhà cung cấp mới

```bash
curl -X POST "http://localhost:5000/api/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Công ty Dược phẩm ABC",
    "contact": {
      "phone": "0123456789",
      "email": "contact@abc.com",
      "address": "123 Đường XYZ"
    },
    "note": "Nhà cung cấp uy tín"
  }'
```

---

### 5.4. Cập nhật nhà cung cấp

```bash
curl -X PUT "http://localhost:5000/api/suppliers/65a1b2c3d4e5f6g7h8i9j0k5" \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "phone": "0987654321"
    },
    "note": "Cập nhật thông tin"
  }'
```

---

### 5.5. Xóa nhà cung cấp

```bash
curl -X DELETE "http://localhost:5000/api/suppliers/65a1b2c3d4e5f6g7h8i9j0k5" \
  -H "Content-Type: application/json"
```

---

## 📥 6. Imports APIs

**Tất cả APIs đều yêu cầu authentication và quyền phù hợp**

### 6.1. Tạo phiếu nhập hàng mới

**Yêu cầu quyền**: `employee`, `branch-manager`, `supplier-manager`, hoặc `system-admin`

```bash
curl -X POST "http://localhost:5000/api/imports" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "supplier_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "items": [
      {
        "medicine_id": "65a1b2c3d4e5f6g7h8i9j0k6",
        "quantity": 100,
        "unit_price": 5000
      },
      {
        "medicine_id": "65a1b2c3d4e5f6g7h8i9j0k7",
        "quantity": 50,
        "unit_price": 10000
      }
    ],
    "total_cost": 1000000,
    "note": "Nhập hàng tháng 1"
  }'
```

**Lưu ý**: `employee_id` sẽ tự động lấy từ token, `total_cost` có thể được tính tự động hoặc truyền vào.

---

### 6.2. Lấy danh sách phiếu nhập

**Yêu cầu quyền**: `branch-manager` hoặc `system-admin`

**Query parameters:**
- `branch_id`: Lọc theo chi nhánh
- `supplier_id`: Lọc theo nhà cung cấp
- `from_date`: Từ ngày (format: YYYY-MM-DD)
- `to_date`: Đến ngày (format: YYYY-MM-DD)
- `page`: Số trang
- `limit`: Số lượng mỗi trang

```bash
curl -X GET "http://localhost:5000/api/imports" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Với filter
curl -X GET "http://localhost:5000/api/imports?branch_id=65a1b2c3d4e5f6g7h8i9j0k3&from_date=2024-01-01&to_date=2024-01-31&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 6.3. Lấy chi tiết phiếu nhập

**Yêu cầu quyền**: `branch-manager` hoặc `system-admin`

```bash
curl -X GET "http://localhost:5000/api/imports/65a1b2c3d4e5f6g7h8i9j0k8" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 6.4. Lấy thống kê nhập hàng theo chi nhánh

**Yêu cầu quyền**: `branch-manager` hoặc `system-admin`

**Query parameters:**
- `from_date`: Từ ngày (optional)
- `to_date`: Đến ngày (optional)

```bash
curl -X GET "http://localhost:5000/api/imports/stats/65a1b2c3d4e5f6g7h8i9j0k3?from_date=2024-01-01&to_date=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 7. Inventory APIs

**Tất cả APIs đều yêu cầu authentication**

### 7.1. Lấy tồn kho toàn hệ thống

**Yêu cầu quyền**: `system-admin`

**Query parameters:**
- `branch_id`: Lọc theo chi nhánh
- `medicine_id`: Lọc theo thuốc
- `low_stock`: Lọc thuốc sắp hết (true/false)

```bash
curl -X GET "http://localhost:5000/api/inventory" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Với filter
curl -X GET "http://localhost:5000/api/inventory?branch_id=65a1b2c3d4e5f6g7h8i9j0k3&low_stock=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 7.2. Lấy báo cáo tồn kho toàn hệ thống

**Yêu cầu quyền**: `branch-manager` hoặc `system-admin`

**Query parameters:**
- `branch_id`: Lọc theo chi nhánh (optional)

```bash
curl -X GET "http://localhost:5000/api/inventory/report" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Với filter
curl -X GET "http://localhost:5000/api/inventory/report?branch_id=65a1b2c3d4e5f6g7h8i9j0k3" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📅 8. Work Schedules APIs

**Tất cả APIs đều yêu cầu authentication**

### 8.1. Tạo lịch làm việc mới

```bash
curl -X POST "http://localhost:5000/api/work-schedules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "date": "2024-01-20",
    "shift": "Ca sáng"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "date": "2024-01-20",
    "shift": "Ca sáng",
    "created_by": "65a1b2c3d4e5f6g7h8i9j0k4",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

### 8.2. Lấy tất cả lịch làm việc

```bash
curl -X GET "http://localhost:5000/api/work-schedules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
      "user_id": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "username": "user123",
        "name": "Nguyễn Văn A",
        "role": "employee"
      },
      "branch_id": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
        "name": "Chi nhánh 1",
        "address": "123 Đường ABC"
      },
      "date": "2024-01-20",
      "shift": "Ca sáng",
      "created_by": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
        "username": "admin",
        "name": "Admin User"
      },
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

---

### 8.3. Lấy lịch làm việc của user hiện tại (theo token)

```bash
curl -X GET "http://localhost:5000/api/work-schedules/my-schedule" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 8.4. Lấy lịch làm việc theo ID

```bash
curl -X GET "http://localhost:5000/api/work-schedules/65a1b2c3d4e5f6g7h8i9j0k9" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 8.5. Cập nhật lịch làm việc

```bash
curl -X PUT "http://localhost:5000/api/work-schedules/65a1b2c3d4e5f6g7h8i9j0k9" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift": "Ca chiều",
    "date": "2024-01-21"
  }'
```

---

### 8.6. Xóa lịch làm việc

```bash
curl -X DELETE "http://localhost:5000/api/work-schedules/65a1b2c3d4e5f6g7h8i9j0k9" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ⏰ 9. Attendance APIs

**Tất cả APIs đều yêu cầu authentication**

### 9.1. Checkin (Chấm công vào)

```bash
curl -X POST "http://localhost:5000/api/attendance/checkin" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "checkin_time": "2024-01-15T08:00:00.000Z"
  }'
```

**Hoặc đơn giản hơn (tự động lấy branch_id từ user và thời gian hiện tại):**

```bash
curl -X POST "http://localhost:5000/api/attendance/checkin" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Checkin thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0ka",
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "checkin_time": "2024-01-15T08:00:00.000Z",
    "checkout_time": null,
    "working_hours": 0,
    "status": "checked_in",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

**Lỗi nếu đã checkin chưa checkout:**
```json
{
  "success": false,
  "message": "Bạn đã checkin nhưng chưa checkout. Vui lòng checkout trước khi checkin mới."
}
```

---

### 9.2. Checkout (Chấm công ra)

```bash
curl -X POST "http://localhost:5000/api/attendance/checkout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_time": "2024-01-15T17:00:00.000Z"
  }'
```

**Hoặc đơn giản hơn (tự động dùng thời gian hiện tại):**

```bash
curl -X POST "http://localhost:5000/api/attendance/checkout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Checkout thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0ka",
    "user_id": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "username": "user123",
      "name": "Nguyễn Văn A",
      "role": "employee"
    },
    "branch_id": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Chi nhánh 1",
      "address": "123 Đường ABC"
    },
    "checkin_time": "2024-01-15T08:00:00.000Z",
    "checkout_time": "2024-01-15T17:00:00.000Z",
    "working_hours": 9,
    "status": "checked_out",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T17:00:00.000Z"
  }
}
```

**Lỗi nếu chưa checkin:**
```json
{
  "success": false,
  "message": "Bạn chưa checkin. Vui lòng checkin trước."
}
```

---

### 9.3. Lấy lịch sử chấm công của user hiện tại

```bash
curl -X GET "http://localhost:5000/api/attendance/my-attendance" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0ka",
      "user_id": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "username": "user123",
        "name": "Nguyễn Văn A",
        "role": "employee"
      },
      "branch_id": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
        "name": "Chi nhánh 1",
        "address": "123 Đường ABC"
      },
      "checkin_time": "2024-01-15T08:00:00.000Z",
      "checkout_time": "2024-01-15T17:00:00.000Z",
      "working_hours": 9,
      "status": "checked_out",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T17:00:00.000Z"
    }
  ]
}
```

---

### 9.4. Lấy tất cả lịch sử chấm công

```bash
curl -X GET "http://localhost:5000/api/attendance" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 9.5. Lấy thông tin chấm công theo ID

```bash
curl -X GET "http://localhost:5000/api/attendance/65a1b2c3d4e5f6g7h8i9j0ka" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 9.6. Cập nhật thông tin chấm công

```bash
curl -X PUT "http://localhost:5000/api/attendance/65a1b2c3d4e5f6g7h8i9j0ka" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "late",
    "working_hours": 8.5
  }'
```

---

### 9.7. Xóa thông tin chấm công

```bash
curl -X DELETE "http://localhost:5000/api/attendance/65a1b2c3d4e5f6g7h8i9j0ka" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 Lưu ý quan trọng

### 1. Authentication
- Hầu hết các API đều yêu cầu `accessToken` trong header
- Format: `Authorization: Bearer <accessToken>`
- Lấy token bằng cách đăng nhập qua API `/api/auth/login-username` hoặc `/api/auth/login`

### 2. Quyền truy cập
- Một số API yêu cầu quyền cụ thể:
  - `system-admin`: Quản trị viên hệ thống
  - `branch-manager`: Quản lý chi nhánh
  - `employee`: Nhân viên
  - `supplier-manager`: Quản lý nhà cung cấp

### 3. ObjectId
- Thay thế tất cả các ObjectId mẫu (`65a1b2c3d4e5f6g7h8i9j0k2`, etc.) bằng ID thực tế từ database của bạn

### 4. Format thời gian
- Sử dụng ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Ví dụ: `2024-01-15T08:00:00.000Z`

### 5. Port và Base URL
- Mặc định port: `5000`
- Có thể thay đổi trong file `.env`
- Nếu deploy lên server khác, thay `localhost:5000` bằng domain/IP của server

### 6. Error Handling
- Tất cả API đều trả về format:
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "Detailed error (optional)"
  }
  ```

### 7. Success Response
- Format chung:
  ```json
  {
    "success": true,
    "data": {...},
    "message": "Success message (optional)"
  }
  ```

---

## 🔄 Quy trình sử dụng API

1. **Đăng nhập** để lấy `accessToken`:
   ```bash
   curl -X POST "http://localhost:5000/api/auth/login-username" \
     -H "Content-Type: application/json" \
     -d '{"username": "your_username", "password": "your_password"}'
   ```

2. **Lưu accessToken** từ response

3. **Sử dụng accessToken** trong header `Authorization: Bearer <accessToken>` cho các API protected

4. **Kiểm tra quyền** của user trước khi gọi API yêu cầu quyền cụ thể

---

## 📚 Tổng kết các module

| Module | Số lượng API | Yêu cầu Auth |
|--------|-------------|--------------|
| Auth | 3 | ❌ |
| Users | 1 | ✅ |
| Branches | 7 | Một số |
| Medicines | 5 | ❌ |
| Suppliers | 5 | ❌ |
| Imports | 4 | ✅ |
| Inventory | 2 | ✅ |
| Work Schedules | 6 | ✅ |
| Attendance | 7 | ✅ |
| **TỔNG** | **40** | |

---

**Chúc bạn sử dụng API thành công! 🚀**

