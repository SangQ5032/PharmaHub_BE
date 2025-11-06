import { Supplier } from './suppliers.model'

class SupplierRepository {
  async getAll({ page = 1, limit = 20, q, status } = {}) {
    const filter = {}
    if (status) filter.status = status
    if (q) {
      // search by text index (name) or fallback to regex
      filter.$text = { $search: q }
    }
    const skip = (Math.max(Number(page) || 1, 1) - 1) * Math.max(Number(limit) || 1, 1)
    const [data, total] = await Promise.all([
      Supplier.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 20),
      Supplier.countDocuments(filter),
    ])
    return { data, total, page: Number(page) || 1, limit: Number(limit) || 20 }
  }
  async getById(id) {
    return await Supplier.findById(id)
  }
}
export default new SupplierRepository()
