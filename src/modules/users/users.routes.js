import express from 'express'
import * as usersController from './users.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// GET /api/users
// Chỉ user login mới xem được
router.get(
  '/',
  protect,
  authorizeRoles('system-admin', 'branch-manager'),
  usersController.getAllUsers
)

// GET /api/users/branch/list
// Lấy danh sách user theo chi nhánh từ accessToken
router.get(
  '/branch/list',
  protect,
  authorizeRoles('branch-manager', 'system-admin'),
  usersController.getUsersByBranch
)

export default router
