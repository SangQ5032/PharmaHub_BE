# TÀI LIỆU MODULE THỐNG KÊ DOANH THU (STATISTICS MODULE)

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cơ Chế Hoạt Động](#cơ-chế-hoạt-động)
3. [API Endpoints](#api-endpoints)
4. [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
5. [Ví Dụ Request/Response](#ví-dụ-requestresponse)
6. [Lưu Ý Quan Trọng](#lưu-ý-quan-trọng)

---

## 📊 Tổng Quan

Module Statistics được thiết kế chuyên biệt để thống kê doanh thu bán hàng của hệ thống PharmaHub. Module cung cấp các báo cáo chi tiết về:

### Các Loại Thống Kê:

- **Thống kê tổng quan**: Tổng doanh thu, số lượng bán, số hóa đơn
- **Thống kê theo thời gian**: Theo ngày/tuần/tháng/năm để theo dõi xu hướng
- **Thống kê theo chi nhánh**: So sánh hiệu suất giữa các chi nhánh
- **Thống kê theo nhân viên**: Hiệu suất bán hàng của từng nhân viên
- **Thống kê theo thuốc**: Doanh thu và số lượng theo từng loại thuốc
- **Dashboard tổng hợp**: Kết hợp nhiều loại thống kê trong một API call

---

## ⚙️ Cơ Chế Hoạt Động

### Nguyên Tắc Tính Toán:

1. **Chỉ tính hóa đơn hoàn thành**:
   - Chỉ các hóa đơn có `status: 'completed'` được đưa vào thống kê
   - Loại bỏ các hóa đơn `pending`, `cancelled`, hoặc các trạng thái khác

2. **Tính theo tổng giá trị**:
   - Doanh thu được tính theo `total_amount` (đã bao gồm thuế và chiết khấu)
   - Chi tiết: `total_amount = subtotal + tax_amount - discount`

3. **Dữ liệu Realtime**:
   - Dữ liệu lấy trực tiếp từ collection `invoices` trong MongoDB
   - Sử dụng MongoDB Aggregation Pipeline để tối ưu hiệu suất

4. **Tính năng lọc linh hoạt**:
   - Lọc theo khoảng thời gian (startDate, endDate)
   - Lọc theo chi nhánh (branchId)
   - Lọc theo nhân viên (employeeId)

### Cấu Trúc Dữ Liệu:

```javascript
// SalesInvoice Schema
{
  _id: ObjectId,
  invoice_number: String,
  branch_id: ObjectId,          // Tham chiếu đến chi nhánh
  employee_id: ObjectId,         // Tham chiếu đến nhân viên
  customer_id: ObjectId,         // Tham chiếu đến khách hàng
  items: [{                      // Danh sách thuốc trong hóa đơn
    medicine_id: ObjectId,
    quantity: Number,
    unit_price: Number,
    line_total: Number
  }],
  subtotal: Number,
  discount: Number,
  tax_amount: Number,
  total_amount: Number,          // Giá trị cuối cùng
  status: String,                // 'completed', 'pending', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Base URL

```
/api/statistics
```

### Authentication

Tất cả các endpoints yêu cầu:

- ✅ Authentication: Bearer Token trong header
- ✅ Authorization: Roles `branch-manager` hoặc `system-admin` (trừ `/by-branch` chỉ cho `system-admin`)

---

## 1️⃣ Thống Kê Tổng Quan

### `GET /api/statistics/overall`

Lấy tổng quan về doanh thu, số lượng bán và số hóa đơn.

#### Query Parameters:

| Parameter  | Type              | Required | Mô tả                            |
| ---------- | ----------------- | -------- | -------------------------------- |
| startDate  | String (ISO 8601) | ❌       | Ngày bắt đầu (VD: "2024-01-01")  |
| endDate    | String (ISO 8601) | ❌       | Ngày kết thúc (VD: "2024-12-31") |
| branchId   | String (ObjectId) | ❌       | ID chi nhánh cần lọc             |
| employeeId | String (ObjectId) | ❌       | ID nhân viên cần lọc             |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "totalQuantity": 1250,
    "totalRevenue": 45000000,
    "totalInvoices": 85,
    "totalDiscount": 2000000,
    "totalTax": 4500000
  }
}
```

#### Giải Thích Response:

- `totalQuantity`: Tổng số lượng sản phẩm đã bán
- `totalRevenue`: Tổng doanh thu (VNĐ)
- `totalInvoices`: Tổng số hóa đơn hoàn thành
- `totalDiscount`: Tổng tiền chiết khấu
- `totalTax`: Tổng tiền thuế

---

## 2️⃣ Thống Kê Theo Thời Gian

### `GET /api/statistics/by-period`

Thống kê doanh thu theo từng khoảng thời gian (ngày/tuần/tháng/năm).

#### Query Parameters:

| Parameter  | Type              | Required | Mô tả                                                       |
| ---------- | ----------------- | -------- | ----------------------------------------------------------- |
| startDate  | String (ISO 8601) | ❌       | Ngày bắt đầu                                                |
| endDate    | String (ISO 8601) | ❌       | Ngày kết thúc                                               |
| branchId   | String (ObjectId) | ❌       | ID chi nhánh                                                |
| employeeId | String (ObjectId) | ❌       | ID nhân viên                                                |
| groupBy    | String            | ❌       | Nhóm theo: `day`, `week`, `month`, `year` (Mặc định: `day`) |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy thống kê theo thời gian thành công",
  "groupBy": "day",
  "total": 3,
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "day": 15
      },
      "totalQuantity": 450,
      "totalRevenue": 15000000,
      "totalInvoices": 28
    },
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "day": 16
      },
      "totalQuantity": 380,
      "totalRevenue": 12500000,
      "totalInvoices": 22
    },
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "day": 17
      },
      "totalQuantity": 420,
      "totalRevenue": 17500000,
      "totalInvoices": 35
    }
  ]
}
```

#### Ví Dụ với groupBy = "month":

```json
{
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1
      },
      "totalQuantity": 5200,
      "totalRevenue": 180000000,
      "totalInvoices": 320
    }
  ]
}
```

---

## 3️⃣ Thống Kê Theo Chi Nhánh

### `GET /api/statistics/by-branch`

So sánh hiệu suất doanh thu giữa các chi nhánh.

**⚠️ Chỉ dành cho `system-admin`**

#### Query Parameters:

| Parameter | Type              | Required | Mô tả         |
| --------- | ----------------- | -------- | ------------- |
| startDate | String (ISO 8601) | ❌       | Ngày bắt đầu  |
| endDate   | String (ISO 8601) | ❌       | Ngày kết thúc |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy thống kê theo chi nhánh thành công",
  "total": 3,
  "data": [
    {
      "_id": "6478a1234bcdef567890abcd",
      "branchName": "Chi Nhánh Quận 1",
      "branchAddress": "123 Nguyễn Huệ, Q.1, TP.HCM",
      "totalQuantity": 2500,
      "totalRevenue": 85000000,
      "totalInvoices": 150
    },
    {
      "_id": "6478a1234bcdef567890abce",
      "branchName": "Chi Nhánh Quận 3",
      "branchAddress": "456 Lê Văn Sỹ, Q.3, TP.HCM",
      "totalQuantity": 1800,
      "totalRevenue": 62000000,
      "totalInvoices": 110
    },
    {
      "_id": "6478a1234bcdef567890abcf",
      "branchName": "Chi Nhánh Thủ Đức",
      "branchAddress": "789 Võ Văn Ngân, TP.Thủ Đức",
      "totalQuantity": 1200,
      "totalRevenue": 43000000,
      "totalInvoices": 85
    }
  ]
}
```

