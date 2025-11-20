// MODULE: CUSTOMERS - SERVICE (Business Logic Layer)
// Mục đích: Chứa logic nghiệp vụ, gọi repository để truy vấn DB
// - Không làm việc trực tiếp với Express (req/res)
// - Không viết truy vấn Mongoose trực tiếp (ủy quyền cho repository)
import customersRepo from './customers.repository.js'
import { AppError } from '../../utils/AppError.js'

// Tạo mới 1 khách hàng
export const createCustomer = async (payload) => {
  const created = await customersRepo.create(payload)
  return created
}

// Lấy chi tiết 1 khách hàng theo id
export const getCustomerById = async (id) => {
  const customer = await customersRepo.findById(id)
  if (!customer) throw new AppError(404, 'Customer not found')
  return customer
}

// Lấy danh sách khách hàng (kèm phân trang, search, filter, tìm kiếm theo tên/SDT/Mã)
// Query nhận từ req.query
export const getCustomers = async (query = {}) => {
  const {
    page,
    limit,
    sort,
    search,
    name,
    q, // alias của name
    phone,
    code,
  } = query

  const filter = {}

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  }

  // Nhận sort dạng JSON string từ query: {"createdAt":-1}
  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch (err) {
      // Nếu parse lỗi thì bỏ qua, dùng sort mặc định
      console.warn('Invalid sort query for customers:', sort)
    }
  }

  // Ưu tiên tìm kiếm theo tên (name hoặc q)
  if (name || q) {
    options.name = name || q
  }

  if (phone) {
    options.phone = phone
  }

  if (code) {
    options.code = code
  }

  // Nếu không có name/phone/code thì cho phép dùng text search
  if (search && !options.name && !options.phone && !options.code) {
    options.search = search
  }

  return await customersRepo.findAll(filter, options)
}

// Cập nhật 1 khách hàng
export const updateCustomer = async (id, payload) => {
  const updated = await customersRepo.updateById(id, payload)
  if (!updated) throw new AppError(404, 'Customer not found')
  return updated
}

// Xóa 1 khách hàng
export const deleteCustomer = async (id) => {
  const deleted = await customersRepo.deleteById(id)
  if (!deleted) throw new AppError(404, 'Customer not found')
  return deleted
}
