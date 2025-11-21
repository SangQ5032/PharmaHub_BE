import salesService from './sales.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

class SalesController {
  // Tạo hoá đơn
  createInvoice = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
      throw new AppError(401, 'Không xác thực được người dùng')
    }

    const branchId = user.branch_id || user.branchId
    if (!branchId) {
      throw new AppError(400, 'Tài khoản chưa được gán chi nhánh, không thể tạo hóa đơn')
    }

    const employeeId = user._id || user.id
    const payload = { ...req.body }
    delete payload.branch_id
    delete payload.employee_id

    const invoice = await salesService.createInvoice(
      {
        ...payload,
        branch_id: branchId,
      },
      employeeId
    )

    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: invoice,
    })
  })

  // Lấy danh sách hoá đơn theo chi nhánh
  // GET /api/sales/invoices/branch?page=1&limit=10&employee_id=xxx&from_date=2025-01-01&to_date=2025-01-31&search=xxx
  getInvoicesByBranch = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
      throw new AppError(401, 'Không xác thực được người dùng')
    }

    const branchId = user.branch_id || user.branchId
    if (!branchId) {
      throw new AppError(400, 'Tài khoản chưa được gán chi nhánh')
    }

    const query = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      employee_id: req.query.employee_id, // Optional: filter by employee
      customer_id: req.query.customer_id, // Optional: filter by customer
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      search: req.query.search,
    }

    const result = await salesService.getInvoicesByBranch(branchId, query)

    res.json({
      success: true,
      message: 'Lấy danh sách hoá đơn theo chi nhánh thành công',
      data: result.data,
      pagination: result.pagination,
    })
  })

  // Lấy danh sách hoá đơn tạo bởi nhân viên hiện tại
  // GET /api/sales/invoices/me?page=1&limit=10&from_date=2025-01-01&to_date=2025-01-31&search=xxx
  getMyInvoices = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
      throw new AppError(401, 'Không xác thực được người dùng')
    }

    const branchId = user.branch_id || user.branchId
    if (!branchId) {
      throw new AppError(400, 'Tài khoản chưa được gán chi nhánh')
    }

    const employeeId = user._id || user.id

    const query = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      search: req.query.search,
    }

    const result = await salesService.getInvoicesByEmployee(branchId, employeeId, query)

    res.json({
      success: true,
      message: 'Lấy danh sách hoá đơn của tôi thành công',
      data: result.data,
      pagination: result.pagination,
    })
  })

  // Lấy chi tiết hoá đơn
  // GET /api/sales/invoices/:id
  getInvoiceDetail = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
      throw new AppError(401, 'Không xác thực được người dùng')
    }

    const invoice = await salesService.getInvoiceDetail(req.params.id)

    // Kiểm tra quyền: chỉ xem được hoá đơn của chi nhánh mình hoặc tạo bởi mình
    const branchId = user.branch_id || user.branchId
    if (invoice.branch_id._id.toString() !== branchId.toString()) {
      throw new AppError(403, 'Bạn không có quyền xem hoá đơn này')
    }

    res.json({
      success: true,
      message: 'Lấy chi tiết hoá đơn thành công',
      data: invoice,
    })
  })
}

export default new SalesController()
