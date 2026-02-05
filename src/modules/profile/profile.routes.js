import express from 'express'
import * as profileController from './profile.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'
import { validateBody } from '../../middlewares/validate.js'
import { uploadImage } from '../../middlewares/uploadImage.js'
import { updateProfileSchema, changePasswordSchema } from './profile.validation.js'

const router = express.Router()

// GET /api/profile/me
router.get(
  '/me',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  profileController.getMe
)

// GET /api/profile/summary
router.get(
  '/summary',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  profileController.getSummary
)

// PUT /api/profile
router.put(
  '/',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  validateBody(updateProfileSchema),
  profileController.updateProfile
)

// PATCH /api/profile/password (optional nếu dùng Firebase Auth)
router.patch(
  '/password',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  validateBody(changePasswordSchema),
  profileController.changePassword
)

// PATCH /api/profile/avatar
router.patch(
  '/avatar',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  uploadImage.single('avatar'),
  profileController.updateAvatar
)

// DELETE /api/profile (optional theo chính sách)
router.delete(
  '/',
  protect,
  authorizeRoles('system-admin', 'branch-manager', 'employee'),
  profileController.deactivateAccount
)

export default router
