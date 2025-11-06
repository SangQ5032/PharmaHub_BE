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
}

export default new InventoryController()
