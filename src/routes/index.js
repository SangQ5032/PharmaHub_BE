// src/routes/index.js
import express from 'express'

// import các module routes
import authRoutes from '../modules/auth/auth.routes.js'
import usersRoutes from '../modules/users/users.routes.js'
import branchRoutes from '../modules/branch/branch.routes.js'
import importRoutes from '../modules/imports/imports.routes.js'
import inventoryRoutes from '../modules/inventory/inventory.routes.js'
import medicinesRoutes from '../modules/medicines/medicines.routes.js'
// TODO: thêm các module khác khi tạo tiếp

const router = express.Router()

// MOUNT ĐIỂM VÀO ỨNG DỤNG (prefix gốc: /api trong app.js)
// Thêm module mới => khai báo route ở đây để app nhận diện
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/branches', branchRoutes)
router.use('/imports', importRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/medicines', medicinesRoutes)

// TODO: mount các module khác

export default router
