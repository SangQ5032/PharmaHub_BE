import { User } from '../users/users.model.js'
import mongoose from 'mongoose'
// import LoginAttemptSchema from '../auth/auth.model.js'

// const LoginAttempt = mongoose.model('LoginAttempt', LoginAttemptSchema)

/**
 * Tìm user theo ID
 * @param {string} userId - User ID (ObjectId)
 * @returns {Promise<Object>} - User object hoặc null
 */
export const findById = (userId) => {
  return User.findById(userId).lean()
}

/**
 * Tìm user theo số điện thoại trong trường contact.phone
 * @param {string} phone - Số điện thoại đã normalize (ví dụ: 0xxxxxxxxx)
 * @returns {Promise<Object>} - User object hoặc null
 */
export const findByPhone = (phone) => {
  return User.findOne({ 'contact.phone': phone }).lean()
}
