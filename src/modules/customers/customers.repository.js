import Customer from './customers.model.js'

class CustomersRepository {
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, q } = options

    const mongoFilter = { ...filter }
    if (q) {
      const re = new RegExp(q, 'i')
      mongoFilter.$or = [{ name: re }, { phone: re }, { address: re }]
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Customer.find(mongoFilter).skip(skip).limit(limit).lean(),
      Customer.countDocuments(mongoFilter),
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

  async findById(id) {
    return Customer.findById(id).lean()
  }

  async findByPhone(phone) {
    return Customer.findOne({ phone })
  }

  async create(payload, session = null) {
    if (session) {
      const [doc] = await Customer.create([payload], { session })
      return doc
    }
    const doc = await Customer.create(payload)
    return doc
  }

  async updateById(id, update) {
    return Customer.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
  }

  async deleteById(id) {
    return Customer.findByIdAndDelete(id).lean()
  }
}

export default new CustomersRepository()
