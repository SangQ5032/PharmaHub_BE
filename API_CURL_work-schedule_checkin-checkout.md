# Các câu lệnh cURL cho API Work Schedules và Attendance

## Cấu hình cơ bản

- **Base URL**: `http://localhost:5000/api`
- **Port mặc định**: `5000` (có thể thay đổi trong file `.env`)
- **Header bắt buộc**: `Authorization: Bearer <accessToken>`

---

## 🔷 API Work Schedules (Lịch làm việc)

### 1. Lấy tất cả lịch làm việc

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
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
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
      "date": "2024-01-15",
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

### 2. Lấy lịch làm việc của user hiện tại (theo token)

```bash
curl -X GET "http://localhost:5000/api/work-schedules/my-schedule" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
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
      "date": "2024-01-15",
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

### 3. Tạo lịch làm việc mới

```bash
curl -X POST "http://localhost:5000/api/work-schedules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "date": "2024-01-20",
    "shift": "Ca chiều"
  }'
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "branch_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "date": "2024-01-20",
    "shift": "Ca chiều",
    "created_by": "65a1b2c3d4e5f6g7h8i9j0k4",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

## 🔷 API Attendance (Chấm công)

### 1. Checkin (Chấm công vào)

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
    "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
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

### 2. Checkout (Chấm công ra)

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
    "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
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

### 3. Lấy lịch sử chấm công của user hiện tại

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
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
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
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
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
      "checkin_time": "2024-01-14T08:00:00.000Z",
      "checkout_time": "2024-01-14T17:30:00.000Z",
      "working_hours": 9.5,
      "status": "checked_out",
      "createdAt": "2024-01-14T08:00:00.000Z",
      "updatedAt": "2024-01-14T17:30:00.000Z"
    }
  ]
}
```

---

## 📝 Lưu ý

1. **Thay thế `YOUR_ACCESS_TOKEN`** bằng token thực tế bạn nhận được sau khi đăng nhập
2. **Thay thế các ObjectId** (`65a1b2c3d4e5f6g7h8i9j0k2`, etc.) bằng ID thực tế từ database của bạn
3. **Format thời gian**: Sử dụng ISO 8601 format (ví dụ: `2024-01-15T08:00:00.000Z`)
4. **Port**: Mặc định là `5000`, có thể thay đổi trong file `.env`
5. **Base URL**: Nếu deploy lên server khác, thay `localhost:5000` bằng domain/IP của server

---

## 🔐 Lấy Access Token

Để lấy access token, bạn cần đăng nhập trước:

```bash
# Đăng nhập với username/password
curl -X POST "http://localhost:5000/api/auth/login-username" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response sẽ chứa accessToken:**
```json
{
  "success": true,
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

Sau đó sử dụng `accessToken` này trong header `Authorization: Bearer <accessToken>` cho các API khác.

