// MODULE: MEDICINES - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
// - Không viết truy vấn DB tại đây
// - Không nhồi logic nghiệp vụ nặng tại đây
import * as medicinesService from './medicines.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

// POST /api/medicines - tạo thuốc
export const createMedicine = asyncHandler(async (req, res) => {
  const created = await medicinesService.createMedicine(req.body)
  res.status(201).json({
    success: true,
    message: 'Tạo thuốc thành công',
    data: created,
  })
})

// GET /api/medicines - danh sách thuốc (phân trang/filter/search)
// Query params:
//   - name hoặc q: tìm kiếm theo tên
//   - category_id: lọc theo loại thuốc
//   - status: lọc theo trạng thái (active/inactive/discontinued)
//   - page, limit: phân trang
//   - sort: sắp xếp (JSON string, VD: {"createdAt":-1})
export const getMedicines = asyncHandler(async (req, res) => {
  const result = await medicinesService.getMedicines(req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/medicines/:id - chi tiết 1 thuốc
export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await medicinesService.getMedicineById(req.params.id)
  res.json({
    success: true,
    message: 'Lấy chi tiết thuốc thành công',
    data: medicine,
  })
})

// PUT /api/medicines/:id - cập nhật 1 thuốc
export const updateMedicine = asyncHandler(async (req, res) => {
  const updated = await medicinesService.updateMedicine(req.params.id, req.body)
  res.json({
    success: true,
    message: 'Cập nhật thuốc thành công',
    data: updated,
  })
})

// DELETE /api/medicines/:id - xóa 1 thuốc
export const deleteMedicine = asyncHandler(async (req, res) => {
  await medicinesService.deleteMedicine(req.params.id)
  res.status(204).json({
    success: true,
    message: 'Xóa thuốc thành công',
  })
})

// GET /api/medicines/category/:categoryId - danh sách thuốc theo loại
export const getMedicinesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params
  const result = await medicinesService.getMedicinesByCategory(categoryId, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc theo loại thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/medicines/status/:status - danh sách thuốc theo trạng thái
export const getMedicinesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params
  const result = await medicinesService.getMedicinesByStatus(status, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc theo trạng thái thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/medicines/low-stock - danh sách thuốc cần nhập hàng
export const getLowStockMedicines = asyncHandler(async (req, res) => {
  const result = await medicinesService.getLowStockMedicines(req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc cần nhập hàng thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/medicines/by-branch/:branchId - danh sách thuốc theo chi nhánh (kèm lô hàng và tồn kho)
export const getMedicinesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params
  const result = await medicinesService.getMedicinesByBranch(branchId, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc theo chi nhánh thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/medicines/:medicineId/inventory-all-branches - kiểm tra tồn kho 1 thuốc tại tất cả cửa hàng
export const getInventoryAllBranches = asyncHandler(async (req, res) => {
  const { medicineId } = req.params
  const result = await medicinesService.getInventoryAllBranches(medicineId, req.query)
  res.json({
    success: true,
    message: 'Lấy tồn kho thuốc tại tất cả chi nhánh thành công',
    data: result.data,
  })
})
