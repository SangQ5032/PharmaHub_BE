// MODULE: MEDICINES - ROUTES (Route Definitions)
import express from 'express'
import * as medicinesController from './medicines.controller.js'
import { validateBody } from '../../middlewares/validate.js'
import { createMedicineSchema } from './medicines.validation.js'

const router = express.Router()

// CRUD Medicines
router.post('/', validateBody(createMedicineSchema), medicinesController.createMedicine)
router.get('/', medicinesController.getMedicines)
router.get('/:id', medicinesController.getMedicineById)
router.put('/:id', medicinesController.updateMedicine)
router.delete('/:id', medicinesController.deleteMedicine)

export default router
