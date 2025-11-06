import express from 'express'
import SuppliersController from './suppliers.controller.js'

const router = express.Router()

router.get('/', SuppliersController.getAll)
router.get('/:id', SuppliersController.getById)
router.post('/', SuppliersController.create)
router.put('/:id', SuppliersController.update)

export default router