**Lưu ý**: Kết quả được sắp xếp theo `totalRevenue` giảm dần.

---

## 4️⃣ Thống Kê Theo Nhân Viên

### `GET /api/statistics/by-employee`

Xem hiệu suất bán hàng của từng nhân viên.

#### Query Parameters:

| Parameter | Type              | Required | Mô tả              |
| --------- | ----------------- | -------- | ------------------ |
| startDate | String (ISO 8601) | ❌       | Ngày bắt đầu       |
| endDate   | String (ISO 8601) | ❌       | Ngày kết thúc      |
| branchId  | String (ObjectId) | ❌       | Lọc theo chi nhánh |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy thống kê theo nhân viên thành công",
  "total": 5,
  "data": [
    {
      "_id": "6478a1234bcdef567890abc1",
      "employeeName": "Nguyễn Văn An",
      "employeeUsername": "nguyenvanan",
      "totalQuantity": 850,
      "totalRevenue": 28000000,
      "totalInvoices": 52
    },
    {
      "_id": "6478a1234bcdef567890abc2",
      "employeeName": "Trần Thị Bình",
      "employeeUsername": "tranbinhpharma",
      "totalQuantity": 720,
      "totalRevenue": 24500000,
      "totalInvoices": 45
    }
  ]
}
```

**Lưu ý**: Kết quả được sắp xếp theo `totalRevenue` giảm dần.

---

## 5️⃣ Thống Kê Theo Thuốc

### `GET /api/statistics/medicines`

Xem chi tiết doanh thu và số lượng bán theo từng loại thuốc.

#### Query Parameters:

| Parameter  | Type              | Required | Mô tả         |
| ---------- | ----------------- | -------- | ------------- |
| startDate  | String (ISO 8601) | ❌       | Ngày bắt đầu  |
| endDate    | String (ISO 8601) | ❌       | Ngày kết thúc |
| branchId   | String (ObjectId) | ❌       | ID chi nhánh  |
| employeeId | String (ObjectId) | ❌       | ID nhân viên  |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy thống kê theo thuốc thành công",
  "total": 50,
  "data": [
    {
      "_id": "6478a1234bcdef567890def1",
      "medicineName": "Paracetamol 500mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Hạ sốt - Giảm đau",
      "totalQuantity": 1500,
      "totalRevenue": 7500000,
      "averagePrice": 5000,
      "timesOrdered": 95
    },
    {
      "_id": "6478a1234bcdef567890def2",
      "medicineName": "Amoxicillin 500mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Kháng sinh",
      "totalQuantity": 800,
      "totalRevenue": 12000000,
      "averagePrice": 15000,
      "timesOrdered": 52
    }
  ]
}
```

