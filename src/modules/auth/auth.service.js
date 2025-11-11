import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repository.js'
import config from '../../config/index.js'
import { AppError } from '../../utils/AppError.js'
import admin from '../../config/firebase/firebase.js'
import { User } from '../users/users.model.js'

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
 * Xác minh Firebase ID Token và đăng nhập
 * @param {string} idToken - Firebase ID Token
 * @returns {Promise<Object>} - JWT token và thông tin user
 */
export const verifyFirebaseTokenAndLogin = async (idToken) => {
  if (!idToken) {
    throw new AppError(400, 'ID Token là bắt buộc')
  }

  try {
    // Xác minh ID Token với Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken)

    // Lấy số điện thoại từ decoded token
    const phone = decodedToken.phone_number

    if (!phone) {
      throw new AppError(400, 'Token không chứa thông tin số điện thoại')
    }

    // Normalize số điện thoại
    const normalizedPhone = normalizePhone(phone)

    // Tìm user theo số điện thoại
    let user = await authRepo.findByPhone(normalizedPhone)

    // Nếu chưa có user, tạo user mới
    // if (!user) {
    //   user = await User.create({
    //     phone: normalizedPhone,
    //     username: `user_${normalizedPhone}`,
    //     password: await bcrypt.hash('firebase_login', 10), // Placeholder password
    //     role: 'employee' // Mặc định là employee
    //   })
    //   user = user.toObject()
    // }
    // Nếu không tìm thấy user thì tức là không được phép đăng nhập
    if (!user) {
      throw new AppError(403, 'Số điện thoại này chưa được đăng ký trong hệ thống')
    }

    // Tạo JWT token cho backend
    const accessToken = jwt.sign(
      {
        sub: user._id,
        role: user.role,
        branch_id: user.branchId || null,
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
        name: user.fullName || user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        branch_id: user.branchId || null,
      },
    }
  } catch (error) {
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

/**
 * Đăng nhập với username/password
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} ip - IP address
 * @returns {Promise<Object>} - JWT token và thông tin user
 */
export const loginWithUsername = async (username, password, ip) => {
  // Find user
  const user = await authRepo.findByUsername(username)
  if (!user) {
    await authRepo.recordLoginAttempt(username, false, ip)
    throw new AppError(401, 'Thông tin đăng nhập không hợp lệ')
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    await authRepo.recordLoginAttempt(username, false, ip)
    throw new AppError(401, 'Thông tin đăng nhập không hợp lệ')
  }

  // Record successful login
  await authRepo.recordLoginAttempt(username, true, ip)

  // Generate token
  const accessToken = jwt.sign(
    {
      sub: user._id,
      role: user.role,
      branch_id: user.branchId || null,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )

  // Return user data without sensitive information
  return {
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      name: user.fullName || user.name,
      role: user.role,
      branch_id: user.branchId || null,
      phone: user.phone,
      email: user.email,
    },
  }
}

/**
 * Xác thực JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Thông tin user
 */
export const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    const user = await authRepo.findById(decoded.sub)
    if (!user) throw new AppError(401, 'User not found')
    return user
  } catch (error) {
    throw new AppError(401, 'Invalid token')
  }
}
