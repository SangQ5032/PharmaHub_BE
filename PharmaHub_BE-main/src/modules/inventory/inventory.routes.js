import express from 'express'
import inventoryController from './inventory.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', authorizeRoles('system-admin'), inventoryController.getAllInventory)

router.get(
  '/:id/inventory',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  inventoryController.getInventoryByBranch
)

export default router
