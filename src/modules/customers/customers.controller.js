import customersService from './customers.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

class CustomersController {
  create = asyncHandler(async (req, res) => {
    const created = await customersService.createCustomer(req.body)
    res.status(201).json({
      success: true,
      message: 'Tạo khách hàng thành công',
      data: created,
    })
  })

  getAll = asyncHandler(async (req, res) => {
    const result = await customersService.getCustomers(req.query)
    // result has shape { data: [...], pagination: {...} }
    res.json({
      success: true,
      message: 'Lấy danh sách khách hàng thành công',
      data: result.data,
      pagination: result.pagination,
    })
  })

  getById = asyncHandler(async (req, res) => {
    const customer = await customersService.getCustomerById(req.params.id)
    res.json({
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer,
    })
  })

  update = asyncHandler(async (req, res) => {
    const updated = await customersService.updateCustomer(req.params.id, req.body)
    res.json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: updated,
    })
  })

  delete = asyncHandler(async (req, res) => {
    await customersService.deleteCustomer(req.params.id)
    res.json({
      success: true,
      message: 'Xóa khách hàng thành công',
      data: null,
    })
  })

  getInvoices = asyncHandler(async (req, res) => {
    const result = await customersService.getCustomerInvoices(req.params.id, req.query)
    res.json({
      success: true,
      message: 'Lấy danh sách đơn hàng của khách hàng thành công',
      data: result.data,
      pagination: result.pagination,
    })
  })
}

export default new CustomersController()
