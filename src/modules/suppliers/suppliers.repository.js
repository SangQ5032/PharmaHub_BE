// MODULE: SUPPLIERS - REPOSITORY (Data Access Layer)
// Mục đích: Trực tiếp tương tác với MongoDB thông qua Mongoose
import { Supplier } from './suppliers.model.js'

class SupplierRepository {
  /**
   * Lấy danh sách nhà cung cấp với phân trang, lọc và tìm kiếm
   * @param {Object} options - { page, limit, q, status }
   * @returns {Promise<Object>} { data, total, page, limit }
   */
  async getAll({ page = 1, limit = 20, q, status } = {}) {
    const filter = {}

    // Lọc theo trạng thái
    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status
    }

    // Tìm kiếm theo tên hoặc email
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { 'contact.email': { $regex: q.trim(), $options: 'i' } },
        { 'contact.phone': { $regex: q.trim(), $options: 'i' } },
      ]
    }

    const pageNum = Math.max(Number(page) || 1, 1)
    const limitNum = Math.max(Math.min(Number(limit) || 20, 100), 1)
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Supplier.countDocuments(filter),
    ])

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /**
   * Lấy thông tin chi tiết nhà cung cấp theo ID
   * @param {String} id - Supplier ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await Supplier.findById(id).lean()
  }

  /**
   * Tạo nhà cung cấp mới
   * @param {Object} data - Supplier data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const supplier = new Supplier(data)
    return await supplier.save()
  }

  /**
   * Cập nhật thông tin nhà cung cấp
   * @param {String} id - Supplier ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    return await Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  }

  /**
   * Xóa nhà cung cấp
   * @param {String} id - Supplier ID
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    return await Supplier.findByIdAndDelete(id)
  }

  /**
   * Kiểm tra email đã tồn tại
   * @param {String} email
   * @returns {Promise<Boolean>}
   */
  async existsByEmail(email) {
    const result = await Supplier.findOne({ 'contact.email': email.toLowerCase() })
    return !!result
  }

  /**
   * Tìm nhà cung cấp theo tên
   * @param {String} name
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    return await Supplier.findOne({ name: { $regex: name, $options: 'i' } }).lean()
  }

  /**
   * Lấy danh sách nhà cung cấp hoạt động
   * @returns {Promise<Array>}
   */
  async getActiveSuppliers() {
    return await Supplier.find({ status: 'active' }).lean()
  }
}

export default new SupplierRepository()
