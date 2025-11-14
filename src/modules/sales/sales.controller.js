import salesService from './sales.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class SalesController {
  /**
   * POST /api/sales
   * Tạo mới 1 hóa đơn bán hàng
   */
  createInvoice = asyncHandler(async (req, res) => {
    const employeeId = req.user?._id || req.user?.id
    const result = await salesService.createInvoice(req.body, employeeId)
    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: result,
    })
  })

  /**
   * GET /api/sales/:id
   * Lấy chi tiết 1 hóa đơn
   */
  getInvoiceById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await salesService.getInvoiceById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết hóa đơn thành công',
      data: result,
    })
  })

  /**
   * GET /api/sales
   * Lấy danh sách hóa đơn (lọc + phân trang)
   * Query hỗ trợ: branch_id, from_date, to_date, customer_phone, page, limit, sort
   */
  listInvoices = asyncHandler(async (req, res) => {
    const result = await salesService.listInvoices(req.query)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hóa đơn thành công',
      data: result.rows,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    })
  })
}

export default new SalesController()
