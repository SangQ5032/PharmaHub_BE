// MODULE: MEDICINES - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
// - Không viết truy vấn DB tại đây
// - Không nhồi logic nghiệp vụ nặng tại đây
import * as medicinesService from './medicines.service.js'
import * as importService from './medicines.import.service.js'
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

// GET /api/medicines/active - danh sách thuốc đang hoạt động
export const getActiveMedicines = asyncHandler(async (req, res) => {
  const result = await medicinesService.getActiveMedicines(req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc đang hoạt động thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// POST /api/medicines/import - import thuốc từ file Excel
export const importMedicines = asyncHandler(async (req, res) => {
  // Log để debug
  console.log('📤 Import request received:', {
    contentType: req.headers['content-type'],
    hasFile: !!req.file,
    bodyKeys: Object.keys(req.body),
    fileInfo: req.file ? { name: req.file.originalname, size: req.file.size } : null,
  })

  if (!req.file) {
    // Kiểm tra Content-Type để đưa ra message cụ thể hơn
    const contentType = req.headers['content-type'] || ''
    let message = 'Vui lòng chọn file Excel để import'

    if (contentType.includes('application/x-www-form-urlencoded')) {
      message =
        'Content-Type không đúng. Vui lòng sử dụng multipart/form-data khi gửi file. Trong React Native, đảm bảo bạn sử dụng FormData và KHÔNG set header Content-Type (để fetch tự động set).'
    } else if (contentType.includes('application/json')) {
      message = 'Không thể gửi file dưới dạng JSON. Vui lòng sử dụng FormData để gửi file.'
    } else if (!contentType.includes('multipart/form-data')) {
      message = `Content-Type "${contentType}" không được hỗ trợ. Vui lòng sử dụng multipart/form-data.`
    }

    return res.status(400).json({
      success: false,
      message: message,
      hint: 'Đảm bảo bạn đang sử dụng FormData và field name là "file"',
    })
  }

  const result = await importService.importMedicinesFromExcel(req.file.path)

  // Tạo message chi tiết hơn
  let message = `Import thành công ${result.success.length} thuốc`
  if (result.failed.length > 0) {
    message += `, thất bại ${result.failed.length} thuốc`
  }
  if (result.warnings && result.warnings.length > 0) {
    message += `, có ${result.warnings.length} cảnh báo`
  }
  if (result.errors && result.errors.length > 0) {
    message += `, có ${result.errors.length} lỗi chặn`
  }

  res.json({
    success: true,
    message: message,
    data: {
      success: result.success,
      failed: result.failed,
      errors: result.errors || [], // Lỗi chặn (blocking errors)
      warnings: result.warnings || [], // Cảnh báo (non-blocking warnings)
    },
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
