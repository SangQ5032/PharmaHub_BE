# API Thống Kê Bán Hàng - PharmaHub

## Tổng Quan

Module Statistics cung cấp các API để thống kê số lượng thuốc bán ra với các tính năng:

✅ Thống kê tổng quan (tổng số lượng, tổng doanh thu)  
✅ Thống kê chi tiết theo từng thuốc  
✅ Top thuốc bán chạy  
✅ Lọc theo thời gian, chi nhánh, nhân viên  
✅ Chỉ tính các hóa đơn completed

## Yêu Cầu Authentication

Tất cả các endpoint đều yêu cầu:

- Bearer Token trong header: `Authorization: Bearer <token>`
- Quyền: `branch-manager` hoặc `system-admin` (trừ `/by-branch` chỉ dành cho `system-admin`)

## Endpoints

### 1. Thống Kê Tổng Quan

**GET** `/api/statistics/overall`

Lấy tổng quan về doanh số bán hàng.

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu (ISO format: 2024-01-01)
endDate     (string, optional) - Ngày kết thúc (ISO format: 2024-12-31)
branchId    (string, optional) - ID chi nhánh
employeeId  (string, optional) - ID nhân viên
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "totalQuantity": 1250,
    "totalRevenue": 45000000,
    "totalInvoices": 150,
    "totalDiscount": 2500000,
    "totalTax": 4050000
  }
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/overall?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

---

### 2. Thống Kê Chi Tiết Theo Thuốc

**GET** `/api/statistics/medicines`

Lấy thống kê chi tiết cho từng loại thuốc đã bán.

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
branchId    (string, optional) - ID chi nhánh
employeeId  (string, optional) - ID nhân viên
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy thống kê theo thuốc thành công",
  "total": 25,
  "data": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "medicineName": "Paracetamol 500mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Giảm đau - Hạ sốt",
      "totalQuantity": 500,
      "totalRevenue": 2500000,
      "averagePrice": 5000,
      "timesOrdered": 45
    },
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "medicineName": "Amoxicillin 250mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Kháng sinh",
      "totalQuantity": 300,
      "totalRevenue": 4500000,
      "averagePrice": 15000,
      "timesOrdered": 30
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/medicines?branchId=674a1b2c3d4e5f6g" \
  -H "Authorization: Bearer <token>"
```

---

### 3. Top Thuốc Bán Chạy

**GET** `/api/statistics/top-selling`

Lấy danh sách thuốc bán chạy nhất (sắp xếp theo số lượng).

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
branchId    (string, optional) - ID chi nhánh
employeeId  (string, optional) - ID nhân viên
limit       (number, optional) - Số lượng thuốc muốn lấy (default: 10)
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy top thuốc bán chạy thành công",
  "total": 5,
  "data": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "medicineName": "Paracetamol 500mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Giảm đau - Hạ sốt",
      "totalQuantity": 500,
      "totalRevenue": 2500000,
      "averagePrice": 5000,
      "timesOrdered": 45
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/top-selling?limit=5" \
  -H "Authorization: Bearer <token>"
```

---

### 4. Thống Kê Theo Khoảng Thời Gian

**GET** `/api/statistics/by-period`

Lấy thống kê nhóm theo ngày/tháng/năm.

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
branchId    (string, optional) - ID chi nhánh
employeeId  (string, optional) - ID nhân viên
groupBy     (string, optional) - Nhóm theo: "day" | "month" | "year" (default: "day")
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy thống kê theo thời gian thành công",
  "groupBy": "day",
  "total": 30,
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 11,
        "day": 1
      },
      "totalQuantity": 50,
      "totalRevenue": 1500000,
      "totalInvoices": 5
    },
    {
      "_id": {
        "year": 2024,
        "month": 11,
        "day": 2
      },
      "totalQuantity": 45,
      "totalRevenue": 1200000,
      "totalInvoices": 4
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/by-period?groupBy=month&startDate=2024-01-01" \
  -H "Authorization: Bearer <token>"
```

---

### 5. Thống Kê Theo Chi Nhánh

**GET** `/api/statistics/by-branch`

Lấy thống kê so sánh giữa các chi nhánh (chỉ system-admin).

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy thống kê theo chi nhánh thành công",
  "total": 3,
  "data": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "branchName": "Chi nhánh Quận 1",
      "branchAddress": "123 Nguyễn Huệ, Q1, TP.HCM",
      "totalQuantity": 1000,
      "totalRevenue": 30000000,
      "totalInvoices": 100
    },
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "branchName": "Chi nhánh Quận 3",
      "branchAddress": "456 Lê Văn Sỹ, Q3, TP.HCM",
      "totalQuantity": 800,
      "totalRevenue": 25000000,
      "totalInvoices": 80
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/by-branch?startDate=2024-11-01" \
  -H "Authorization: Bearer <token>"
```

---

### 6. Thống Kê Theo Nhân Viên

**GET** `/api/statistics/by-employee`

Lấy thống kê hiệu suất bán hàng của từng nhân viên.

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
branchId    (string, optional) - ID chi nhánh
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy thống kê theo nhân viên thành công",
  "total": 5,
  "data": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "employeeName": "Nguyễn Văn A",
      "employeeUsername": "nva",
      "totalQuantity": 600,
      "totalRevenue": 18000000,
      "totalInvoices": 60
    },
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "employeeName": "Trần Thị B",
      "employeeUsername": "ttb",
      "totalQuantity": 400,
      "totalRevenue": 12000000,
      "totalInvoices": 40
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/by-employee?branchId=674a1b2c3d4e5f6g" \
  -H "Authorization: Bearer <token>"
