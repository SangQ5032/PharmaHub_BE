# API Hướng Dẫn Sử Dụng - Thống Kê Doanh Thu Chi Nhánh

Tài liệu hướng dẫn sử dụng các API endpoint để thống kê doanh thu chi nhánh trong hệ thống PharmaHub.

## Tổng Quan

Hệ thống PharmaHub đã có sẵn chức năng thống kê doanh thu chi nhánh thông qua các endpoint sau:

1. **Thống kê theo chi nhánh** - `/api/statistics/by-branch` (Admin only)
2. **Thống kê tổng quan** - `/api/statistics/overall` (Có thể lọc theo chi nhánh)
3. **Dashboard tổng hợp** - `/api/statistics/dashboard` (Kết hợp nhiều loại thống kê)

## 1. Thống Kê Theo Chi Nhánh (Admin Only)

### Endpoint

```
GET /api/statistics/by-branch
```

### Mô Tả

Lấy thống kê doanh thu chi tiết theo từng chi nhánh. Endpoint này chỉ dành cho quản trị viên hệ thống.

### Yêu Cầu

- **Authentication**: Cần Bearer Token
- **Authorization**: `system-admin` (quản trị viên hệ thống)
- **Query Parameters**: Tùy chọn

### Query Parameters

| Parameter   | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| `startDate` | string | No       | Ngày bắt đầu (ISO date, VD: 2024-01-01)  |
| `endDate`   | string | No       | Ngày kết thúc (ISO date, VD: 2024-12-31) |

### Response Success (200)

```json
{
  "success": true,
  "message": "Lấy thống kê theo chi nhánh thành công",
  "total": 3,
  "data": [
    {
      "branch_id": "605c72b8f1a5b92d4c8d9e3a",
      "branch_name": "Chi nhánh 1",
      "branch_address": "123 Đường ABC, Quận 1, TP.HCM",
      "total_quantity": 1500,
      "total_revenue": 75000000,
      "total_invoices": 120,
      "average_order_value": 625000
    },
    {
      "branch_id": "605c72b8f1a5b92d4c8d9e3b",
      "branch_name": "Chi nhánh 2",
      "branch_address": "456 Đường XYZ, Quận 2, TP.HCM",
      "total_quantity": 1200,
      "total_revenue": 60000000,
      "total_invoices": 100,
      "average_order_value": 600000
    }
  ]
}
```

### Response Error (403)

```json
{
  "success": false,
  "message": "Access denied. Requires system-admin role"
}
```

### CURL Example

```bash
# Thống kê doanh thu toàn hệ thống
curl -X GET "http://localhost:5000/api/statistics/by-branch" \
  -H "Authorization: Bearer your_access_token_here"

# Thống kê doanh thu theo khoảng thời gian
curl -X GET "http://localhost:5000/api/statistics/by-branch?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

## 2. Thống Kê Tổng Quan (Có Thể Lọc Theo Chi Nhánh)

### Endpoint

```
GET /api/statistics/overall
```

### Mô Tả

Lấy thống kê tổng quan về doanh thu, có thể lọc theo chi nhánh cụ thể.

### Yêu Cầu

- **Authentication**: Cần Bearer Token
- **Authorization**: `branch-manager`, `system-admin`
- **Query Parameters**: Tùy chọn

### Query Parameters

| Parameter    | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| `startDate`  | string | No       | Ngày bắt đầu (ISO date)        |
| `endDate`    | string | No       | Ngày kết thúc (ISO date)       |
| `branchId`   | string | No       | Lọc theo ID chi nhánh cụ thể   |
| `employeeId` | string | No       | Lọc theo ID nhân viên (nếu có) |

### Response Success (200)

```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "total_invoices": 120,
    "total_quantity": 1500,
    "total_revenue": 75000000,
    "total_discount": 500000,
    "total_tax": 200000,
    "average_order_value": 625000,
    "total_customers": 100
  }
}
```

### CURL Example

```bash
# Thống kê tổng quan toàn hệ thống
curl -X GET "http://localhost:5000/api/statistics/overall" \
  -H "Authorization: Bearer your_access_token_here"

# Thống kê chi nhánh cụ thể
curl -X GET "http://localhost:5000/api/statistics/overall?branchId=605c72b8f1a5b92d4c8d9e3a" \
  -H "Authorization: Bearer your_access_token_here"

