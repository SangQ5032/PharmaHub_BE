import SupplierRepository from './suppliers.repository.js'

class SupplierService {
  async list(params) {
    return await SupplierRepository.getAll(params)
  }
  async getById(id) {
    return await SupplierRepository.getById(id)
  }
}
export default new SupplierService()
