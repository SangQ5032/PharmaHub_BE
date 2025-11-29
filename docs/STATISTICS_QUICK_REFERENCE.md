# Statistics API - Quick Reference

## Base URL

```
/api/statistics
```

## Authentication Required

All endpoints require JWT Bearer Token in header:

```
Authorization: Bearer YOUR_TOKEN
```

---

## 📋 Quick Endpoints Reference

| Endpoint       | Method | Description             | Access                       |
| -------------- | ------ | ----------------------- | ---------------------------- |
| `/overall`     | GET    | Tổng quan doanh thu     | branch-manager, system-admin |
| `/by-period`   | GET    | Thống kê theo thời gian | branch-manager, system-admin |
| `/by-branch`   | GET    | Thống kê theo chi nhánh | system-admin only            |
| `/by-employee` | GET    | Thống kê theo nhân viên | branch-manager, system-admin |
| `/medicines`   | GET    | Thống kê theo thuốc     | branch-manager, system-admin |
| `/top-selling` | GET    | Top thuốc bán chạy      | branch-manager, system-admin |
| `/dashboard`   | GET    | Dashboard tổng hợp      | branch-manager, system-admin |

---

## 🔍 Common Query Parameters

| Parameter    | Type     | Description                     | Example                    |
| ------------ | -------- | ------------------------------- | -------------------------- |
| `startDate`  | ISO 8601 | Ngày bắt đầu                    | `2024-01-01T00:00:00.000Z` |
| `endDate`    | ISO 8601 | Ngày kết thúc                   | `2024-12-31T23:59:59.999Z` |
| `branchId`   | ObjectId | Filter theo chi nhánh           | `6478a1234bcdef567890abcd` |
| `employeeId` | ObjectId | Filter theo nhân viên           | `6478a1234bcdef567890abc1` |
| `groupBy`    | String   | Nhóm theo (day/week/month/year) | `month`                    |
| `limit`      | Number   | Giới hạn số kết quả             | `10`                       |

---

## 💡 Quick Examples

### Get this month's revenue

```bash
GET /api/statistics/overall?startDate=2024-01-01&endDate=2024-01-31
```

### Get daily statistics for last week

```bash
GET /api/statistics/by-period?startDate=2024-01-08&endDate=2024-01-14&groupBy=day
```

### Get top 5 selling medicines

```bash
GET /api/statistics/top-selling?limit=5
```

### Get branch comparison

```bash
GET /api/statistics/by-branch?startDate=2024-01-01&endDate=2024-12-31
```

### Get employee performance for a branch

```bash
GET /api/statistics/by-employee?branchId=6478a1234bcdef567890abcd
```

### Get complete dashboard

```bash
GET /api/statistics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

---

## 📊 Response Structure

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    /* data object */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🎯 Quick JavaScript Examples

### Fetch API

```javascript
const response = await fetch('/api/statistics/overall?startDate=2024-01-01', {
  headers: { Authorization: `Bearer ${token}` },
})
const data = await response.json()
```

### Axios

```javascript
const { data } = await axios.get('/api/statistics/overall', {
  headers: { Authorization: `Bearer ${token}` },
  params: { startDate: '2024-01-01' },
})
```

---

## ⚡ Tips

1. **Cache results** on frontend (5-10 minutes recommended)
2. **Use dashboard endpoint** instead of multiple separate calls
3. **Limit date range** to last 1 year for better performance
4. **Filter by branch** when possible to reduce query size
5. **Handle errors** properly with try-catch

---

## 📖 Full Documentation

See [STATISTICS_MODULE_DOCUMENTATION.md](./STATISTICS_MODULE_DOCUMENTATION.md) for complete details.

---

## 🔒 Authorization Roles

- **branch-manager**: Can view statistics for their branch
- **system-admin**: Can view all statistics across all branches

---

## ⚠️ Important Notes

- Only `completed` invoices are counted
- Revenue = `total_amount` (includes tax and discount)
- All dates must be in ISO 8601 format
- ObjectIds must be 24 character hex strings
- Default `groupBy` is `day` if not specified
- Default `limit` is `10` for top-selling endpoint