**Lưu ý**: Kết quả được sắp xếp theo `totalRevenue` giảm dần.

---

## 6️⃣ Top Thuốc Bán Chạy

### `GET /api/statistics/top-selling`

Lấy danh sách top thuốc bán chạy nhất.

#### Query Parameters:

| Parameter  | Type              | Required | Mô tả                           |
| ---------- | ----------------- | -------- | ------------------------------- |
| startDate  | String (ISO 8601) | ❌       | Ngày bắt đầu                    |
| endDate    | String (ISO 8601) | ❌       | Ngày kết thúc                   |
| branchId   | String (ObjectId) | ❌       | ID chi nhánh                    |
| employeeId | String (ObjectId) | ❌       | ID nhân viên                    |
| limit      | Number            | ❌       | Số lượng kết quả (Mặc định: 10) |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy top thuốc bán chạy thành công",
  "total": 10,
  "data": [
    {
      "_id": "6478a1234bcdef567890def1",
      "medicineName": "Paracetamol 500mg",
      "medicineUnit": "Viên",
      "medicineCategory": "Hạ sốt - Giảm đau",
      "totalQuantity": 1500,
      "totalRevenue": 7500000,
      "averagePrice": 5000,
      "timesOrdered": 95
    }
  ]
}
```

**Lưu ý**: Kết quả được sắp xếp theo `totalQuantity` giảm dần.

---

## 7️⃣ Dashboard Tổng Hợp

### `GET /api/statistics/dashboard`

Lấy dashboard tổng hợp bao gồm nhiều loại thống kê trong một lần gọi API.

#### Query Parameters:

| Parameter  | Type              | Required | Mô tả         |
| ---------- | ----------------- | -------- | ------------- |
| startDate  | String (ISO 8601) | ❌       | Ngày bắt đầu  |
| endDate    | String (ISO 8601) | ❌       | Ngày kết thúc |
| branchId   | String (ObjectId) | ❌       | ID chi nhánh  |
| employeeId | String (ObjectId) | ❌       | ID nhân viên  |

#### Response Success (200):

```json
{
  "success": true,
  "message": "Lấy dashboard thành công",
  "data": {
    "overall": {
      "totalQuantity": 5500,
      "totalRevenue": 190000000,
      "totalInvoices": 350,
      "totalDiscount": 8000000,
      "totalTax": 19000000
    },
    "topMedicines": [
      {
        "_id": "6478a1234bcdef567890def1",
        "medicineName": "Paracetamol 500mg",
        "totalQuantity": 1500,
        "totalRevenue": 7500000
      }
    ],
    "branchStats": [
      {
        "_id": "6478a1234bcdef567890abcd",
        "branchName": "Chi Nhánh Quận 1",
        "totalRevenue": 85000000,
        "totalInvoices": 150
      }
    ],
    "employeeStats": [
      {
        "_id": "6478a1234bcdef567890abc1",
        "employeeName": "Nguyễn Văn An",
        "totalRevenue": 28000000,
        "totalInvoices": 52
      }
    ]
  }
}
```

**Ưu điểm**:

- Giảm số lần gọi API
- Tối ưu hiệu suất với Promise.all
- Phù hợp cho màn hình dashboard

---

## 🛠️ Hướng Dẫn Sử Dụng

### 1. Authentication

Tất cả các API đều yêu cầu authentication token trong header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Content-Type': 'application/json'
}
```

