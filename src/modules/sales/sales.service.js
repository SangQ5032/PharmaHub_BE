import mongoose from 'mongoose'
import salesRepository from './sales.repository.js'
import { logger } from '../../utils/logger.js'
import { AppError } from '../../utils/AppError.js'

const PAYMENT_METHODS = ['cash', 'card', 'bank', 'e-wallet']

class SalesService {
  async createInvoice(data = {}, employeeId) {
    const branch_id = data.branch_id
    const items = data.items
    const discount = Number(data.discount ?? 0)
    const tax_rate = Number(data.tax_rate ?? 0)
    const payment_method = (data.payment_method || 'cash').toLowerCase()

    if (!branch_id) {
      throw new AppError(400, 'Không xác định được chi nhánh từ tài khoản')
    }

    if (!employeeId) {
      throw new AppError(400, 'Không xác định được nhân viên tạo hóa đơn')
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'Danh sách thuốc không hợp lệ')
    }

    const normalizedItems = items.map((item) => ({
      medicine_id: item.medicine_id,
      batch_id: item.batch_id,
      quantity: Number(item.quantity),
      unit_price: item.unit_price !== undefined ? Number(item.unit_price) : undefined,
    }))

    for (const item of normalizedItems) {
      if (!mongoose.Types.ObjectId.isValid(item.medicine_id)) {
        throw new AppError(400, 'medicine_id không hợp lệ')
      }
      if (!mongoose.Types.ObjectId.isValid(item.batch_id)) {
        throw new AppError(400, 'batch_id không hợp lệ')
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new AppError(400, 'Số lượng thuốc phải lớn hơn 0')
      }
      if (item.unit_price !== undefined && (Number.isNaN(item.unit_price) || item.unit_price < 0)) {
        throw new AppError(400, 'Đơn giá không hợp lệ')
      }
    }

    if (Number.isNaN(discount) || discount < 0) {
      throw new AppError(400, 'Chiết khấu không hợp lệ')
    }

    if (Number.isNaN(tax_rate) || tax_rate < 0) {
      throw new AppError(400, 'Thuế suất không hợp lệ')
    }

    if (!PAYMENT_METHODS.includes(payment_method)) {
      throw new AppError(400, 'Phương thức thanh toán không hợp lệ')
    }

    const medicineIds = normalizedItems.map((item) => item.medicine_id)
    const medicines = await salesRepository.findMedicinesByIds(medicineIds)

    if (medicines.length !== medicineIds.length) {
      const existingIds = medicines.map((m) => m._id.toString())
      const missing = medicineIds.filter((id) => !existingIds.includes(id.toString()))
      throw new AppError(404, `Không tìm thấy thuốc với ID: ${missing.join(', ')}`)
    }

    const medicineMap = new Map(medicines.map((m) => [m._id.toString(), m]))

    const expiredMedicines = medicines.filter((m) => new Date(m.expiry_date) < new Date())
    if (expiredMedicines.length) {
      const names = expiredMedicines.map((m) => m.name).join(', ')
      throw new AppError(400, `Không thể bán thuốc đã hết hạn: ${names}`)
    }

    // Lấy thông tin batch
    const batchIds = normalizedItems.map((item) => item.batch_id)
    const batches = await salesRepository.findBatchesByIds(batchIds)

    if (batches.length !== batchIds.length) {
      const existingIds = batches.map((b) => b._id.toString())
      const missing = batchIds.filter((id) => !existingIds.includes(id.toString()))
      throw new AppError(404, `Không tìm thấy lô hàng với ID: ${missing.join(', ')}`)
    }

    const batchMap = new Map(batches.map((b) => [b._id.toString(), b]))

