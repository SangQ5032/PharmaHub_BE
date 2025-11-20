// MODULE: CUSTOMERS - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
// - Chỉ chứa các hàm CRUD/Query, không xử lý nghiệp vụ
import { Customer } from './customers.model.js'

class CustomersRepository {
  // Tạo mới 1 khách hàng
  async create(customerData) {
    return await Customer.create(customerData)
  }

  // Tìm 1 khách hàng theo id
  async findById(id) {
    return await Customer.findById(id).lean()
  }

  // Lấy danh sách khách hàng (có phân trang, sort, tìm kiếm text, tìm kiếm theo tên/số điện thoại/mã)
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, search, name, phone, code } = options

    // `filter` may contain top-level query conditions — spread it
    const mongoFilter = { ...filter }

    // Tìm theo tên (gần đúng, không phân biệt hoa thường)
    if (name) {
      mongoFilter.name = { $regex: name, $options: 'i' }
    }

    // Tìm theo số điện thoại
    if (phone) {
      mongoFilter.phone = { $regex: phone, $options: 'i' }
    }

    // Tìm theo mã khách hàng
    if (code) {
      mongoFilter.code = { $regex: code, $options: 'i' }
    }

    // Tìm kiếm toàn văn (text search) nếu không truyền name/phone/code
    if (search && !name && !phone && !code) {
      mongoFilter.$text = { $search: search }
    }

    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10
    const skip = (pageNumber - 1) * limitNumber

    const [data, total] = await Promise.all([
      Customer.find(mongoFilter).sort(sort).skip(skip).limit(limitNumber).lean(),
      Customer.countDocuments(mongoFilter),
    ])

    return {
      data,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    }
  }

  // Cập nhật 1 khách hàng theo id
  async updateById(id, update) {
    return await Customer.findByIdAndUpdate(id, update, { new: true }).lean()
  }

  // Xóa 1 khách hàng theo id
  async deleteById(id) {
    return await Customer.findByIdAndDelete(id).lean()
  }
}

export default new CustomersRepository()
