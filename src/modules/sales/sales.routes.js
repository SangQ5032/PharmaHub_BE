import express from 'express'
import salesController from './sales.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.createInvoice
)

export default router