    // Validate batch: tồn tại ở chi nhánh đúng, chưa hết hạn, có đủ số lượng
    for (const item of normalizedItems) {
      const batch = batchMap.get(item.batch_id.toString())
      const medicine = medicineMap.get(item.medicine_id.toString())

      if (!batch) {
        throw new AppError(404, `Không tìm thấy lô hàng với ID: ${item.batch_id}`)
      }

      // Kiểm tra batch thuộc chi nhánh đúng
      if (batch.branch_id.toString() !== branch_id.toString()) {
        throw new AppError(400, `Lô hàng ${batch.batch_number} không thuộc chi nhánh hiện tại`)
      }

      // Kiểm tra batch chưa hết hạn
      if (new Date(batch.expiry_date) < new Date()) {
        throw new AppError(
          400,
          `Lô hàng ${batch.batch_number} của ${medicine.name} đã hết hạn (hết hạn: ${batch.expiry_date.toLocaleDateString('vi-VN')})`
        )
      }

      // Kiểm tra batch có đủ số lượng
      if (batch.quantity < item.quantity) {
        throw new AppError(
          400,
          `Lô hàng ${batch.batch_number} của ${medicine.name} chỉ còn ${batch.quantity}, không đủ ${item.quantity} yêu cầu`
        )
      }
    }

    const enrichedItems = normalizedItems.map((item) => {
      const medicine = medicineMap.get(item.medicine_id.toString())
      const batch = batchMap.get(item.batch_id.toString())
      const unitPrice = item.unit_price !== undefined ? item.unit_price : medicine.price
      const lineTotal = unitPrice * item.quantity
      return {
        medicine_id: item.medicine_id,
        batch_id: item.batch_id,
        name: medicine.name,
        batch_number: batch.batch_number,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      }
    })

    const subtotal = enrichedItems.reduce((sum, item) => sum + item.line_total, 0)
    if (discount > subtotal) {
      throw new AppError(400, 'Chiết khấu không thể lớn hơn tạm tính')
    }

    const taxableAmount = subtotal - discount
    const taxAmount = (tax_rate / 100) * taxableAmount
    const totalAmount = taxableAmount + taxAmount

    const invoiceCode = await this.generateInvoiceCode()

    const customerDetails = await this.resolveCustomer(
      {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
      },
      subtotal,
      totalAmount
    )

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      if (customerDetails.customer_id && customerDetails.shouldUpdateTotal) {
        await salesRepository.increaseCustomerTotalSpent(
          customerDetails.customer_id,
          totalAmount,
          session
        )
      }

      await salesRepository.decreaseInventory(enrichedItems, session)

      const invoice = await salesRepository.createInvoice(
        {
          invoice_code: invoiceCode,
          branch_id,
          employee_id: employeeId,
          customer_id: customerDetails.customer_id,
          customer_name: customerDetails.customer_name,
          customer_phone: customerDetails.customer_phone,
          payment_method,
          items: enrichedItems,
          subtotal,
          discount,
          tax_rate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          note: data.note,
          status: 'completed',
        },
        session
      )

