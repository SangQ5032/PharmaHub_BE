import express from 'express'
const router = express.Router()
import workScheduleController from './work_schedules.controller.js'
import { protect } from '../../middlewares/authMiddleware.js'

/**
 * @route   POST /api/work-schedules
 * @desc    Tạo lịch làm việc mới
 * @access  Private (yêu cầu accessToken)
 */
router.post('/', protect, workScheduleController.create)

/**
 * @route   GET /api/work-schedules
 * @desc    Lấy tất cả lịch làm việc
 * @access  Private (yêu cầu accessToken)
 */
router.get('/', protect, workScheduleController.getAll)

/**
 * @route   GET /api/work-schedules/my-schedule
 * @desc    Lấy lịch làm việc của user hiện tại (từ token)
 * @access  Private (yêu cầu accessToken)
 */
router.get('/my-schedule', protect, workScheduleController.getMySchedule)

/**
 * @route   GET /api/work-schedules/:id
 * @desc    Lấy lịch làm việc theo ID
 * @access  Private (yêu cầu accessToken)
 */
router.get('/:id', protect, workScheduleController.getById)

/**
 * @route   PUT /api/work-schedules/:id
 * @desc    Cập nhật lịch làm việc
 * @access  Private (yêu cầu accessToken)
 */
router.put('/:id', protect, workScheduleController.update)

/**
 * @route   DELETE /api/work-schedules/:id
 * @desc    Xóa lịch làm việc
 * @access  Private (yêu cầu accessToken)
 */
router.delete('/:id', protect, workScheduleController.delete)

export default router
