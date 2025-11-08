import express from 'express'
import * as authController from './auth.controller.js'

const router = express.Router()

// POST /api/auth/login - Đăng nhập với Firebase ID token
router.post('/login', authController.loginWithFirebase)

// POST /api/auth/login-username - Đăng nhập với username/password
router.post('/login-username', authController.login)

// POST /api/auth/validate-token - Xác thực JWT token
router.post('/validate-token', authController.validateToken)

export default router
