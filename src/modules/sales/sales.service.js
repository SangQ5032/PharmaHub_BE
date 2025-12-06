import mongoose from 'mongoose'
import salesRepository from './sales.repository.js'
import { logger } from '../../utils/logger.js'
import { AppError } from '../../utils/AppError.js'
import {
  convertToBaseUnit,
  calculateUnitPrice,
  deductFromBatchesFEFO,
  isValidUnit,
  getValidUnits,
} from '../../utils/unitConversion.js'
import { Batch } from '../batches/batches.model.js'

const PAYMENT_METHODS = ['cash', 'card', 'bank', 'e-wallet']

class SalesService {
  /**
   * Tính toán chiết khấu dựa trên total_spent của khách hàng
   * Cứ 100,000 spent → được giảm 1,000
   *
   * @param {string} customerId - ID khách hàng
   * @param {number} subtotal - Tạm tính
   * @param {number} manualDiscount - Chiết khấu manual (nếu có)
   * @returns {Promise<Object>} - {discount_amount, max_discount_eligible, customer_discount_applied}
   */
  async calculateDiscount(customerId, subtotal, manualDiscount) {
    // Nếu có giảm giá manual, ưu tiên dùng
    if (manualDiscount && manualDiscount > 0) {
      return {
        discount_amount: Math.min(manualDiscount, subtotal),
        max_discount_eligible: 0,
        customer_discount_applied: false,
      }
    }

    // Nếu không có customer_id, không áp dụng discount
    if (!customerId) {
      return {
        discount_amount: 0,
        max_discount_eligible: 0,
        customer_discount_applied: false,
      }
    }

    // Kiểm tra khách hàng
    const customer = await salesRepository.findCustomerById(customerId)
    if (!customer) {
      return {
        discount_amount: 0,
        max_discount_eligible: 0,
        customer_discount_applied: false,
      }
    }

    // Tính chiết khấu tối đa dựa trên total_spent
    // Cứ 100,000 spent → được giảm 1,000
    const totalSpent = customer.total_spent || 0
    const maxDiscountEligible = Math.floor(totalSpent / 100000) * 1000

    // Nếu không được giảm giá, trả về 0
    if (maxDiscountEligible <= 0) {
      return {
        discount_amount: 0,
        max_discount_eligible: 0,
        customer_discount_applied: false,
      }
    }

    // Trả về thông tin discount tối đa có thể dùng
    // Employee có thể chọn bao nhiêu từ 0 đến maxDiscountEligible
    return {
      discount_amount: 0, // Mặc định 0, cần employee chọn
      max_discount_eligible: maxDiscountEligible,
      customer_discount_applied: true,
    }
  }

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

    // Normalize items (chỉ validate format cơ bản, validation đơn vị sẽ làm sau khi fetch medicines)
    const normalizedItems = items.map((item) => ({
      medicine_id: item.medicine_id,
      quantity: Number(item.quantity),
      unit: (item.unit || 'tablet').toLowerCase(),
      unit_price: item.unit_price !== undefined ? Number(item.unit_price) : undefined,
      batch_id: item.batch_id,
    }))

