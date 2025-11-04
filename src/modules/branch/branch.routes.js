import express from 'express'
const router = express.Router()
import branchController from './branch.controller.js'

router.get('/', branchController.getAll)
router.post('/', branchController.create)
router.put('/:id', branchController.update)
router.delete('/:id', branchController.delete)
router.get('/:id', branchController.getById)

export default router