      await session.commitTransaction()
      const populatedInvoice = await salesRepository.findInvoiceById(invoice._id)
      return populatedInvoice
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async resolveCustomer(customerPayload = {}, subtotal, totalAmount) {
    const { customer_id, customer_phone, customer_name, customer_address } = customerPayload

    if (!customer_id && !customer_phone) {
      return {
        customer_id: null,
        customer_name,
        customer_phone,
        shouldUpdateTotal: false,
      }
    }

    if (customer_id) {
      const customer = await salesRepository.findCustomerById(customer_id)
      if (!customer) {
        throw new AppError(404, 'Không tìm thấy khách hàng')
      }
      return {
        customer_id: customer._id,
        customer_name: customerNameOrFallback(customer_name, customer),
        customer_phone: customer.phone,
        shouldUpdateTotal: true,
      }
    }

    const existingCustomer = await salesRepository.findCustomerByPhone(customer_phone)
    if (existingCustomer) {
      return {
        customer_id: existingCustomer._id,
        customer_name: customerNameOrFallback(customer_name, existingCustomer),
        customer_phone: existingCustomer.phone,
        shouldUpdateTotal: true,
      }
    }

    if (!customer_name) {
      throw new AppError(400, 'Tên khách hàng là bắt buộc khi tạo mới khách hàng')
    }

    if (!customer_phone) {
      throw new AppError(400, 'Số điện thoại là bắt buộc khi tạo mới khách hàng')
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const customer = await salesRepository.createCustomer(
        {
          name: customer_name,
          phone: customer_phone,
          address: customer_address,
          total_spent: totalAmount || subtotal,
        },
        session
      )
      await session.commitTransaction()
      return {
        customer_id: customer._id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        shouldUpdateTotal: false,
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async generateInvoiceCode() {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '')
    let attempt = 0

    while (attempt < 5) {
      const randomPart = Math.floor(100000 + Math.random() * 900000)
      const code = `INV-${datePart}-${randomPart}`
      const exists = await salesRepository.existsInvoiceCode(code)
      if (!exists) {
        return code
      }
      attempt++
    }

    throw new AppError(500, 'Không thể tạo mã hóa đơn duy nhất, vui lòng thử lại')
  }

  // Lấy danh sách hoá đơn theo chi nhánh
  // branchId từ token, có thể filter theo employee_id
  async getInvoicesByBranch(branchId, query = {}) {
    if (!branchId) {
      throw new AppError(400, 'Chi nhánh là bắt buộc')
    }

    const { page = 1, limit = 10, employee_id, customer_id, from_date, to_date, search } = query

    const filter = {
      branch_id: branchId,
    }

    // Nếu có employee_id trong query, filter theo employee
    if (employee_id) {
      filter.employee_id = employee_id
    }

    // Filter theo khách hàng
    if (customer_id) {
      filter.customer_id = customer_id
    }

    // Filter theo ngày (từ - đến)
    if (from_date || to_date) {
      filter.created_at = {}
      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }
      if (to_date) {
        const toDate = new Date(to_date)
        toDate.setHours(23, 59, 59, 999)
        filter.created_at.$lte = toDate
      }
    }

    // Tìm kiếm theo mã hoá đơn hoặc tên khách hàng
    if (search) {
      filter.$or = [
        { invoice_code: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const sort = { created_at: -1 }

    const [data, total] = await Promise.all([
      salesRepository.findInvoices(filter, { skip, limit, sort }),
      salesRepository.countInvoices(filter),
    ])

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Lấy danh sách hoá đơn tạo bởi nhân viên hiện tại
  async getInvoicesByEmployee(branchId, employeeId, query = {}) {
    if (!branchId) {
      throw new AppError(400, 'Chi nhánh là bắt buộc')
    }

    if (!employeeId) {
      throw new AppError(400, 'Nhân viên là bắt buộc')
    }

    const { page = 1, limit = 10, from_date, to_date, search } = query

    const filter = {
      branch_id: branchId,
      employee_id: employeeId,
    }

    // Filter theo ngày (từ - đến)
    if (from_date || to_date) {
      filter.created_at = {}
      if (from_date) {
        filter.created_at.$gte = new Date(from_date)
      }
      if (to_date) {
        const toDate = new Date(to_date)
        toDate.setHours(23, 59, 59, 999)
        filter.created_at.$lte = toDate
      }
    }

    // Tìm kiếm theo mã hoá đơn hoặc tên khách hàng
    if (search) {
      filter.$or = [
        { invoice_code: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const sort = { created_at: -1 }

    const [data, total] = await Promise.all([
      salesRepository.findInvoices(filter, { skip, limit, sort }),
      salesRepository.countInvoices(filter),
    ])

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Lấy chi tiết hoá đơn
  async getInvoiceDetail(invoiceId) {
    if (!invoiceId) {
      throw new AppError(400, 'ID hoá đơn là bắt buộc')
    }

    const invoice = await salesRepository.findInvoiceById(invoiceId)
    if (!invoice) {
      throw new AppError(404, 'Hoá đơn không tồn tại')
    }

    return invoice
  }
}

const customerNameOrFallback = (providedName, customer) => {
  if (providedName && providedName.trim()) {
    return providedName
  }
  return customer?.name
}

export default new SalesService()
