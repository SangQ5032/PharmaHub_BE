import crossBranchService from './cross-branch.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class CrossBranchController {
  /**
   * Lấy tồn kho tất cả chi nhánh
   * GET /api/inventory/cross-branch
   */
  getAllBranchesInventory = asyncHandler(async (req, res) => {
    const query = req.query

    const result = await crossBranchService.getAllBranchesInventory(query)

    res.status(200).json({
      success: true,
      message: 'Lấy tồn kho tất cả chi nhánh thành công',
      data: result,
    })
  })

  /**
   * So sánh tồn kho của 1 loại thuốc giữa các chi nhánh
   * GET /api/inventory/cross-branch/compare
   */
  compareMedicineAcrossBranches = asyncHandler(async (req, res) => {
    const { medicine_id } = req.query

    const result = await crossBranchService.compareMedicineAcrossBranches(medicine_id)

    res.status(200).json({
      success: true,
      message: 'So sánh tồn kho giữa các chi nhánh thành công',
      data: result,
    })
  })

  /**
   * Tìm chi nhánh có hàng sẵn (cho bán hàng & điều phối)
   * GET /api/inventory/cross-branch/available
   */
  findAvailableBranches = asyncHandler(async (req, res) => {
    const { medicine_id, quantity } = req.query

    const result = await crossBranchService.findAvailableBranches(medicine_id, Number(quantity))

    res.status(200).json({
      success: true,
      message: 'Tìm chi nhánh có hàng sẵn thành công',
      data: result,
    })
  })
}

export default new CrossBranchController()
