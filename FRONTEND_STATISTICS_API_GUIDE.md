# Frontend API Integration Guide - Statistics Module

## Overview

This guide provides detailed instructions for frontend developers on how to integrate with the PharmaHub Statistics API. It includes request/response examples, error handling patterns, and best practices for calling the statistics endpoints.

## Base URL Configuration

```javascript
// Base API URL
const BASE_URL = 'http://localhost:5000/api/statistics'

// Common headers
const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})
```

## Authentication

All endpoints require:

- **Bearer Token**: Include in Authorization header
- **Permissions**: `branch-manager` or `system-admin`
- **Note**: `/by-branch` endpoint requires `system-admin` only

## API Endpoints

### 1. Overall Statistics

**Endpoint**: `GET /api/statistics/overall`

**Purpose**: Get comprehensive sales overview

**Parameters**:

```typescript
interface OverallStatsParams {
  startDate?: string // ISO format: "2024-01-01"
  endDate?: string // ISO format: "2024-12-31"
  branchId?: string // Branch ID
  employeeId?: string // Employee ID
}
```

**Response Interface**:

```typescript
interface OverallStatsResponse {
  success: boolean
  message: string
  data: {
    totalQuantity: number
    totalRevenue: number
    totalInvoices: number
    totalDiscount: number
    totalTax: number
  }
}
```

**Example Implementation**:

```javascript
async function getOverallStatistics(params = {}) {
  const url = new URL(`${BASE_URL}/overall`)

  // Add query parameters
  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching overall stats:', error)
    throw error
  }
}

// Usage examples
getOverallStatistics({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  branchId: '674a1b2c3d4e5f6g',
})
```

### 2. Medicine Statistics

**Endpoint**: `GET /api/statistics/medicines`

**Purpose**: Get detailed statistics for each medicine

**Parameters**: Same as Overall Statistics

**Response Interface**:

```typescript
interface MedicineStatsResponse {
  success: boolean
  message: string
  total: number
  data: Array<{
    _id: string
    medicineName: string
    medicineUnit: string
    medicineCategory: string
    totalQuantity: number
    totalRevenue: number
    averagePrice: number
    timesOrdered: number
  }>
}
```

**Example Implementation**:

```javascript
async function getMedicineStatistics(params = {}) {
  const url = new URL(`${BASE_URL}/medicines`)

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching medicine stats:', error)
    throw error
  }
}

// Usage with pagination simulation
async function getMedicineStatsWithFilter(filters) {
  const response = await getMedicineStatistics(filters)

  // Process data for frontend
  const processedData = response.data.map((medicine) => ({
    id: medicine._id,
    name: medicine.medicineName,
    unit: medicine.medicineUnit,
    category: medicine.medicineCategory,
    totalSold: medicine.totalQuantity,
    revenue: medicine.totalRevenue,
    avgPrice: medicine.averagePrice,
    orderCount: medicine.timesOrdered,
  }))

  return {
    ...response,
    data: processedData,
  }
}
```

### 3. Top Selling Medicines

**Endpoint**: `GET /api/statistics/top-selling`

**Purpose**: Get best-selling medicines list

**Parameters**:

```typescript
interface TopSellingParams {
  startDate?: string
  endDate?: string
  branchId?: string
  employeeId?: string
  limit?: number // Default: 10
}
```

**Example Implementation**:

```javascript
async function getTopSellingMedicines(params = {}) {
  const defaultParams = { limit: 10 }
  const mergedParams = { ...defaultParams, ...params }

  const url = new URL(`${BASE_URL}/top-selling`)

  Object.keys(mergedParams).forEach((key) => {
    url.searchParams.append(key, mergedParams[key])
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching top selling medicines:', error)
    throw error
  }
}

// Usage examples
getTopSellingMedicines({ limit: 5 })
getTopSellingMedicines({
  branchId: '674a1b2c3d4e5f6g',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
})
```

### 4. Period Statistics

**Endpoint**: `GET /api/statistics/by-period`

**Purpose**: Get statistics grouped by time periods

**Parameters**:

```typescript
interface PeriodParams {
  startDate?: string
  endDate?: string
  branchId?: string
  employeeId?: string
  groupBy?: 'day' | 'month' | 'year' // Default: 'day'
}
```

**Response Interface**:

```typescript
interface PeriodStatsResponse {
  success: boolean
  message: string
  groupBy: string
  total: number
  data: Array<{
    _id: {
      year: number
      month?: number
      day?: number
    }
    totalQuantity: number
    totalRevenue: number
    totalInvoices: number
  }>
}
```

**Example Implementation**:

```javascript
async function getPeriodStatistics(params = {}) {
  const defaultParams = { groupBy: 'day' }
  const mergedParams = { ...defaultParams, ...params }

  const url = new URL(`${BASE_URL}/by-period`)

  Object.keys(mergedParams).forEach((key) => {
    url.searchParams.append(key, mergedParams[key])
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform data for charting libraries
    const chartData = data.data.map((item) => ({
      date: new Date(item._id.year, (item._id.month || 1) - 1, item._id.day || 1)
        .toISOString()
        .split('T')[0],
      quantity: item.totalQuantity,
      revenue: item.totalRevenue,
      invoices: item.totalInvoices,
    }))

    return {
      ...data,
      chartData,
    }
  } catch (error) {
    console.error('Error fetching period stats:', error)
    throw error
  }
}

// Usage for different chart types
getPeriodStatistics({ groupBy: 'month', startDate: '2024-01-01' })
getPeriodStatistics({ groupBy: 'day', startDate: '2024-11-01', endDate: '2024-11-14' })
```

