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
   * Cập nhật trạng thái phiếu nhập
   * PATCH /api/imports/:id/status
   */
  updateImportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái là bắt buộc',
      })
    }

    const result = await importService.updateImportStatus(id, status)

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái phiếu nhập thành công',
      data: result,
    })
  })

  /**
   * Hủy phiếu nhập hàng
   * POST /api/imports/:id/cancel
   */
  cancelImport = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { reason } = req.body

    const result = await importService.cancelImport(id, reason || '')

    res.status(200).json({
      success: true,
      message: 'Hủy phiếu nhập hàng thành công',
      data: result,
    })
  })

  /**
   * Lấy danh sách import theo chi nhánh
   * GET /api/imports/branch/:branchId
   */
  getImportsByBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params
    const result = await importService.getImportsByBranch(branchId, req.query)

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phiếu nhập theo chi nhánh thành công',
      data: result.data,
      pagination: result.pagination,
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
