import salesRepository from './sales.repository.js'
import { AppError } from '../../utils/AppError.js'

class SalesService {
  /**
   * Tạo hóa đơn bán hàng
   * @param {Object} payload - dữ liệu từ client
   * @param {String} employeeId - id nhân viên từ token
   */
  async createInvoice(payload, employeeId) {
    const {
      branch_id,
      items,
      customer_name,
      customer_phone,
      discount = 0,
      tax_rate = 0,
      payment_method = 'cash',
      note,
    } = payload || {}

    // 1) Validate input cơ bản
    if (!branch_id) throw new AppError(400, 'Thiếu chi nhánh')
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'Danh sách thuốc không hợp lệ')
    }

    // 2) Kiểm tra chi nhánh tồn tại
    const branch = await salesRepository.validateBranch(branch_id)
    if (!branch) throw new AppError(404, 'Chi nhánh không tồn tại')

    // 3) Kiểm tra từng item
    for (const it of items) {
      if (!it.medicine_id) throw new AppError(400, 'Thiếu medicine_id')
      if (it.quantity == null || it.quantity <= 0) throw new AppError(400, 'Số lượng không hợp lệ')
    }

    // 4) Lấy thông tin thuốc để bổ sung giá (nếu client không gửi)
    const medicineIds = items.map((i) => i.medicine_id)
    const meds = await salesRepository.getMedicinesByIds(medicineIds)
    if (meds.length !== medicineIds.length) {
      const found = new Set(meds.map((m) => String(m._id)))
      const missing = medicineIds.filter((id) => !found.has(String(id)))
      throw new AppError(404, `Thuốc không tồn tại: ${missing.join(', ')}`)
    }

    // Map [medicineId => price] tại thời điểm bán
    const priceMap = new Map(meds.map((m) => [String(m._id), m.price]))

    // 5) Chuẩn hóa items: điền unit_price nếu thiếu + tính line_total
    const normalizedItems = items.map((i) => {
      const unit_price =
        i.unit_price != null ? i.unit_price : priceMap.get(String(i.medicine_id)) || 0
      if (unit_price < 0) throw new AppError(400, 'Đơn giá không hợp lệ')
      const line_total = unit_price * i.quantity
      return { medicine_id: i.medicine_id, quantity: i.quantity, unit_price, line_total }
    })

    // 6) Tính tiền
    const subtotal = normalizedItems.reduce((s, it) => s + it.line_total, 0)
    if (discount < 0) throw new AppError(400, 'Giảm giá không hợp lệ')
    if (tax_rate < 0) throw new AppError(400, 'Thuế suất không hợp lệ')

    const taxable = Math.max(0, subtotal - discount)
    const tax_amount = taxable * tax_rate
    const total_amount = taxable + tax_amount

    // 7) Chuẩn bị dữ liệu để ghi DB
    const saleData = {
      branch_id,
      employee_id: employeeId,
      customer_name,
      customer_phone,
      items: normalizedItems,
      subtotal,
      discount,
      tax_rate,
      tax_amount,
      total_amount,
      payment_method,
      note,
      status: 'completed',
    }

    // 8) Ghi DB + trừ kho trong transaction
    try {
      const created = await salesRepository.createWithInventoryUpdate(saleData)
      return created
    } catch (err) {
      // Chuẩn hóa message lỗi tồn kho cho client
      if (/Tồn kho không đủ/.test(String(err))) throw new AppError(400, String(err))
      if (/Không tìm thấy tồn kho/.test(String(err))) throw new AppError(404, String(err))
      throw err
    }
  }

  // Lấy chi tiết 1 hóa đơn
  async getInvoiceById(id) {
    const doc = await salesRepository.findById(id)
    if (!doc) throw new AppError(404, 'Không tìm thấy hóa đơn')
    return doc
  }

  // Danh sách hóa đơn (có lọc/phân trang/sắp xếp)
  async listInvoices(query = {}) {
    const { branch_id, from_date, to_date, customer_phone, page, limit, sort } = query
    const filter = {}

    if (branch_id) filter.branch_id = branch_id
    if (customer_phone) filter.customer_phone = new RegExp(customer_phone, 'i')
    if (from_date || to_date) {
      filter.createdAt = {}
      if (from_date) filter.createdAt.$gte = new Date(from_date)
      if (to_date) filter.createdAt.$lte = new Date(to_date)
    }

    const options = {
      page: parseInt(page || 1, 10),
      limit: parseInt(limit || 10, 10),
      sort: sort || '-createdAt',
    }

    return salesRepository.findAll(filter, options)
  }
}

export default new SalesService()
