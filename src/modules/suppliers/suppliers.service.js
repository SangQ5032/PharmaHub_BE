import SupplierRepository from './suppliers.repository.js'

class SupplierService {
  async list(params) {
    return await SupplierRepository.getAll(params)
  }
}
export default new SupplierService()
