// MODULE: SUPPLIERS - SERVICE (Business Logic Layer)
// Mục đích: Xử lý logic nghiệp vụ, validation dữ liệu trước khi gửi DB
import SupplierRepository from './suppliers.repository.js'
import { AppError } from '../../utils/AppError.js'

class SupplierService {
  /**
   * Lấy danh sách nhà cung cấp
   * @param {Object} params - { page, limit, q, status }
   * @returns {Promise<Object>}
   */
  async getSuppliersWithPagination(params) {
    return await SupplierRepository.getAll(params)
  }

  /**
   * Lấy chi tiết nhà cung cấp
   * @param {String} id
   * @returns {Promise<Object>}
   * @throws {AppError} - Nếu không tìm thấy
   */
  async getSupplierById(id) {
    const supplier = await SupplierRepository.getById(id)
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404)
    }
    return supplier
  }

  /**
   * Tạo nhà cung cấp mới
   * @param {Object} data - { name, contact, note, status }
   * @returns {Promise<Object>}
   * @throws {AppError}
   */
  async createSupplier(data) {
    // Kiểm tra email không trùng (nếu có)
    if (data.contact?.email) {
      const existingEmail = await SupplierRepository.existsByEmail(data.contact.email)
      if (existingEmail) {
        throw new AppError('Email nhà cung cấp đã tồn tại', 400)
      }
    }

    const supplier = await SupplierRepository.create(data)
    return supplier
  }

  /**
   * Cập nhật thông tin nhà cung cấp
   * @param {String} id
   * @param {Object} data - { name, contact, note, status }
   * @returns {Promise<Object>}
   * @throws {AppError}
   */
  async updateSupplier(id, data) {
    // Kiểm tra nhà cung cấp tồn tại
    const supplier = await SupplierRepository.getById(id)
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404)
    }

    // Nếu cập nhật email, kiểm tra không trùng với nhà cung cấp khác
    if (data.contact?.email && data.contact.email !== supplier.contact?.email) {
      const existingEmail = await SupplierRepository.existsByEmail(data.contact.email)
      if (existingEmail) {
        throw new AppError('Email nhà cung cấp đã tồn tại', 400)
      }
    }

    const updated = await SupplierRepository.update(id, data)
    return updated
  }

  /**
   * Xóa nhà cung cấp
   * @param {String} id
   * @returns {Promise<Object>}
   * @throws {AppError}
   */
  async deleteSupplier(id) {
    const supplier = await SupplierRepository.getById(id)
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404)
    }

    // TODO: Kiểm tra xem nhà cung cấp có đơn hàng/import nào không trước khi xóa
    // const hasOrders = await checkSupplierHasOrders(id)
    // if (hasOrders) {
    //   throw new AppError('Không thể xóa nhà cung cấp có đơn hàng/nhập hàng', 400)
    // }

    return await SupplierRepository.delete(id)
  }

  /**
   * Lấy danh sách nhà cung cấp hoạt động
   * @returns {Promise<Array>}
   */
  async getActiveSuppliers() {
    return await SupplierRepository.getActiveSuppliers()
  }
}

export default new SupplierService()
