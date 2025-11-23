// MODULE: CATEGORIES - ROUTES (Route Definitions)
import express from 'express'
import * as categoriesController from './categories.controller.js'
import { validateBody } from '../../middlewares/validate.js'
import { createCategorySchema, updateCategorySchema } from './categories.validation.js'

const router = express.Router()

// CRUD Categories
router.post('/', validateBody(createCategorySchema), categoriesController.createCategory)
router.get('/dropdown/active', categoriesController.getActiveCategoriesForDropdown)
router.get('/status/:status', categoriesController.getCategoriesByStatus)
router.get('/', categoriesController.getCategories)
router.get('/:id', categoriesController.getCategoryById)
router.put('/:id', validateBody(updateCategorySchema), categoriesController.updateCategory)
router.delete('/:id', categoriesController.deleteCategory)

export default router