    for (const item of normalizedItems) {
      if (!mongoose.Types.ObjectId.isValid(item.medicine_id)) {
        throw new AppError(400, 'medicine_id không hợp lệ')
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new AppError(400, 'Số lượng thuốc phải lớn hơn 0')
      }
      if (!item.unit || typeof item.unit !== 'string' || item.unit.trim() === '') {
        throw new AppError(400, 'Đơn vị tính không hợp lệ')
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

    // Get medicines
    const medicineIds = normalizedItems.map((item) => item.medicine_id)
    const medicines = await salesRepository.findMedicinesByIds(medicineIds)

    if (medicines.length !== medicineIds.length) {
      const existingIds = medicines.map((m) => m._id.toString())
      const missing = medicineIds.filter((id) => !existingIds.includes(id.toString()))
      throw new AppError(404, `Không tìm thấy thuốc với ID: ${missing.join(', ')}`)
    }

    const medicineMap = new Map(medicines.map((m) => [m._id.toString(), m]))

    // Validate đơn vị dựa trên package_structure của từng thuốc
    for (const item of normalizedItems) {
      const medicine = medicineMap.get(item.medicine_id.toString())
      if (medicine) {
        const unit = item.unit || medicine.base_unit || 'tablet'
        if (!isValidUnit(medicine, unit)) {
          const validUnits = getValidUnits(medicine)
          throw new AppError(
            400,
            `Đơn vị "${unit}" không hợp lệ cho thuốc "${medicine.name}". Các đơn vị hợp lệ: ${validUnits.join(', ')}`
          )
        }
      }
    }

    // Enrich items with medicine data
    const itemsWithMedicine = normalizedItems.map((item) => ({
      ...item,
      medicine: medicineMap.get(item.medicine_id.toString()),
    }))

    // Check medicine package structure and convert to base units
    const enrichedItemsPrep = itemsWithMedicine.map((item) => {
      // Convert quantity to base units (with fallback if no package_structure)
      const total_base_units = convertToBaseUnit(item.medicine, item.quantity, item.unit)

      // Get unit price
      const unit_price =
        item.unit_price !== undefined
          ? item.unit_price
          : calculateUnitPrice(item.medicine, item.unit)

      const line_total = unit_price * item.quantity

      return {
        medicine_id: item.medicine_id,
        medicine: item.medicine,
        quantity: item.quantity,
        unit: item.unit,
        total_base_units,
        unit_price,
        line_total,
      }
    })

    // Use FEFO to deduct from batches (multi-batch support)
    const deductions = []
    for (const item of enrichedItemsPrep) {
      try {
        const itemDeductions = await deductFromBatchesFEFO(
          item.medicine_id,
          branch_id,
          item.total_base_units,
          Batch
        )
        deductions.push({
          medicine_id: item.medicine_id,
          deductions: itemDeductions,
        })
      } catch (error) {
        throw error
      }
    }

    const subtotal = enrichedItemsPrep.reduce((sum, item) => sum + item.line_total, 0)

    // Resolve customer details first
    const customerDetails = await this.resolveCustomer(
      {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
      },
      subtotal,
      0 // We'll calculate total later
    )

    // Tính toán chiết khấu (ưu tiên manual discount, sau đó customer discount)
    const discountInfo = await this.calculateDiscount(
      customerDetails.customer_id,
      subtotal,
      discount > 0 ? discount : null
    )

    const taxableAmount = subtotal - discountInfo.discount_amount
    const taxAmount = (tax_rate / 100) * taxableAmount
    const totalAmount = taxableAmount + taxAmount

    const invoiceCode = await this.generateInvoiceCode()

    // Build sales items with deduction info
    const salesItems = await Promise.all(
      enrichedItemsPrep.map(async (item, index) => {
        const medicine = medicineMap.get(item.medicine_id.toString())
        const batchDeductions = deductions[index].deductions
        const primaryBatch = batchDeductions[0] // Use first batch from deductions

        // Get batch details to fill batch_number
        const batch = await Batch.findById(primaryBatch.batch_id).select('batch_number').lean()

        return {
          medicine_id: item.medicine_id,
          batch_id: primaryBatch.batch_id, // Primary batch
          name: medicine.name,
          batch_number: batch?.batch_number || '', // Filled from batch details
          quantity: item.quantity,
          unit: item.unit,
          total_base_units: item.total_base_units,
          unit_price: item.unit_price,
          line_total: item.line_total,
        }
      })
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

      // Batch inventory already updated via deductFromBatchesFEFO
      const invoice = await salesRepository.createInvoice(
        {
          invoice_code: invoiceCode,
          branch_id,
          employee_id: employeeId,
          customer_id: customerDetails.customer_id,
          customer_name: customerDetails.customer_name,
          customer_phone: customerDetails.customer_phone,
          payment_method,
          items: salesItems,
          subtotal,
          discount: discountInfo.discount_amount, // Số tiền giảm thực tế
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
      await session.endSession()
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
        // Fallback: treat as if customer_id was not provided
        // Create new customer or use phone/name
        if (customer_phone) {
          const existingCustomer = await salesRepository.findCustomerByPhone(customer_phone)
          if (existingCustomer) {
            return {
              customer_id: existingCustomer._id,
              customer_name: customerNameOrFallback(customer_name, existingCustomer),
              customer_phone: existingCustomer.phone,
              shouldUpdateTotal: true,
            }
          }
        }
        // If no customer found and no phone provided, continue without customer
        if (!customer_phone && !customer_name) {
          return {
            customer_id: null,
            customer_name: null,
            customer_phone: null,
            shouldUpdateTotal: false,
          }
        }
      } else {
        return {
          customer_id: customer._id,
          customer_name: customerNameOrFallback(customer_name, customer),
          customer_phone: customer.phone,
          shouldUpdateTotal: true,
        }
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

  // Scan barcode để lấy thông tin thuốc
  async scanMedicineByBarcode(barcode, branchId) {
    if (!barcode || !barcode.trim()) {
      throw new AppError(400, 'Barcode không được để trống')
    }

    if (!branchId) {
      throw new AppError(400, 'Không xác định được chi nhánh')
    }

    // Tìm kiếm thuốc theo barcode
    const medicineInfo = await salesRepository.findMedicineByBarcode(barcode.trim(), branchId)

    if (!medicineInfo) {
      throw new AppError(404, 'Không tìm thấy thuốc với barcode này')
    }

    // Kiểm tra nếu thuốc này có batch và tồn kho
    if (!medicineInfo.batches || medicineInfo.batches.length === 0) {
      throw new AppError(400, 'Thuốc này hiện không có sẵn hoặc đã hết tồn kho trong chi nhánh')
    }

    return {
      success: true,
      data: medicineInfo,
    }
  }
}

const customerNameOrFallback = (providedName, customer) => {
  if (providedName && providedName.trim()) {
    return providedName
  }
  return customer?.name
}

export default new SalesService()
