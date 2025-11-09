import express from 'express'
const router = express.Router()
import attendanceController from './attendance.controller.js'
import { protect } from '../../middlewares/authMiddleware.js'

/**
 * @route   POST /api/attendance/checkin
 * @desc    Checkin (chấm công vào)
 * @access  Private (yêu cầu accessToken)
 */
router.post('/checkin', protect, attendanceController.checkin)

/**
 * @route   POST /api/attendance/checkout
 * @desc    Checkout (chấm công ra)
 * @access  Private (yêu cầu accessToken)
 */
router.post('/checkout', protect, attendanceController.checkout)

/**
 * @route   GET /api/attendance/my-attendance
 * @desc    Lấy lịch sử chấm công của user hiện tại (từ token)
 * @access  Private (yêu cầu accessToken)
 */
router.get('/my-attendance', protect, attendanceController.getMyAttendance)

/**
 * @route   GET /api/attendance
 * @desc    Lấy tất cả lịch sử chấm công
 * @access  Private (yêu cầu accessToken)
 */
router.get('/', protect, attendanceController.getAll)

/**
 * @route   GET /api/attendance/:id
 * @desc    Lấy thông tin chấm công theo ID
 * @access  Private (yêu cầu accessToken)
 */
router.get('/:id', protect, attendanceController.getById)

/**
 * @route   PUT /api/attendance/:id
 * @desc    Cập nhật thông tin chấm công
 * @access  Private (yêu cầu accessToken)
 */
router.put('/:id', protect, attendanceController.update)

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Xóa thông tin chấm công
 * @access  Private (yêu cầu accessToken)
 */
router.delete('/:id', protect, attendanceController.delete)

export default router