### 5. Branch Statistics

**Endpoint**: `GET /api/statistics/by-branch`

**Purpose**: Compare statistics between branches (system-admin only)

**Response Interface**:

```typescript
interface BranchStatsResponse {
  success: boolean
  message: string
  total: number
  data: Array<{
    _id: string
    branchName: string
    branchAddress: string
    totalQuantity: number
    totalRevenue: number
    totalInvoices: number
  }>
}
```

**Example Implementation**:

```javascript
async function getBranchStatistics(params = {}) {
  const url = new URL(`${BASE_URL}/by-branch`)

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: System admin privileges required')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching branch stats:', error)
    throw error
  }
}
```

### 6. Employee Statistics

**Endpoint**: `GET /api/statistics/by-employee`

**Purpose**: Get employee sales performance statistics

**Parameters**:

```typescript
interface EmployeeParams {
  startDate?: string
  endDate?: string
  branchId?: string
}
```

**Example Implementation**:

```javascript
async function getEmployeeStatistics(params = {}) {
  const url = new URL(`${BASE_URL}/by-employee`)

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching employee stats:', error)
    throw error
  }
}

// Usage example
getEmployeeStatistics({
  branchId: '674a1b2c3d4e5f6g',
  startDate: '2024-11-01',
  endDate: '2024-11-14',
})
```

### 7. Dashboard Statistics

**Endpoint**: `GET /api/statistics/dashboard`

**Purpose**: Get comprehensive dashboard data

**Response Interface**:

```typescript
interface DashboardResponse {
  success: boolean
  message: string
  data: {
    overall: {
      totalQuantity: number
      totalRevenue: number
      totalInvoices: number
      totalDiscount: number
      totalTax: number
    }
    topMedicines: Array<{
      _id: string
      medicineName: string
      totalQuantity: number
      totalRevenue: number
    }>
    branchStats: Array<{
      _id: string
      branchName: string
      totalRevenue: number
    }>
    employeeStats: Array<{
      _id: string
      employeeName: string
      totalRevenue: number
    }>
  }
}
```

**Example Implementation**:

```javascript
async function getDashboardStatistics(params = {}) {
  const url = new URL(`${BASE_URL}/dashboard`)

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key])
    }
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(userToken),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform data for dashboard components
    const dashboardData = {
      ...data,
      data: {
        ...data.data,
        // Add computed fields
        averageOrderValue: data.data.overall.totalRevenue / data.data.overall.totalInvoices,
        topMedicinesChart: data.data.topMedicines.map((item) => ({
          name: item.medicineName,
          value: item.totalQuantity,
        })),
      },
    }

    return dashboardData
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}
```

## Error Handling

**Common Error Responses**:

```typescript
interface ErrorResponse {
  success: false
  message: string
  error?: string
  statusCode: number
}
```

**Error Handling Pattern**:

```javascript
async function apiCallWithErrorHandling(apiCall) {
  try {
    const response = await apiCall()

    if (!response.success) {
      throw new Error(response.message)
    }

    return response
  } catch (error) {
    // Handle different error types
    if (error.message.includes('Access denied')) {
      // Redirect to login or show permission error
      handleAuthError(error)
    } else if (error.message.includes('HTTP error')) {
      // Show network error
      handleNetworkError(error)
    } else {
      // Show general error
      handleGeneralError(error)
    }

    throw error
  }
}

// Usage
try {
  const stats = await apiCallWithErrorHandling(() =>
    getOverallStatistics({ startDate: '2024-01-01' })
  )
  // Process successful response
} catch (error) {
  // Error already handled, but you can add additional logic here
}
```

## Utility Functions

**Date Formatting**:

```javascript
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

function getThisMonthRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  }
}

// Usage
const thisMonth = getThisMonthRange()
getOverallStatistics(thisMonth)
```

**Loading States**:

```javascript
function useStatisticsApi(apiFunction) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async (params) => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFunction(params)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchData }
}

// Usage in React component
const { data, loading, error, fetchData } = useStatisticsApi(getOverallStatistics)

useEffect(() => {
  fetchData({ startDate: '2024-01-01', endDate: '2024-12-31' })
}, [])
```

## Best Practices

1. **Caching**: Implement caching for frequently accessed data
2. **Pagination**: Handle large datasets appropriately
3. **Loading States**: Always show loading indicators for better UX
4. **Error Boundaries**: Implement proper error handling
5. **Validation**: Validate input parameters before API calls
6. **Rate Limiting**: Implement request debouncing for search/filter operations

## Common Use Cases

**Monthly Sales Report**:

```javascript
const monthlyReport = await getPeriodStatistics({
  groupBy: 'day',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
})
```

**Branch Performance Comparison**:

```javascript
const branchComparison = await getBranchStatistics({
  startDate: '2024-11-01',
  endDate: '2024-11-14',
})
```

**Top Products Analysis**:

```javascript
const topProducts = await getTopSellingMedicines({
  limit: 20,
  branchId: '674a1b2c3d4e5f6g',
})
```

## Integration Checklist

- [ ] Implement authentication handling
- [ ] Add proper error boundaries
- [ ] Implement loading states
- [ ] Add input validation
- [ ] Configure base URL for different environments
- [ ] Add TypeScript interfaces
- [ ] Implement caching strategy
- [ ] Add unit tests for API functions
- [ ] Add error logging
- [ ] Implement request/response interceptors for global handling

---

**For support**: Contact the backend team or refer to the original [STATISTICS_API.md](STATISTICS_API.md) documentation.
