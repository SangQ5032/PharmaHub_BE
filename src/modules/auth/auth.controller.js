import * as authService from './auth.service.js'
import { catchAsync } from '../../utils/catchAsync.js'

/**
 * API đăng nhập với Firebase ID Token
 * POST /api/auth/login
 * Body: { idToken: string }
 */
export const loginWithFirebase = catchAsync(async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'ID Token là bắt buộc',
    })
  }

  const result = await authService.verifyFirebaseTokenAndLogin(idToken)

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: result,
  })
})

/**
 * API đăng nhập với username/password
 * POST /api/auth/login-username
 * Body: { username: string, password: string }
 */
export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body
  const ip = req.ip || req.connection.remoteAddress

  const result = await authService.loginWithUsername(username, password, ip)

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: result,
  })
})

/**
 * API xác thực JWT token
 * POST /api/auth/validate-token
 * Body: { token: string }
 */
export const validateToken = catchAsync(async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token là bắt buộc',
    })
  }

  const user = await authService.validateToken(token)

  res.json({
    success: true,
    data: user,
  })
})
