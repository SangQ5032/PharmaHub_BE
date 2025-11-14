import express from 'express'
import SuppliersController from './suppliers.controller.js'
import { validateBody } from '../../middlewares/validate.js'
import { createSupplierSchema, updateSupplierSchema } from './suppliers.validation.js'

const router = express.Router()

router.get('/', SuppliersController.getAll)
router.get('/:id', SuppliersController.getById)
router.post('/', validateBody(createSupplierSchema), SuppliersController.create)
router.put('/:id', validateBody(updateSupplierSchema), SuppliersController.update)
router.delete('/:id', SuppliersController.delete)

export default router
