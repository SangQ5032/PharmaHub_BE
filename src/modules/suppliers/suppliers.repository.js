import { Supplier } from './suppliers.model.js'

class SupplierRepository {
  async getAll({ page = 1, limit = 100, q, status, name } = {}) {
    const filter = {}
    if (status) filter.status = status
    // Name partial search (case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    } else if (q) {
      // Text search by index when no explicit name filter provided
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
  async create(data) {
    const supplier = new Supplier(data)
    return await supplier.save()
  }
  async update(id, data) {
    return await Supplier.findByIdAndUpdate(id, data, { new: true })
  }
  async delete(id) {
    return await Supplier.findByIdAndDelete(id)
  }
}
export default new SupplierRepository()
