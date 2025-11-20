// MODULE: MEDICINES - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
// - Không viết truy vấn DB tại đây
// - Không nhồi logic nghiệp vụ nặng tại đây
import * as medicinesService from './medicines.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

// POST /api/medicines - tạo thuốc
export const createMedicine = asyncHandler(async (req, res) => {
  const created = await medicinesService.createMedicine(req.body)
  res.status(201).json(created)
})

// GET /api/medicines - danh sách thuốc (phân trang/filter/search)
// Query params:
//   - name hoặc q: tìm kiếm theo tên (gần đúng, không phân biệt hoa thường)
//     VD: ?name=thuốc hoặc ?q=thuốc sẽ tìm "Thuốc 1", "thuốc cảm", "THUỐC ABC"
//   - category: lọc theo loại thuốc
//   - supplier_id: lọc theo nhà cung cấp
//   - page, limit: phân trang
//   - sort: sắp xếp (JSON string, VD: {"createdAt":-1})
export const getMedicines = asyncHandler(async (req, res) => {
  const result = await medicinesService.getMedicines(req.query)
  // res.json(result)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc thành công',
    data: result.data,
  })
})

// GET /api/medicines/:id - chi tiết 1 thuốc
export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await medicinesService.getMedicineById(req.params.id)
  res.json(medicine)
})

// PUT /api/medicines/:id - cập nhật 1 thuốc
export const updateMedicine = asyncHandler(async (req, res) => {
  const updated = await medicinesService.updateMedicine(req.params.id, req.body)
  res.json(updated)
})

// DELETE /api/medicines/:id - xóa 1 thuốc
export const deleteMedicine = asyncHandler(async (req, res) => {
  await medicinesService.deleteMedicine(req.params.id)
  res.status(204).send()
})

// GET /api/medicines/branch/:branchId - danh sách thuốc theo chi nhánh (với tồn kho)
// Trả về tất cả thuốc kèm thông tin tồn kho ở chi nhánh đó
// Query params (tương tự getMedicines):
//   - name hoặc q: tìm kiếm theo tên
//   - category: lọc theo loại thuốc
//   - supplier_id: lọc theo nhà cung cấp
//   - page, limit: phân trang
//   - sort: sắp xếp
// Response: Mỗi thuốc sẽ có thêm 3 trường:
//   - in_stock: boolean (true nếu quantity > 0)
//   - quantity: số lượng tồn kho (0 nếu không có)
//   - last_updated: ngày cập nhật cuối cùng
export const getMedicinesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params
  const result = await medicinesService.getMedicinesByBranch(branchId, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc theo chi nhánh thành công',
    data: result,
  })
})
