import SupplierRepository from './suppliers.repository.js'

class SupplierService {
  async list(params) {
    // params may include: page, limit, q, status, name
    return await SupplierRepository.getAll(params)
  }
  async getById(id) {
    return await SupplierRepository.getById(id)
  }
  async create(data) {
    return await SupplierRepository.create(data)
  }
  async update(id, data) {
    return await SupplierRepository.update(id, data)
  }
  async delete(id) {
    return await SupplierRepository.delete(id)
  }
}
export default new SupplierService()
