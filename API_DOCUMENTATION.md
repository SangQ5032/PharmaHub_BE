# API Documentation - PharmaHub Backend

Tài liệu chi tiết về tất cả các API endpoints trong hệ thống PharmaHub Backend.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Branches](#3-branches)
4. [Medicines](#4-medicines)
5. [Suppliers](#5-suppliers)
6. [Imports](#6-imports)
7. [Sales](#7-sales)
8. [Inventory](#8-inventory)
9. [Work Schedules](#9-work-schedules)
10. [Attendance](#10-attendance)
11. [Statistics](#11-statistics)
12. [Reports](#12-reports)

---

## 1. Authentication

### 1.1. Check Token

Kiểm tra Firebase ID Token và xác minh với MongoDB.

**Endpoint:** `POST /api/auth/check-token`

**Authentication:** Không yêu cầu

**Request Body:**
```json
{
  "idToken": "string" // Firebase ID Token
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Kiểm tra token thành công",
  "data": {
    "accessToken": "jwt_token_string",
    "user": {
      "id": "user_id",
      "username": "username",
      "name": "fullName",
      "phone": "0xxxxxxxxx",
      "email": "email",
      "role": "role",
      "branchId": "branch_id"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "ID Token là bắt buộc"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/check-token \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your_firebase_id_token_here"
  }'
```

---

## 2. Users

### 2.1. Get All Users

Lấy danh sách tất cả người dùng.

**Endpoint:** `GET /api/users`

**Authentication:** Required (Bearer Token)

**Authorization:** `system-admin`, `branch-manager`

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "username": "username",
      "name": "fullName",
      "phone": "0xxxxxxxxx",
      "email": "email",
      "role": "role",
      "branchId": "branch_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 3. Branches

### 3.1. Get All Branches

Lấy danh sách tất cả chi nhánh.

**Endpoint:** `GET /api/branches`

**Authentication:** Không yêu cầu

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "branch_id",
      "name": "Chi nhánh 1",
      "address": "123 Đường ABC",
      "phone": "0123456789",
      "revenue_target": 1000000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/branches
```

### 3.2. Get Branch By ID

Lấy thông tin chi tiết một chi nhánh.

**Endpoint:** `GET /api/branches/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "branch_id",
    "name": "Chi nhánh 1",
    "address": "123 Đường ABC",
    "phone": "0123456789",
    "revenue_target": 1000000
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid branch id"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Branch not found"
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/branches/branch_id_here
```

### 3.3. Create Branch

Tạo chi nhánh mới.

**Endpoint:** `POST /api/branches`

**Authentication:** Không yêu cầu

**Request Body:**
```json
{
  "name": "Chi nhánh 1",           // required
  "address": "123 Đường ABC",      // required
  "phone": "0123456789",           // required
  "revenue_target": 1000000        // optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "_id": "branch_id",
    "name": "Chi nhánh 1",
    "address": "123 Đường ABC",
    "phone": "0123456789",
    "revenue_target": 1000000
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "name, address and phone are required"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chi nhánh 1",
    "address": "123 Đường ABC",
    "phone": "0123456789",
    "revenue_target": 1000000
  }'
```

### 3.4. Update Branch

Cập nhật thông tin chi nhánh.

**Endpoint:** `PUT /api/branches/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của chi nhánh

**Request Body:**
```json
{
  "name": "Chi nhánh 1 Updated",   // optional
  "address": "456 Đường XYZ",      // optional
  "phone": "0987654321",           // optional
  "revenue_target": 2000000        // optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "branch_id",
    "name": "Chi nhánh 1 Updated",
    "address": "456 Đường XYZ",
    "phone": "0987654321",
    "revenue_target": 2000000
  }
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:5000/api/branches/branch_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chi nhánh 1 Updated",
    "address": "456 Đường XYZ"
  }'
```

### 3.5. Delete Branch

Xóa chi nhánh.

**Endpoint:** `DELETE /api/branches/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch deleted"
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/branches/branch_id_here
```

### 3.6. Get Inventory By Branch

Lấy tồn kho theo chi nhánh.

**Endpoint:** `GET /api/branches/:id/inventory`

**Authentication:** Required (Bearer Token)

**Authorization:** `employee`, `branch-manager`, `system-admin`

**Path Parameters:**
- `id` (string, required): ID của chi nhánh

**Query Parameters:**
- `medicine_id` (string, optional): Lọc theo ID thuốc
- `low_stock` (boolean, optional): Chỉ lấy thuốc sắp hết

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy tồn kho chi nhánh thành công",
  "data": [
    {
      "_id": "inventory_id",
      "branch_id": "branch_id",
      "medicine_id": "medicine_id",
      "medicine": {
        "name": "Thuốc A",
        "category": "Kháng sinh",
        "unit": "viên"
      },
      "quantity": 100,
      "last_updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/branches/branch_id_here/inventory?low_stock=true \
  -H "Authorization: Bearer your_access_token_here"
```

### 3.7. Get Inventory Report By Branch

Lấy báo cáo tồn kho theo chi nhánh.

**Endpoint:** `GET /api/branches/:id/reports/inventory`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Path Parameters:**
- `id` (string, required): ID của chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy báo cáo tồn kho chi nhánh thành công",
  "data": {
    "branch_id": "branch_id",
    "total_medicines": 50,
    "low_stock_medicines": 5,
    "out_of_stock_medicines": 2,
    "total_value": 5000000,
    "items": []
  }
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/branches/branch_id_here/reports/inventory \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 4. Medicines

### 4.1. Get All Medicines

Lấy danh sách thuốc (hỗ trợ tìm kiếm và phân trang).

**Endpoint:** `GET /api/medicines`

**Authentication:** Không yêu cầu

**Query Parameters:**
- `name` hoặc `q` (string, optional): Tìm kiếm theo tên (không phân biệt hoa thường)
- `category` (string, optional): Lọc theo loại thuốc
- `supplier_id` (string, optional): Lọc theo nhà cung cấp
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số lượng mỗi trang (default: 10)
- `sort` (string, optional): Sắp xếp (JSON string, VD: `{"createdAt":-1}`)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "medicine_id",
      "name": "Thuốc A",
      "description": "Mô tả thuốc",
      "category": "Kháng sinh",
      "unit": "viên",
      "price": 50000,
      "expiry_date": "2025-12-31T00:00:00.000Z",
      "supplier_id": "supplier_id",
      "warning_threshold": 50,
      "manufacturer": "Công ty ABC",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/medicines?name=thuốc&page=1&limit=10"
```

### 4.2. Get Medicine By ID

Lấy chi tiết một thuốc.

**Endpoint:** `GET /api/medicines/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của thuốc

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "medicine_id",
    "name": "Thuốc A",
    "description": "Mô tả thuốc",
    "category": "Kháng sinh",
    "unit": "viên",
    "price": 50000,
    "expiry_date": "2025-12-31T00:00:00.000Z",
    "supplier_id": "supplier_id",
    "warning_threshold": 50,
    "manufacturer": "Công ty ABC"
  }
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/medicines/medicine_id_here
```

### 4.3. Create Medicine

Tạo thuốc mới.

**Endpoint:** `POST /api/medicines`

**Authentication:** Không yêu cầu

**Request Body:**
```json
{
  "name": "Thuốc A",                          // required
  "description": "Mô tả thuốc",               // optional
  "category": "Kháng sinh",                   // required
  "unit": "viên",                             // required
  "price": 50000,                             // required, number >= 0
  "expiry_date": "2025-12-31T00:00:00.000Z", // required, ISO date
  "supplier_id": "supplier_id",               // required
  "warning_threshold": 50,                    // optional, number >= 0
  "manufacturer": "Công ty ABC"               // optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "_id": "medicine_id",
    "name": "Thuốc A",
    "description": "Mô tả thuốc",
    "category": "Kháng sinh",
    "unit": "viên",
    "price": 50000,
    "expiry_date": "2025-12-31T00:00:00.000Z",
    "supplier_id": "supplier_id",
    "warning_threshold": 50,
    "manufacturer": "Công ty ABC"
  }
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thuốc A",
    "category": "Kháng sinh",
    "unit": "viên",
    "price": 50000,
    "expiry_date": "2025-12-31T00:00:00.000Z",
    "supplier_id": "supplier_id"
  }'
```

### 4.4. Update Medicine

Cập nhật thông tin thuốc.

**Endpoint:** `PUT /api/medicines/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của thuốc

**Request Body:**
```json
{
  "name": "Thuốc A Updated",                  // optional
  "description": "Mô tả mới",                 // optional
  "category": "Giảm đau",                     // optional
  "unit": "hộp",                              // optional
  "price": 60000,                             // optional
  "expiry_date": "2026-12-31T00:00:00.000Z", // optional
  "supplier_id": "supplier_id",               // optional
  "warning_threshold": 100,                   // optional
  "manufacturer": "Công ty XYZ"               // optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "medicine_id",
    "name": "Thuốc A Updated",
    "price": 60000
  }
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:5000/api/medicines/medicine_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thuốc A Updated",
    "price": 60000
  }'
```

### 4.5. Delete Medicine

Xóa thuốc.

**Endpoint:** `DELETE /api/medicines/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của thuốc

**Response (Success - 204):**
```
No Content
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/medicines/medicine_id_here
```

---

## 5. Suppliers

### 5.1. Get All Suppliers

Lấy danh sách nhà cung cấp.

**Endpoint:** `GET /api/suppliers`

**Authentication:** Không yêu cầu

**Query Parameters:**
- `page` (number, optional): Trang hiện tại
- `limit` (number, optional): Số lượng mỗi trang
- `q` (string, optional): Tìm kiếm theo tên
- `status` (string, optional): Lọc theo trạng thái (`active`, `inactive`)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "supplier_id",
      "name": "Nhà cung cấp ABC",
      "contact": {
        "phone": "0123456789",
        "email": "contact@abc.com",
        "address": "123 Đường XYZ"
      },
      "note": "Ghi chú",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/suppliers?page=1&limit=10&status=active"
```

### 5.2. Get Supplier By ID

Lấy chi tiết một nhà cung cấp.

**Endpoint:** `GET /api/suppliers/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của nhà cung cấp

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "supplier_id",
    "name": "Nhà cung cấp ABC",
    "contact": {
      "phone": "0123456789",
      "email": "contact@abc.com",
      "address": "123 Đường XYZ"
    },
    "note": "Ghi chú",
    "status": "active"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Supplier not found"
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/suppliers/supplier_id_here
```

### 5.3. Create Supplier

Tạo nhà cung cấp mới.

**Endpoint:** `POST /api/suppliers`

**Authentication:** Không yêu cầu

**Request Body:**
```json
{
  "name": "Nhà cung cấp ABC",           // required
  "contact": {
    "phone": "0123456789",              // required, 10-11 số
    "email": "contact@abc.com",         // optional, valid email
    "address": "123 Đường XYZ"          // required
  },
  "note": "Ghi chú",                    // optional
  "status": "active"                    // optional: "active" | "inactive"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "supplier_id",
    "name": "Nhà cung cấp ABC",
    "contact": {
      "phone": "0123456789",
      "email": "contact@abc.com",
      "address": "123 Đường XYZ"
    },
    "note": "Ghi chú",
    "status": "active"
  }
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhà cung cấp ABC",
    "contact": {
      "phone": "0123456789",
      "email": "contact@abc.com",
      "address": "123 Đường XYZ"
    },
    "status": "active"
  }'
```

### 5.4. Update Supplier

Cập nhật thông tin nhà cung cấp.

**Endpoint:** `PUT /api/suppliers/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của nhà cung cấp

**Request Body:**
```json
{
  "name": "Nhà cung cấp ABC Updated",   // optional
  "contact": {
    "phone": "0987654321",              // optional, 10-11 số
    "email": "newemail@abc.com",        // optional, valid email
    "address": "456 Đường DEF"          // optional
  },
  "note": "Ghi chú mới",                // optional
  "status": "inactive"                  // optional: "active" | "inactive"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "supplier_id",
    "name": "Nhà cung cấp ABC Updated",
    "contact": {
      "phone": "0987654321",
      "address": "456 Đường DEF"
    },
    "status": "inactive"
  }
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:5000/api/suppliers/supplier_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhà cung cấp ABC Updated",
    "status": "inactive"
  }'
```

### 5.5. Delete Supplier

Xóa nhà cung cấp.

**Endpoint:** `DELETE /api/suppliers/:id`

**Authentication:** Không yêu cầu

**Path Parameters:**
- `id` (string, required): ID của nhà cung cấp

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "supplier_id",
    "name": "Nhà cung cấp ABC"
  }
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/suppliers/supplier_id_here
```

---

## 6. Imports

### 6.1. Create Import

Tạo phiếu nhập hàng mới.

**Endpoint:** `POST /api/imports`

**Authentication:** Required (Bearer Token)

**Authorization:** `employee`, `branch-manager`, `supplier-manager`, `system-admin`

**Request Body:**
```json
{
  "branch_id": "branch_id",                    // required
  "supplier_id": "supplier_id",                // required
  "items": [                                   // required, array with at least 1 item
    {
      "medicine_id": "medicine_id",            // required
      "quantity": 100,                         // required, number > 0
      "unit_price": 45000                      // required, number >= 0
    }
  ],
  "note": "Ghi chú",                           // optional
  "status": "completed"                        // optional: "pending" | "completed" | "cancelled"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Tạo phiếu nhập hàng thành công",
  "data": {
    "_id": "import_id",
    "branch_id": "branch_id",
    "supplier_id": "supplier_id",
    "employee_id": "employee_id",
    "items": [
      {
        "medicine_id": "medicine_id",
        "quantity": 100,
        "unit_price": 45000
      }
    ],
    "total_cost": 4500000,
    "note": "Ghi chú",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/imports \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "branch_id",
    "supplier_id": "supplier_id",
    "items": [
      {
        "medicine_id": "medicine_id",
        "quantity": 100,
        "unit_price": 45000
      }
    ]
  }'
```

### 6.2. Get All Imports

Lấy danh sách phiếu nhập hàng.

**Endpoint:** `GET /api/imports`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `branch_id` (string, optional): Lọc theo chi nhánh
- `supplier_id` (string, optional): Lọc theo nhà cung cấp
- `from_date` (string, optional): Từ ngày (ISO date)
- `to_date` (string, optional): Đến ngày (ISO date)
- `page` (number, optional): Trang hiện tại
- `limit` (number, optional): Số lượng mỗi trang

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu nhập thành công",
  "data": [
    {
      "_id": "import_id",
      "branch_id": "branch_id",
      "supplier_id": "supplier_id",
      "employee_id": "employee_id",
      "items": [],
      "total_cost": 4500000,
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/imports?branch_id=branch_id&page=1&limit=10" \
  -H "Authorization: Bearer your_access_token_here"
```

### 6.3. Get Import By ID

Lấy chi tiết một phiếu nhập hàng.

**Endpoint:** `GET /api/imports/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Path Parameters:**
- `id` (string, required): ID của phiếu nhập

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy chi tiết phiếu nhập thành công",
  "data": {
    "_id": "import_id",
    "branch_id": "branch_id",
    "branch": {
      "name": "Chi nhánh 1"
    },
    "supplier_id": "supplier_id",
    "supplier": {
      "name": "Nhà cung cấp ABC"
    },
    "employee_id": "employee_id",
    "employee": {
      "name": "Nguyễn Văn A"
    },
    "items": [
      {
        "medicine_id": "medicine_id",
        "medicine": {
          "name": "Thuốc A"
        },
        "quantity": 100,
        "unit_price": 45000
      }
    ],
    "total_cost": 4500000,
    "status": "completed"
  }
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/imports/import_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

### 6.4. Get Import Statistics

Lấy thống kê nhập hàng theo chi nhánh.

**Endpoint:** `GET /api/imports/stats/:branchId`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Path Parameters:**
- `branchId` (string, required): ID của chi nhánh

**Query Parameters:**
- `from_date` (string, optional): Từ ngày (ISO date)
- `to_date` (string, optional): Đến ngày (ISO date)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê nhập hàng thành công",
  "data": {
    "branch_id": "branch_id",
    "total_imports": 50,
    "total_cost": 50000000,
    "total_items": 5000,
    "by_supplier": [],
    "by_month": []
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/imports/stats/branch_id_here?from_date=2024-01-01&to_date=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 7. Sales

### 7.1. Create Invoice

Tạo hóa đơn bán hàng mới.

**Endpoint:** `POST /api/sales`

**Authentication:** Required (Bearer Token)

**Authorization:** `employee`, `branch-manager`, `system-admin`

**Request Body:**
```json
{
  "branch_id": "branch_id",                    // required
  "customer_name": "Nguyễn Văn A",            // optional
  "customer_phone": "0123456789",             // optional
  "items": [                                   // required, array with at least 1 item
    {
      "medicine_id": "medicine_id",            // required
      "quantity": 5,                           // required, number >= 1
      "unit_price": 50000                      // required, number >= 0
    }
  ],
  "discount": 0,                               // optional, number >= 0
  "tax_rate": 0,                               // optional, number >= 0 (default: 0)
  "payment_method": "cash",                    // optional: "cash" | "card" | "bank" | "e-wallet" (default: "cash")
  "note": "Ghi chú"                            // optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Tạo hóa đơn thành công",
  "data": {
    "_id": "invoice_id",
    "invoice_no": "INV-20240101-123456",
    "branch_id": "branch_id",
    "employee_id": "employee_id",
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0123456789",
    "items": [
      {
        "medicine_id": "medicine_id",
        "quantity": 5,
        "unit_price": 50000,
        "line_total": 250000
      }
    ],
    "subtotal": 250000,
    "discount": 0,
    "tax_rate": 0,
    "tax_amount": 0,
    "total_amount": 250000,
    "payment_method": "cash",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "branch_id",
    "customer_name": "Nguyễn Văn A",
    "items": [
      {
        "medicine_id": "medicine_id",
        "quantity": 5,
        "unit_price": 50000
      }
    ],
    "payment_method": "cash"
  }'
```

### 7.2. List Invoices

Lấy danh sách hóa đơn.

**Endpoint:** `GET /api/sales`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `branch_id` (string, optional): Lọc theo chi nhánh
- `from_date` (string, optional): Từ ngày (ISO date)
- `to_date` (string, optional): Đến ngày (ISO date)
- `customer_phone` (string, optional): Tìm kiếm theo số điện thoại khách hàng
- `page` (number, optional): Trang hiện tại
- `limit` (number, optional): Số lượng mỗi trang
- `sort` (string, optional): Sắp xếp (JSON string)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy danh sách hóa đơn thành công",
  "data": [
    {
      "_id": "invoice_id",
      "invoice_no": "INV-20240101-123456",
      "branch_id": "branch_id",
      "employee_id": "employee_id",
      "customer_name": "Nguyễn Văn A",
      "total_amount": 250000,
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/sales?branch_id=branch_id&page=1&limit=10" \
  -H "Authorization: Bearer your_access_token_here"
```

### 7.3. Get Invoice By ID

Lấy chi tiết một hóa đơn.

**Endpoint:** `GET /api/sales/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** `employee`, `branch-manager`, `system-admin`

**Path Parameters:**
- `id` (string, required): ID của hóa đơn

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy chi tiết hóa đơn thành công",
  "data": {
    "_id": "invoice_id",
    "invoice_no": "INV-20240101-123456",
    "branch_id": "branch_id",
    "branch": {
      "name": "Chi nhánh 1"
    },
    "employee_id": "employee_id",
    "employee": {
      "name": "Nguyễn Văn B"
    },
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0123456789",
    "items": [
      {
        "medicine_id": "medicine_id",
        "medicine": {
          "name": "Thuốc A"
        },
        "quantity": 5,
        "unit_price": 50000,
        "line_total": 250000
      }
    ],
    "subtotal": 250000,
    "discount": 0,
    "tax_rate": 0,
    "tax_amount": 0,
    "total_amount": 250000,
    "payment_method": "cash",
    "status": "completed",
    "note": "Ghi chú"
  }
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/sales/invoice_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 8. Inventory

### 8.1. Get All Inventory

Lấy tồn kho toàn hệ thống (chỉ admin).

**Endpoint:** `GET /api/inventory`

**Authentication:** Required (Bearer Token)

**Authorization:** `system-admin`

**Query Parameters:**
- `branch_id` (string, optional): Lọc theo chi nhánh
- `medicine_id` (string, optional): Lọc theo ID thuốc
- `low_stock` (boolean, optional): Chỉ lấy thuốc sắp hết

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy tồn kho toàn hệ thống thành công",
  "data": [
    {
      "_id": "inventory_id",
      "branch_id": "branch_id",
      "branch": {
        "name": "Chi nhánh 1"
      },
      "medicine_id": "medicine_id",
      "medicine": {
        "name": "Thuốc A",
        "category": "Kháng sinh"
      },
      "quantity": 100,
      "last_updated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/inventory?low_stock=true" \
  -H "Authorization: Bearer your_access_token_here"
```

### 8.2. Get Inventory Report All

Lấy báo cáo tồn kho toàn hệ thống.

**Endpoint:** `GET /api/inventory/report`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `branch_id` (string, optional): Lọc theo chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy báo cáo tồn kho toàn hệ thống thành công",
  "data": {
    "total_branches": 5,
    "total_medicines": 200,
    "low_stock_medicines": 20,
    "out_of_stock_medicines": 5,
    "total_value": 50000000,
    "by_branch": []
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/inventory/report?branch_id=branch_id" \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 9. Work Schedules

### 9.1. Create Work Schedule

Tạo lịch làm việc mới.

**Endpoint:** `POST /api/work-schedules`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "user_id": "user_id",        // required, ObjectId
  "branch_id": "branch_id",    // required, ObjectId
  "date": "2024-01-01",        // required, format: YYYY-MM-DD
  "shift": "morning"           // required, string
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "_id": "schedule_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "date": "2024-01-01",
    "shift": "morning",
    "created_by": "created_by_user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "user_id, branch_id, date, and shift are required"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/work-schedules \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id",
    "branch_id": "branch_id",
    "date": "2024-01-01",
    "shift": "morning"
  }'
```

### 9.2. Get All Work Schedules

Lấy tất cả lịch làm việc.

**Endpoint:** `GET /api/work-schedules`

**Authentication:** Required (Bearer Token)

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "schedule_id",
      "user_id": "user_id",
      "branch_id": "branch_id",
      "date": "2024-01-01",
      "shift": "morning",
      "created_by": "created_by_user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/work-schedules \
  -H "Authorization: Bearer your_access_token_here"
```

### 9.3. Get My Schedule

Lấy lịch làm việc của user hiện tại.

**Endpoint:** `GET /api/work-schedules/my-schedule`

**Authentication:** Required (Bearer Token)

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "schedule_id",
      "user_id": "user_id",
      "branch_id": "branch_id",
      "date": "2024-01-01",
      "shift": "morning",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/work-schedules/my-schedule \
  -H "Authorization: Bearer your_access_token_here"
```

### 9.4. Get Work Schedule By ID

Lấy lịch làm việc theo ID.

**Endpoint:** `GET /api/work-schedules/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của lịch làm việc

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "schedule_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "date": "2024-01-01",
    "shift": "morning"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Work schedule not found"
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/work-schedules/schedule_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

### 9.5. Update Work Schedule

Cập nhật lịch làm việc.

**Endpoint:** `PUT /api/work-schedules/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của lịch làm việc

**Request Body:**
```json
{
  "user_id": "user_id",        // optional
  "branch_id": "branch_id",    // optional
  "date": "2024-01-02",        // optional
  "shift": "afternoon"         // optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "schedule_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "date": "2024-01-02",
    "shift": "afternoon"
  }
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:5000/api/work-schedules/schedule_id_here \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "shift": "afternoon"
  }'
```

### 9.6. Delete Work Schedule

Xóa lịch làm việc.

**Endpoint:** `DELETE /api/work-schedules/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của lịch làm việc

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Work schedule deleted successfully"
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/work-schedules/schedule_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 10. Attendance

### 10.1. Checkin

Chấm công vào.

**Endpoint:** `POST /api/attendance/checkin`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "branch_id": "branch_id",           // optional, lấy từ user nếu không có
  "checkin_time": "2024-01-01T08:00:00Z"  // optional, mặc định là thời gian hiện tại
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Checkin thành công",
  "data": {
    "_id": "attendance_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "checkin_time": "2024-01-01T08:00:00.000Z",
    "checkout_time": null,
    "working_hours": 0,
    "status": "checked_in",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "User đã checkin hôm nay hoặc chưa checkout lần trước"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/attendance/checkin \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "branch_id"
  }'
```

### 10.2. Checkout

Chấm công ra.

**Endpoint:** `POST /api/attendance/checkout`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "checkout_time": "2024-01-01T17:00:00Z"  // optional, mặc định là thời gian hiện tại
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Checkout thành công",
  "data": {
    "_id": "attendance_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "checkin_time": "2024-01-01T08:00:00.000Z",
    "checkout_time": "2024-01-01T17:00:00.000Z",
    "working_hours": 9,
    "status": "checked_out",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "User chưa checkin hôm nay"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:5000/api/attendance/checkout \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 10.3. Get My Attendance

Lấy lịch sử chấm công của user hiện tại.

**Endpoint:** `GET /api/attendance/my-attendance`

**Authentication:** Required (Bearer Token)

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "attendance_id",
      "user_id": "user_id",
      "branch_id": "branch_id",
      "checkin_time": "2024-01-01T08:00:00.000Z",
      "checkout_time": "2024-01-01T17:00:00.000Z",
      "working_hours": 9,
      "status": "checked_out"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/attendance/my-attendance \
  -H "Authorization: Bearer your_access_token_here"
```

### 10.4. Get All Attendance

Lấy tất cả lịch sử chấm công.

**Endpoint:** `GET /api/attendance`

**Authentication:** Required (Bearer Token)

**Query Parameters:** Không có

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "attendance_id",
      "user_id": "user_id",
      "branch_id": "branch_id",
      "checkin_time": "2024-01-01T08:00:00.000Z",
      "checkout_time": "2024-01-01T17:00:00.000Z",
      "working_hours": 9,
      "status": "checked_out"
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/attendance \
  -H "Authorization: Bearer your_access_token_here"
```

### 10.5. Get Attendance By ID

Lấy thông tin chấm công theo ID.

**Endpoint:** `GET /api/attendance/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của attendance

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "attendance_id",
    "user_id": "user_id",
    "branch_id": "branch_id",
    "checkin_time": "2024-01-01T08:00:00.000Z",
    "checkout_time": "2024-01-01T17:00:00.000Z",
    "working_hours": 9,
    "status": "checked_out"
  }
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:5000/api/attendance/attendance_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

### 10.6. Update Attendance

Cập nhật thông tin chấm công.

**Endpoint:** `PUT /api/attendance/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của attendance

**Request Body:**
```json
{
  "checkin_time": "2024-01-01T08:00:00Z",     // optional
  "checkout_time": "2024-01-01T17:00:00Z",    // optional
  "status": "checked_out"                     // optional: "checked_in" | "checked_out" | "late" | "early" | "absent"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "attendance_id",
    "checkin_time": "2024-01-01T08:00:00.000Z",
    "checkout_time": "2024-01-01T17:00:00.000Z",
    "status": "checked_out"
  }
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:5000/api/attendance/attendance_id_here \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "checked_out"
  }'
```

### 10.7. Delete Attendance

Xóa thông tin chấm công.

**Endpoint:** `DELETE /api/attendance/:id`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `id` (string, required): ID của attendance

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Attendance deleted successfully"
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/attendance/attendance_id_here \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 11. Statistics

### 11.1. Get Overall Statistics

Lấy thống kê tổng quan (tổng số lượng, tổng doanh thu).

**Endpoint:** `GET /api/statistics/overall`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh
- `employeeId` (string, optional): Lọc theo nhân viên

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "total_invoices": 100,
    "total_quantity": 1000,
    "total_revenue": 50000000,
    "average_order_value": 500000,
    "total_customers": 50
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/overall?startDate=2024-01-01&endDate=2024-12-31&branchId=branch_id" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.2. Get Medicine Statistics

Lấy thống kê chi tiết theo từng thuốc.

**Endpoint:** `GET /api/statistics/medicines`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh
- `employeeId` (string, optional): Lọc theo nhân viên

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê theo thuốc thành công",
  "total": 50,
  "data": [
    {
      "medicine_id": "medicine_id",
      "medicine_name": "Thuốc A",
      "total_quantity": 100,
      "total_revenue": 5000000,
      "average_price": 50000
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/medicines?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.3. Get Top Selling Medicines

Lấy top thuốc bán chạy nhất.

**Endpoint:** `GET /api/statistics/top-selling`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh
- `employeeId` (string, optional): Lọc theo nhân viên
- `limit` (number, optional): Số lượng kết quả (default: 10)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy top thuốc bán chạy thành công",
  "total": 10,
  "data": [
    {
      "medicine_id": "medicine_id",
      "medicine_name": "Thuốc A",
      "total_quantity": 500,
      "total_revenue": 25000000,
      "rank": 1
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/top-selling?limit=10&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.4. Get Statistics By Period

Lấy thống kê theo khoảng thời gian (ngày, tuần, tháng).

**Endpoint:** `GET /api/statistics/by-period`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh
- `employeeId` (string, optional): Lọc theo nhân viên
- `groupBy` (string, optional): Nhóm theo (`day` | `month` | `year`)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê theo thời gian thành công",
  "groupBy": "day",
  "total": 30,
  "data": [
    {
      "period": "2024-01-01",
      "total_quantity": 100,
      "total_revenue": 5000000
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/by-period?groupBy=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.5. Get Statistics By Branch

Lấy thống kê theo chi nhánh (chỉ admin).

**Endpoint:** `GET /api/statistics/by-branch`

**Authentication:** Required (Bearer Token)

**Authorization:** `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê theo chi nhánh thành công",
  "total": 5,
  "data": [
    {
      "branch_id": "branch_id",
      "branch_name": "Chi nhánh 1",
      "total_invoices": 50,
      "total_revenue": 25000000,
      "total_quantity": 500
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/by-branch?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.6. Get Statistics By Employee

Lấy thống kê theo nhân viên.

**Endpoint:** `GET /api/statistics/by-employee`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy thống kê theo nhân viên thành công",
  "total": 10,
  "data": [
    {
      "employee_id": "employee_id",
      "employee_name": "Nguyễn Văn A",
      "total_invoices": 30,
      "total_revenue": 15000000,
      "total_quantity": 300
    }
  ]
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/by-employee?branchId=branch_id&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your_access_token_here"
```

### 11.7. Get Dashboard Stats

Lấy dashboard tổng hợp (kết hợp nhiều loại thống kê).

**Endpoint:** `GET /api/statistics/dashboard`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu (ISO date)
- `endDate` (string, optional): Ngày kết thúc (ISO date)
- `branchId` (string, optional): Lọc theo chi nhánh
- `employeeId` (string, optional): Lọc theo nhân viên

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy dashboard thành công",
  "data": {
    "overall": {
      "total_revenue": 50000000,
      "total_invoices": 100,
      "total_quantity": 1000
    },
    "top_selling": [],
    "by_period": [],
    "recent_invoices": []
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/statistics/dashboard?startDate=2024-01-01&endDate=2024-12-31&branchId=branch_id" \
  -H "Authorization: Bearer your_access_token_here"
```

---

## 12. Reports

### 12.1. Get Inventory Report All

Lấy báo cáo tồn kho toàn hệ thống.

**Endpoint:** `GET /api/inventory/report`

**Authentication:** Required (Bearer Token)

**Authorization:** `branch-manager`, `system-admin`

**Query Parameters:**
- `branch_id` (string, optional): Lọc theo chi nhánh

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lấy báo cáo tồn kho toàn hệ thống thành công",
  "data": {
    "total_branches": 5,
    "total_medicines": 200,
    "low_stock_medicines": 20,
    "out_of_stock_medicines": 5,
    "total_value": 50000000,
    "by_branch": [
      {
        "branch_id": "branch_id",
        "branch_name": "Chi nhánh 1",
        "total_medicines": 50,
        "low_stock": 5,
        "out_of_stock": 2,
        "total_value": 10000000
      }
    ]
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/inventory/report?branch_id=branch_id" \
  -H "Authorization: Bearer your_access_token_here"
```

---

## Authentication

Hầu hết các API yêu cầu authentication bằng Bearer Token. Token được lấy từ endpoint `/api/auth/check-token` sau khi xác thực Firebase ID Token.

**Cách sử dụng:**
```bash
Authorization: Bearer your_access_token_here
```

## Authorization Roles

Các role trong hệ thống:
- `system-admin`: Quản trị viên hệ thống
- `branch-manager`: Quản lý chi nhánh
- `employee`: Nhân viên
- `supplier-manager`: Quản lý nhà cung cấp

## Error Responses

Tất cả các lỗi đều có format chuẩn:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error message (optional)"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

**Lưu ý:** 
- Base URL có thể thay đổi tùy theo môi trường (development, staging, production)
- Tất cả các date format sử dụng ISO 8601 (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss.sssZ)
- ObjectId trong MongoDB có format 24 ký tự hex string

