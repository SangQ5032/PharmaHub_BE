import salesService from './sales.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

class SalesController {
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
}

export default new SalesController()
