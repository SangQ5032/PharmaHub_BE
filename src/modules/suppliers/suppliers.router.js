import express from 'express'
import SuppliersController from './suppliers.controller.js'

const router = express.Router()

router.get('/', SuppliersController.getAll)

export default router
