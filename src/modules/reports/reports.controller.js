// MODULE: REPORTS - CONTROLLER (HTTP Handler)
// Mục đích: Xử lý HTTP requests cho báo cáo tồn kho
// - Nhận request từ client
// - Gọi service để xử lý business logic
// - Trả về response chuẩn

import reportsService from './reports.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class ReportsController {
  /**
   * GET /api/branches/:id/reports/inventory
   * Lấy báo cáo tồn kho theo chi nhánh
   */
  getInventoryReportByBranch = asyncHandler(async (req, res) => {
    const { id } = req.params

    const report = await reportsService.getInventoryReportByBranch(id)

    res.status(200).json({
      success: true,
      message: 'Lấy báo cáo tồn kho chi nhánh thành công',
      data: report,
    })
  })

  /**
   * GET /api/inventory/report
   * Lấy báo cáo tồn kho toàn hệ thống (admin only)
   */
  getInventoryReportAll = asyncHandler(async (req, res) => {
    const query = req.query

    const report = await reportsService.getInventoryReportAll(query)

    res.status(200).json({
      success: true,
      message: 'Lấy báo cáo tồn kho toàn hệ thống thành công',
      data: report,
    })
  })
}

export default new ReportsController()