### 2. Ví Dụ Sử Dụng với JavaScript (Fetch API)

#### Lấy thống kê tổng quan tháng này:

```javascript
const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const response = await fetch(
  `/api/statistics/overall?` +
    `startDate=${firstDayOfMonth.toISOString()}&` +
    `endDate=${lastDayOfMonth.toISOString()}`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
)

const data = await response.json()
console.log('Doanh thu tháng này:', data.data.totalRevenue)
```

#### Lấy thống kê theo ngày trong tuần này:

```javascript
const today = new Date()
const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

const response = await fetch(
  `/api/statistics/by-period?` +
    `startDate=${firstDayOfWeek.toISOString()}&` +
    `endDate=${lastDayOfWeek.toISOString()}&` +
    `groupBy=day`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
)

const data = await response.json()
console.log('Doanh thu theo ngày:', data.data)
```

#### Lấy top 5 thuốc bán chạy nhất:

```javascript
const response = await fetch(`/api/statistics/top-selling?limit=5`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
console.log('Top 5 thuốc bán chạy:', data.data)
```

### 3. Ví Dụ với Axios

```javascript
import axios from 'axios'

// Cấu hình axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
})

// Lấy dashboard
const getDashboard = async (filters) => {
  try {
    const response = await api.get('/statistics/dashboard', {
      params: filters,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard:', error.response?.data)
    throw error
  }
}

// Sử dụng
const dashboardData = await getDashboard({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  branchId: '6478a1234bcdef567890abcd',
})
```

### 4. Ví Dụ với React Query (React/React Native)

```javascript
import { useQuery } from '@tanstack/react-query'

// Hook để lấy thống kê tổng quan
const useOverallStatistics = (filters) => {
  return useQuery({
    queryKey: ['statistics', 'overall', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/statistics/overall?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  })
}

// Sử dụng trong component
function StatisticsScreen() {
  const { data, isLoading, error } = useOverallStatistics({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <h2>Doanh thu: {data.data.totalRevenue.toLocaleString()} VNĐ</h2>
      <p>Số hóa đơn: {data.data.totalInvoices}</p>
    </div>
  )
}
```

---

## 📝 Các Trường Hợp Sử Dụng Thực Tế

### Case 1: Báo cáo doanh thu hàng tháng

```javascript
// Lấy doanh thu từng tháng trong năm 2024
const getMonthlyRevenue2024 = async () => {
  const response = await fetch(
    `/api/statistics/by-period?` +
      `startDate=2024-01-01&` +
      `endDate=2024-12-31&` +
      `groupBy=month`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.json()
}
```

### Case 2: So sánh hiệu suất giữa các chi nhánh

```javascript
// Xem chi nhánh nào bán chạy nhất quý 1/2024
const getQ1BranchComparison = async () => {
  const response = await fetch(
    `/api/statistics/by-branch?` + `startDate=2024-01-01&` + `endDate=2024-03-31`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.json()
}
```

### Case 3: Xem hiệu suất nhân viên trong tháng

