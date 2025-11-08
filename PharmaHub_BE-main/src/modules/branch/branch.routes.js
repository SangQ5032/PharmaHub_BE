import express from 'express'
import branchController from './branch.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', authorizeRoles('branch-manager', 'system-admin'), branchController.getAll)
router.post('/', authorizeRoles('system-admin'), branchController.create)
router.put('/:id', authorizeRoles('system-admin'), branchController.update)
router.delete('/:id', authorizeRoles('system-admin'), branchController.delete)
router.get('/:id', authorizeRoles('branch-manager', 'system-admin'), branchController.getById)

export default router
