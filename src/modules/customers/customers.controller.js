// MODULE: CUSTOMERS - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
// - Không viết truy vấn DB tại đây
// - Không nhồi logic nghiệp vụ nặng tại đây
import * as customersService from './customers.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { messaging } from '../../../node_modules/firebase-admin/lib/firebase-namespace-api.js'

// POST /api/customers - tạo khách hàng
export const createCustomer = asyncHandler(async (req, res) => {
  const created = await customersService.createCustomer(req.body)
  res.status(201).json(created)
})

// GET /api/customers - danh sách khách hàng (phân trang/filter/search)
export const getCustomers = asyncHandler(async (req, res) => {
  const result = await customersService.getCustomers(req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách khách hàng thành công',
    data: result.data,
  })
})

// GET /api/customers/:id - chi tiết 1 khách hàng
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customersService.getCustomerById(req.params.id)
  res.json(customer)
})

// PUT /api/customers/:id - cập nhật 1 khách hàng
export const updateCustomer = asyncHandler(async (req, res) => {
  const updated = await customersService.updateCustomer(req.params.id, req.body)
  res.json(updated)
})

// DELETE /api/customers/:id - xóa 1 khách hàng
export const deleteCustomer = asyncHandler(async (req, res) => {
  await customersService.deleteCustomer(req.params.id)
  res.status(204).send()
})
