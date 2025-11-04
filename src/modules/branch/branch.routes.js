import express from 'express'
const router = express.Router()
import branchController from './branch.controller.js'

router.get('/', branchController.getAll)
router.post('/', branchController.create)
router.put('/:id', branchController.update)

export default router
