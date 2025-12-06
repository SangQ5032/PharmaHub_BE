import customersRepo from './customers.repository.js'
import { AppError } from '../../utils/AppError.js'

class CustomersService {
  async createCustomer(payload) {
    if (!payload || !payload.name || !payload.phone) {
      throw new AppError(400, 'Tên và số điện thoại là bắt buộc')
    }

    // check unique phone
    const exists = await customersRepo.findByPhone(payload.phone)
    if (exists) throw new AppError(400, 'Số điện thoại đã tồn tại')

    const created = await customersRepo.create(payload)
    return created
  }

  async getCustomers(query = {}) {
    const { page, limit, q } = query
    return await customersRepo.findAll({}, { page, limit, q })
  }

  async getCustomerById(id) {
    const customer = await customersRepo.findById(id)
    if (!customer) throw new AppError(404, 'Customer not found')
    return customer
  }

  async updateCustomer(id, payload) {
    const updated = await customersRepo.updateById(id, payload)
    if (!updated) throw new AppError(404, 'Customer not found')
    return updated
  }

  async deleteCustomer(id) {
    const deleted = await customersRepo.deleteById(id)
    if (!deleted) throw new AppError(404, 'Customer not found')
    return deleted
  }

  async getCustomerInvoices(customerId, query = {}) {
    const customer = await customersRepo.findById(customerId)
    if (!customer) throw new AppError(404, 'Khách hàng không tồn tại')

    const { page, limit } = query
    return await customersRepo.getCustomerInvoices(customerId, { page, limit })
  }
}

export default new CustomersService()