```javascript
// Top nhân viên bán hàng tốt nhất tháng này
const getTopEmployeesThisMonth = async (branchId) => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  const response = await fetch(
    `/api/statistics/by-employee?` +
      `startDate=${firstDay.toISOString()}&` +
      `endDate=${today.toISOString()}&` +
      `branchId=${branchId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.json()
}
```

### Case 4: Phân tích thuốc cần nhập thêm

```javascript
// Xem thuốc nào bán chạy để nhập hàng
const getMedicinesForRestocking = async (branchId) => {
  const response = await fetch(
    `/api/statistics/top-selling?` + `branchId=${branchId}&` + `limit=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.json()
}
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Performance (Hiệu Suất)

- Sử dụng index trên các field: `branch_id`, `employee_id`, `createdAt`, `status`
- Aggregation pipeline đã được tối ưu
- Với dataset lớn, nên:
  - Giới hạn khoảng thời gian tìm kiếm
  - Sử dụng pagination cho endpoints trả về danh sách lớn
  - Cache kết quả ở frontend (recommended: 5-10 phút)

### 2. Date Format

- Tất cả date phải theo format ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Ví dụ: `2024-01-15T00:00:00.000Z`
- Có thể dùng `new Date().toISOString()` trong JavaScript

### 3. ObjectId Validation

- `branchId`, `employeeId` phải là ObjectId hợp lệ (24 ký tự hex)
- API sẽ trả về lỗi nếu ObjectId không hợp lệ

### 4. Authorization

- `branch-manager`: Có thể xem thống kê của chi nhánh mình quản lý
- `system-admin`: Có thể xem toàn bộ thống kê của tất cả chi nhánh
- Endpoint `/by-branch` chỉ dành cho `system-admin`

### 5. Error Handling

#### Các lỗi thường gặp:

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Không có quyền truy cập. Vui lòng đăng nhập."
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này."
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "message": "groupBy phải là: day, week, month hoặc year"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Lỗi khi lấy thống kê: [Chi tiết lỗi]"
}
```

### 6. Best Practices

✅ **Nên làm:**

- Cache kết quả thống kê ở frontend
- Sử dụng dashboard endpoint thay vì gọi nhiều API riêng lẻ
- Giới hạn khoảng thời gian hợp lý (không quá 1 năm)
- Validate input trước khi gọi API

❌ **Không nên:**

- Gọi API quá thường xuyên (< 1 phút)
- Query dữ liệu quá lớn mà không có filter
- Để exposed sensitive data như chi tiết giá thuốc khi không cần thiết
- Bỏ qua error handling

---

## 📊 Sơ Đồ Luồng Dữ Liệu

```
[Frontend Request]
       ↓
[Authentication Middleware] → Verify JWT Token
       ↓
[Authorization Middleware] → Check User Role
       ↓
[Statistics Controller] → Validate & Parse Query Params
       ↓
[Statistics Service] → Business Logic Validation
       ↓
[Statistics Repository] → Build MongoDB Aggregation
       ↓
[MongoDB Database] → Execute Query & Return Data
       ↓
[Statistics Repository] → Format Data
       ↓
[Statistics Service] → Add Metadata
       ↓
[Statistics Controller] → Send Response
       ↓
[Frontend Response]
```

---

## 🔧 Troubleshooting

### Vấn đề: Không có dữ liệu trả về

**Nguyên nhân:**

- Không có hóa đơn `completed` trong khoảng thời gian tìm kiếm
- Filter quá chặt (branchId, employeeId không đúng)
- Date format không hợp lệ

**Giải pháp:**

- Kiểm tra có hóa đơn completed trong database không
- Thử bỏ filter để test
- Kiểm tra format date

### Vấn đề: Response chậm

**Nguyên nhân:**

- Dataset quá lớn
- Không có index
- Query phạm vi thời gian quá rộng

**Giải pháp:**

- Thêm index: `db.salesinvoices.createIndex({branch_id: 1, createdAt: -1, status: 1})`
- Giới hạn khoảng thời gian
- Sử dụng pagination

### Vấn đề: 403 Forbidden

**Nguyên nhân:**

- User role không đủ quyền
- Token hết hạn

**Giải pháp:**

- Kiểm tra role của user (phải là branch-manager hoặc system-admin)
- Refresh token

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có bất kỳ vấn đề nào khi sử dụng module Statistics, vui lòng:

1. Kiểm tra lại documentation này
2. Xem logs ở backend để biết chi tiết lỗi
3. Liên hệ team Backend để được hỗ trợ

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Maintainer:** PharmaHub Development Team
