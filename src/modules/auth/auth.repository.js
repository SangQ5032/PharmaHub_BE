import { User } from '../users/users.model.js'

/**
 * Tìm user theo số điện thoại trong trường contact.phone
 * @param {string} phone - Số điện thoại đã normalize (ví dụ: 0xxxxxxxxx)
 * @returns {Promise<Object>} - User object hoặc null
 */
export const findByPhone = (phone) => {
  return User.findOne({ 'contact.phone': phone }).lean()
}