# Thống kê theo thời gian và chi nhánh
curl -X GET "http://localhost:5000/api/statistics/overall?startDate=2024-01-01&endDate=2024-12-31&branchId=605c72b8f1a5b92d4c8d9e3a" \
  -H "Authorization: Bearer your_access_token_here"
```

## 3. Dashboard Tổng Hợp

### Endpoint

```
GET /api/statistics/dashboard
```

### Mô Tả

Lấy dashboard tổng hợp bao gồm nhiều loại thống kê: tổng quan, top thuốc bán chạy, thống kê theo chi nhánh, thống kê theo nhân viên.

### Yêu Cầu

- **Authentication**: Cần Bearer Token
- **Authorization**: `branch-manager`, `system-admin`
- **Query Parameters**: Tùy chọn

### Query Parameters

| Parameter    | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| `startDate`  | string | No       | Ngày bắt đầu (ISO date)        |
| `endDate`    | string | No       | Ngày kết thúc (ISO date)       |
| `branchId`   | string | No       | Lọc theo ID chi nhánh cụ thể   |
| `employeeId` | string | No       | Lọc theo ID nhân viên (nếu có) |

### Response Success (200)

```json
{
  "success": true,
  "message": "Lấy dashboard thành công",
  "data": {
    "overall": {
      "total_invoices": 120,
      "total_quantity": 1500,
      "total_revenue": 75000000,
      "total_discount": 500000,
      "total_tax": 200000,
      "average_order_value": 625000
    },
    "top_selling": [
      {
        "medicine_id": "605c72b8f1a5b92d4c8d9e3c",
        "medicine_name": "Thuốc A",
        "total_quantity": 200,
        "total_revenue": 10000000,
        "rank": 1
      }
    ],
    "branch_stats": [
      {
        "branch_id": "605c72b8f1a5b92d4c8d9e3a",
        "branch_name": "Chi nhánh 1",
        "total_revenue": 45000000,
        "total_quantity": 900,
        "total_invoices": 70
      }
    ],
    "employee_stats": [
      {
        "employee_id": "605c72b8f1a5b92d4c8d9e3d",
        "employee_name": "Nguyễn Văn A",
        "total_revenue": 25000000,
        "total_quantity": 500,
        "total_invoices": 40
      }
    ]
  }
}
```

### CURL Example

```bash
# Dashboard tổng hợp toàn hệ thống
curl -X GET "http://localhost:5000/api/statistics/dashboard" \
  -H "Authorization: Bearer your_access_token_here"

# Dashboard cho chi nhánh cụ thể
curl -X GET "http://localhost:5000/api/statistics/dashboard?branchId=605c72b8f1a5b92d4c8d9e3a" \
  -H "Authorization: Bearer your_access_token_here"
```

## 4. Thống Kê Theo Khoảng Thời Gian

### Endpoint

```
GET /api/statistics/by-period
```

### Mô Tả

Lấy thống kê doanh thu theo khoảng thời gian (ngày, tuần, tháng) có thể lọc theo chi nhánh.

### Yêu Cầu

- **Authentication**: Cần Bearer Token
- **Authorization**: `branch-manager`, `system-admin`
- **Query Parameters**: Tùy chọn

### Query Parameters

| Parameter   | Type   | Required | Description                                             |
| ----------- | ------ | -------- | ------------------------------------------------------- |
| `startDate` | string | No       | Ngày bắt đầu (ISO date)                                 |
| `endDate`   | string | No       | Ngày kết thúc (ISO date)                                |
| `branchId`  | string | No       | Lọc theo ID chi nhánh cụ thể                            |
| `groupBy`   | string | No       | Nhóm theo: `day` \| `month` \| `year` (mặc định: `day`) |

### Response Success (200)

```json
{
  "success": true,
  "message": "Lấy thống kê theo thời gian thành công",
  "groupBy": "month",
  "total": 12,
  "data": [
    {
      "period": "2024-01",
      "total_quantity": 100,
      "total_revenue": 5000000,
      "total_invoices": 10
    },
    {
      "period": "2024-02",
      "total_quantity": 120,
      "total_revenue": 6000000,
      "total_invoices": 12
    }
  ]
}
```

### CURL Example

```bash
# Thống kê theo tháng cho toàn hệ thống
curl -X GET "http://localhost:5000/api/statistics/by-period?groupBy=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"

