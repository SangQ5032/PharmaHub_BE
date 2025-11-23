// MODULE: SUPPLIERS - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
import SupplierService from './suppliers.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

/**
 * GET /api/suppliers
 * Lấy danh sách nhà cung cấp
 * Query params: page, limit, q (search), status
 */
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const result = await SupplierService.getSuppliersWithPagination(req.query)
  res.status(200).json({
    success: true,
    message: 'Lấy danh sách nhà cung cấp thành công',
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  })
})

/**
 * GET /api/suppliers/:id
 * Lấy chi tiết nhà cung cấp
 */
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.getSupplierById(req.params.id)
  res.status(200).json({
    success: true,
    message: 'Lấy chi tiết nhà cung cấp thành công',
    data: supplier,
  })
})

/**
 * POST /api/suppliers
 * Tạo nhà cung cấp mới
 * Body: { name, contact, note, status }
 */
export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.createSupplier(req.body)
  res.status(201).json({
    success: true,
    message: 'Tạo nhà cung cấp thành công',
    data: supplier,
  })
})

/**
 * PUT /api/suppliers/:id
 * Cập nhật nhà cung cấp
 * Body: { name, contact, note, status }
 */
export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.updateSupplier(req.params.id, req.body)
  res.status(200).json({
    success: true,
    message: 'Cập nhật nhà cung cấp thành công',
    data: supplier,
  })
})

/**
 * DELETE /api/suppliers/:id
 * Xóa nhà cung cấp
 */
export const deleteSupplier = asyncHandler(async (req, res) => {
  await SupplierService.deleteSupplier(req.params.id)
  res.status(200).json({
    success: true,
    message: 'Xóa nhà cung cấp thành công',
  })
})

/**
 * GET /api/suppliers/active
 * Lấy danh sách nhà cung cấp hoạt động
 */
export const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await SupplierService.getActiveSuppliers()
  res.status(200).json({
    success: true,
    message: 'Lấy danh sách nhà cung cấp hoạt động thành công',
    data: suppliers,
  })
})
