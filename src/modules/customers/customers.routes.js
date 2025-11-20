// MODULE: CUSTOMERS - ROUTES (Route Definitions)
// Mục đích: Khai báo các endpoint HTTP cho module khách hàng
import express from 'express'
import * as customerController from './customers.controller.js'

const router = express.Router()

// CRUD Customers
router.post('/', customerController.createCustomer)
router.get('/', customerController.getCustomers)
router.get('/:id', customerController.getCustomerById)
router.put('/:id', customerController.updateCustomer)
router.delete('/:id', customerController.deleteCustomer)

export default router
