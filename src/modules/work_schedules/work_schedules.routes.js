import express from 'express'
const router = express.Router()
import workScheduleController from './work_schedules.controller.js'
import { protect } from '../../middlewares/authMiddleware.js'

/**
 * @route   POST /api/work-schedules/week
 * @desc    Tạo lịch làm việc cho cả tuần
 * @access  Private (yêu cầu accessToken)
 */
router.post('/week', protect, workScheduleController.createWeekSchedule)

/**
 * @route   POST /api/work-schedules/day
 * @desc    Tạo hoặc cập nhật lịch cho 1 ngày + 2 ca
 * @access  Private (yêu cầu accessToken)
 */
router.post('/day', protect, workScheduleController.createDaySchedule)

/**
 * @route   GET /api/work-schedules/week
 * @desc    Lấy lịch tuần (query params: branch_id, from, to)
 * @access  Private (yêu cầu accessToken)
 */
router.get('/week', protect, workScheduleController.getWeekSchedules)

/**
 * @route   GET /api/work-schedules/day
 * @desc    Lấy lịch theo ngày (query params: branch_id, date)
 * @access  Private (yêu cầu accessToken)
 */
router.get('/day', protect, workScheduleController.getDaySchedules)

/**
 * @route   POST /api/work-schedules
 * @desc    Tạo lịch làm việc mới (single schedule)
 * @access  Private (yêu cầu accessToken)
 */
router.post('/', protect, workScheduleController.create)

/**
 * @route   GET /api/work-schedules
 * @desc    Lấy tất cả lịch làm việc của chi nhánh hiện tại
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
 * @route   GET /api/work-schedules/branch/:branchId
 * @desc    Lấy tất cả lịch làm việc theo chi nhánh
 * @access  Private (yêu cầu accessToken)
 */
router.get('/branch/:branchId', protect, workScheduleController.getByBranchId)

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