```

---

### 7. Dashboard Tổng Hợp

**GET** `/api/statistics/dashboard`

Lấy dashboard kết hợp nhiều loại thống kê (tổng quan + top 5 thuốc + thống kê chi nhánh + nhân viên).

**Query Parameters:**

```
startDate   (string, optional) - Ngày bắt đầu
endDate     (string, optional) - Ngày kết thúc
branchId    (string, optional) - ID chi nhánh
employeeId  (string, optional) - ID nhân viên
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy dashboard thành công",
  "data": {
    "overall": {
      "totalQuantity": 1250,
      "totalRevenue": 45000000,
      "totalInvoices": 150,
      "totalDiscount": 2500000,
      "totalTax": 4050000
    },
    "topMedicines": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0k",
        "medicineName": "Paracetamol 500mg",
        "totalQuantity": 500,
        "totalRevenue": 2500000
      }
    ],
    "branchStats": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0k",
        "branchName": "Chi nhánh Quận 1",
        "totalRevenue": 30000000
      }
    ],
    "employeeStats": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0k",
        "employeeName": "Nguyễn Văn A",
        "totalRevenue": 18000000
      }
    ]
  }
}
```

**Example:**

```bash
curl -X GET "http://localhost:5000/api/statistics/dashboard" \
  -H "Authorization: Bearer <token>"
```

---

## Lưu Ý

### 1. Định dạng thời gian

- Sử dụng ISO 8601 format: `YYYY-MM-DD`
- Ví dụ: `2024-11-14`
- `startDate`: Bắt đầu từ 00:00:00 của ngày
- `endDate`: Kết thúc vào 23:59:59 của ngày

### 2. Chỉ tính hóa đơn completed

- Tất cả các thống kê chỉ tính các hóa đơn có `status: 'completed'`
- Không tính các hóa đơn `cancelled` hoặc `refunded`

### 3. Phân quyền

- **branch-manager**: Xem thống kê chi nhánh của mình
- **system-admin**: Xem toàn bộ thống kê hệ thống

### 4. Performance

- Sử dụng MongoDB aggregation pipeline để tối ưu hiệu suất
- Có index trên `status`, `branch_id`, `employee_id`, `createdAt`
- Nên giới hạn khoảng thời gian truy vấn để tăng tốc độ

## Use Cases

### Case 1: Xem doanh thu tháng này

```bash
GET /api/statistics/overall?startDate=2024-11-01&endDate=2024-11-30
```

### Case 2: Top 10 thuốc bán chạy nhất tại chi nhánh

```bash
GET /api/statistics/top-selling?branchId=674a1b2c3d4e5f6g&limit=10
```

### Case 3: So sánh hiệu suất nhân viên trong tuần

```bash
GET /api/statistics/by-employee?startDate=2024-11-08&endDate=2024-11-14&branchId=674a1b2c3d4e5f6g
```

### Case 4: Phân tích xu hướng bán hàng theo tháng

```bash
GET /api/statistics/by-period?groupBy=month&startDate=2024-01-01&endDate=2024-12-31
```

### Case 5: Dashboard tổng quan hệ thống

```bash
GET /api/statistics/dashboard
```

---

**Phát triển bởi**: PharmaHub Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024-11-14
