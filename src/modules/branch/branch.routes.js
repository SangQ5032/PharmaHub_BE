import express from 'express'
const router = express.Router()
import branchController from './branch.controller.js'

router.get('/', branchController.getAll)

export default router