# Thống kê theo chi nhánh và theo ngày
curl -X GET "http://localhost:5000/api/statistics/by-period?branchId=605c72b8f1a5b92d4c8d9e3a&groupBy=day&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer your_access_token_here"
```

## 5. Thống Kê Top Thuốc Bán Chạy Theo Chi Nhánh

### Endpoint

```
GET /api/statistics/top-selling
```

### Mô Tả

Lấy top thuốc bán chạy nhất theo chi nhánh.

### Yêu Cầu

- **Authentication**: Cần Bearer Token
- **Authorization**: `branch-manager`, `system-admin`
- **Query Parameters**: Tùy chọn

### Query Parameters

| Parameter   | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| `startDate` | string | No       | Ngày bắt đầu (ISO date)          |
| `endDate`   | string | No       | Ngày kết thúc (ISO date)         |
| `branchId`  | string | No       | Lọc theo ID chi nh branch cụ thể |
| `limit`     | number | No       | Số lượng kết quả (mặc định: 10)  |

### CURL Example

```bash
# Top 10 thuốc bán chạy toàn hệ thống
curl -X GET "http://localhost:5000/api/statistics/top-selling?limit=10" \
  -H "Authorization: Bearer your_access_token_here"

# Top 5 thuốc bán chạy của chi nhánh cụ thể
curl -X GET "http://localhost:5000/api/statistics/top-selling?branchId=605c72b8f1a5b92d4c8d9e3a&limit=5" \
  -H "Authorization: Bearer your_access_token_here"
```

## Quyền Truy Cập

| Endpoint                      | Quyền Truy Cập                   | Mô Tả                                               |
| ----------------------------- | -------------------------------- | --------------------------------------------------- |
| `/api/statistics/by-branch`   | `system-admin`                   | Admin hệ thống có thể xem thống kê tất cả chi nhánh |
| `/api/statistics/overall`     | `branch-manager`, `system-admin` | Quản lý chi nhánh chỉ xem chi nhánh của mình        |
| `/api/statistics/dashboard`   | `branch-manager`, `system-admin` | Dashboard tổng hợp                                  |
| `/api/statistics/by-period`   | `branch-manager`, `system-admin` | Thống kê theo thời gian                             |
| `/api/statistics/top-selling` | `branch-manager`, `system-admin` | Top thuốc bán chạy                                  |

## Lưu Ý Quan Trọng

1. **Authentication**: Tất cả các endpoint đều yêu cầu Bearer Token
2. **Authorization**: Quyền truy cập được kiểm soát theo role
3. **Date Format**: Sử dụng ISO 8601 format (YYYY-MM-DD)
4. **Branch Manager**: Khi là `branch-manager`, hệ thống tự động lọc theo chi nhánh của user
5. **System Admin**: Có thể xem thống kê toàn bộ hệ thống

## Cách Lấy Token

```bash
# Lấy token từ Firebase ID Token
curl -X POST http://localhost:5000/api/auth/check-token \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your_firebase_id_token_here"
  }'
```

## Error Handling

### Common Errors

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **403 Forbidden**: Không có quyền truy cập (kiểm tra role)
- **400 Bad Request**: Dữ liệu query không hợp lệ
- **500 Internal Server Error**: Lỗi server

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error message (optional)"
}
```

## Tích Hợp Frontend

### JavaScript Example

```javascript
// Hàm gọi API thống kê chi nhánh
async function getBranchStatistics(branchId = null, startDate = null, endDate = null) {
  const params = new URLSearchParams()
  if (branchId) params.append('branchId', branchId)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await fetch(`/api/statistics/by-branch?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch statistics')
  }

  return await response.json()
}

// Sử dụng
getBranchStatistics('605c72b8f1a5b92d4c8d9e3a', '2024-01-01', '2024-12-31')
  .then((data) => console.log(data))
  .catch((error) => console.error(error))
```

---

**Lưu ý**: Các endpoint này đã được triển khai đầy đủ trong hệ thống. Bạn có thể sử dụng ngay mà không cần phát triển thêm.
