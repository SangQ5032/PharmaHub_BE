import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repository.js'
import config from '../../config/index.js'
import { AppError } from '../../utils/AppError.js'
import admin from '../../config/firebase/firebase.js'

/**
 * Normalize số điện thoại (loại bỏ ký tự không phải số, xử lý mã quốc gia)
 * @param {string} phone - Số điện thoại
 * @returns {string} - Số điện thoại đã được normalize
 */
const normalizePhone = (phone) => {
  if (!phone) return null
  let normalized = phone.toString().trim()

  // Nếu có +84 thì đổi thành 0
  if (normalized.startsWith('+84')) {
    normalized = '0' + normalized.slice(3)
  }

  // Nếu là 84xxxxx thì đổi thành 0xxxxx
  else if (normalized.startsWith('84')) {
    normalized = '0' + normalized.slice(2)
  }

  // Loại bỏ ký tự không phải số
  normalized = normalized.replace(/\D/g, '')
  return normalized
}

/**
 * Xác minh Firebase ID Token và kiểm tra dữ liệu trong MongoDB
 * @param {string} idToken - Firebase ID Token
 * @returns {Promise<Object>} - JWT token và thông tin user
 */
export const checkFirebaseToken = async (idToken) => {
  if (!idToken) {
    throw new AppError(400, 'ID Token là bắt buộc')
  }

  try {
    // Xác minh ID Token với Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken)

    // Lấy số điện thoại từ decoded token
    const firebasePhone = decodedToken.phone_number

    if (!firebasePhone) {
      throw new AppError(400, 'Token không chứa thông tin số điện thoại')
    }

    // Normalize số điện thoại từ Firebase
    const normalizedPhone = normalizePhone(firebasePhone)

    // Tìm user theo số điện thoại trong MongoDB
    const user = await authRepo.findByPhone(normalizedPhone)

    // Kiểm tra user tồn tại
    if (!user) {
      throw new AppError(403, 'Số điện thoại này chưa được đăng ký trong hệ thống')
    }

    // Kiểm tra xem user có contact.phone không (bắt buộc)
    const dbPhone = user.contact && (user.contact.phone || null)
    if (!dbPhone) {
      throw new AppError(403, 'Thông tin số điện thoại không hợp lệ trong hệ thống')
    }

    // Kiểm tra số điện thoại trong MongoDB khớp với Firebase
    if (normalizePhone(dbPhone) !== normalizedPhone) {
      throw new AppError(403, 'Số điện thoại không khớp')
    }

    // Kiểm tra trạng thái user (nếu có)
    if (user.status && user.status !== 'active') {
      throw new AppError(403, 'Tài khoản không hoạt động')
    }

    // Tạo JWT token cho backend
    const accessToken = jwt.sign(
      {
        sub: user._id,
        role: user.role,
        branch_id: user.branch_id || null,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    // Trả về token và thông tin user
    return {
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        phone: dbPhone,
        email: user.contact && user.contact.email,
        role: user.role,
        branch_id: user.branch_id || null,
      },
    }
  } catch (error) {
    // Nếu là AppError thì throw lại
    if (error instanceof AppError) {
      throw error
    }

    // Xử lý lỗi từ Firebase
    if (error.code === 'auth/id-token-expired') {
      throw new AppError(401, 'Token đã hết hạn')
    }
    if (error.code === 'auth/argument-error') {
      throw new AppError(400, 'Token không hợp lệ')
    }
    throw new AppError(401, 'Xác thực token thất bại: ' + error.message)
  }
}
