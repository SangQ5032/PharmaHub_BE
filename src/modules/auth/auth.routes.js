import express from 'express'
import * as authController from './auth.controller.js'

const router = express.Router()

/**
 * POST /api/auth/check-token
 * Kiểm tra Firebase ID Token và xác minh với MongoDB
 * Body: { idToken: string }
 *
 * Kiểm tra:
 * - Firebase ID Token hợp lệ
 * - Số điện thoại trong token
 * - User tồn tại trong MongoDB
 * - Số điện thoại khớp với DB
 * - Trạng thái user hoạt động
 *
 * Response:
 * {
 *   success: true,
 *   message: "Kiểm tra token thành công",
 *   data: {
 *     accessToken: "jwt_token",
 *     user: {
 *       id: "user_id",
 *       username: "username",
 *       name: "fullName",
 *       phone: "0xxxxxxxxx",
 *       email: "email",
 *       role: "role",
 *       branchId: "branch_id"
 *     }
 *   }
 * }
 */
router.post('/check-token', authController.checkToken)

export default router
