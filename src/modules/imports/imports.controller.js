import importService from './imports.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class ImportController {
  /**
   * Tạo phiếu nhập hàng mới
   * POST /api/imports
   */
  createImport = asyncHandler(async (req, res) => {
    const employeeId = req.user._id || req.user.id
    const importData = req.body

    const result = await importService.createImport(importData, employeeId)

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu nhập hàng thành công',
      data: result,
    })
  })

  /**
   * Lấy danh sách phiếu nhập
   * GET /api/imports
   */
  getImports = asyncHandler(async (req, res) => {
    const result = await importService.getImports(req.query)

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phiếu nhập thành công',
      data: result.data,
      pagination: result.pagination,
    })
  })

  /**
   * Lấy chi tiết phiếu nhập
   * GET /api/imports/:id
   */
  getImportById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await importService.getImportById(id)

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết phiếu nhập thành công',
      data: result,
    })
  })

  /**
   * Lấy thống kê nhập hàng theo chi nhánh
   * GET /api/imports/stats/:branchId
   */
  getImportStats = asyncHandler(async (req, res) => {
    const { branchId } = req.params
    const { from_date, to_date } = req.query

    const dateRange = {}
    if (from_date) dateRange.from = from_date
    if (to_date) dateRange.to = to_date

    const result = await importService.getImportStats(branchId, dateRange)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê nhập hàng thành công',
      data: result,
    })
  })
}

export default new ImportController()

