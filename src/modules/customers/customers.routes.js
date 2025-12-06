import express from 'express'
import customersController from './customers.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Public read (require auth)
router.get('/', protect, customersController.getAll)
router.get('/:id', protect, customersController.getById)
router.get('/:id/invoices', protect, customersController.getInvoices)

// Create/update/delete (require admin or branch-manager)
// Allow employees, branch-managers and system-admins to create/update customers
router.post(
  '/',
  protect,
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  customersController.create
)
router.put(
  '/:id',
  protect,
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  customersController.update
)
router.delete('/:id', protect, authorizeRoles('system-admin'), customersController.delete)

export default router
