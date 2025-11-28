import inventoryService from './inventory.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class InventoryController {
  /**
   * Lấy tồn kho theo chi nhánh
   * GET /api/branches/:id/inventory
   */
  getInventoryByBranch = asyncHandler(async (req, res) => {
    const { id } = req.params
    const query = req.query

    const result = await inventoryService.getInventoryByBranch(id, query)

    res.status(200).json({
      success: true,
      message: 'Lấy tồn kho chi nhánh thành công',
      data: result,
    })
  })

  /**
   * Lấy tồn kho toàn hệ thống (admin only)
   * GET /api/inventory
   */
  getAllInventory = asyncHandler(async (req, res) => {
    const query = req.query

    const result = await inventoryService.getAllInventory(query)

    res.status(200).json({
      success: true,
      message: 'Lấy tồn kho toàn hệ thống thành công',
      data: result,
    })
  })

  /**
   * Lấy tồn kho của 1 loại thuốc tại chi nhánh cụ thể
   * GET /api/inventory/branch/:branchId/medicine/:medicineId
   */
  getInventoryByBranchAndMedicine = asyncHandler(async (req, res) => {
    const { branchId, medicineId } = req.params

    const result = await inventoryService.getInventoryByBranchAndMedicine(branchId, medicineId)

    res.status(200).json({
      success: true,
      message: 'Lấy tồn kho thuốc tại chi nhánh thành công',
      data: result,
    })
  })

  /**
   * Lấy danh sách batch của thuốc tại chi nhánh (dành cho chọn batch khi tạo hóa đơn)
   * GET /api/inventory/branch/:branchId/medicine/:medicineId/batches
   */
  getBatchesForMedicine = asyncHandler(async (req, res) => {
    const { branchId, medicineId } = req.params

    const batches = await inventoryService.getBatchesForMedicine(branchId, medicineId)

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách lô hàng thành công',
      data: batches,
    })
  })

  /**
   * Lấy chi tiết tồn kho bằng inventory ID
   * GET /api/inventory/:inventoryId
   */
  getInventoryById = asyncHandler(async (req, res) => {
    const { inventoryId } = req.params

    const result = await inventoryService.getInventoryById(inventoryId)

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết tồn kho thành công',
      data: result,
    })
  })
}

export default new InventoryController()
