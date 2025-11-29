import WorkSchedule from './work_schedules.model.js'
import Attendance from '../attendance/attendance.model.js'
import SalesInvoice from '../sales/sales.model.js'

class WorkScheduleRepository {
  async getAllWorkSchedules() {
    return await WorkSchedule.find()
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async getWorkScheduleById(id) {
    return await WorkSchedule.findById(id)
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
  }

  async getWorkSchedulesByUserId(userId) {
    return await WorkSchedule.find({ user_id: userId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async createWorkSchedule(data) {
    const workSchedule = new WorkSchedule(data)
    return await workSchedule.save()
  }

  async createMultipleWorkSchedules(data) {
    return await WorkSchedule.insertMany(data)
  }

  async updateWorkSchedule(id, data) {
    return await WorkSchedule.findByIdAndUpdate(id, data, { new: true })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
  }

  async deleteWorkSchedule(id) {
    return await WorkSchedule.findByIdAndDelete(id)
  }

  async getWorkSchedulesByBranchId(branchId) {
    return await WorkSchedule.find({ branch_id: branchId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async getWorkSchedulesByBranchIdAndDateRange(branchId, from, to) {
    return await WorkSchedule.find({
      branch_id: branchId,
      date: { $gte: from, $lte: to },
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: 1, shift: 1 })
  }

  async getWorkSchedulesByBranchIdAndDate(branchId, date) {
    return await WorkSchedule.find({
      branch_id: branchId,
      date: date,
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ shift: 1 })
  }

  async checkDuplicateSchedule(userId, date, shift) {
    return await WorkSchedule.findOne({
      user_id: userId,
      date: date,
      shift: shift,
    })
  }

  async deleteByBranchIdAndDateRange(branchId, from, to) {
    return await WorkSchedule.deleteMany({
      branch_id: branchId,
      date: { $gte: from, $lte: to },
    })
  }

  async getWorkScheduleByUserIdAndDate(userId, date) {
    return await WorkSchedule.findOne({
      user_id: userId,
      date: date,
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address location')
      .populate('created_by', 'username name')
  }

  // Get attendance history for employee with work schedule comparison
  async getAttendanceHistoryByEmployeeId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    // Lấy attendance records của employee
    const total = await Attendance.countDocuments({ user_id: userId })
    const attendanceData = await Attendance.find({ user_id: userId })
      .populate('user_id', 'username name role contact')
      .populate('branch_id', 'name address phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Lấy work schedules của employee để so sánh
    const allWorkSchedules = await WorkSchedule.find({ user_id: userId })

    // Tạo map từ date + shift để so sánh
    const scheduleMap = {}
    allWorkSchedules.forEach((schedule) => {
      const key = `${schedule.date}_${schedule.shift}`
      scheduleMap[key] = schedule
    })

    // Kết hợp attendance data với schedule comparison
    const enrichedData = attendanceData.map((attendance) => {
      const checkinDate = attendance.checkin_time.split('T')[0]

      // Xác định shift từ checkin time
      const checkinHour = parseInt(attendance.checkin_time.split('T')[1].split(':')[0])
      const shift = checkinHour < 12 ? 'morning' : 'afternoon'

      const scheduleKey = `${checkinDate}_${shift}`
      const scheduledShift = scheduleMap[scheduleKey]

      return {
        ...attendance.toObject(),
        scheduledShift: scheduledShift || null,
        isOnSchedule: !!scheduledShift,
        shift: shift,
        date: checkinDate,
      }
    })

    return {
      data: enrichedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Get attendance history for branch employees with work schedule comparison
  async getAttendanceHistoryByBranchId(branchId, page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit
    const query = { branch_id: branchId }

    // Add optional filters
    if (filters.from_date && filters.to_date) {
      const fromDateTime = `${filters.from_date}T00:00:00`
      const toDateTime = `${filters.to_date}T23:59:59`
      query.checkin_time = { $gte: fromDateTime, $lte: toDateTime }
    } else if (filters.from_date) {
      const fromDateTime = `${filters.from_date}T00:00:00`
      query.checkin_time = { $gte: fromDateTime }
    } else if (filters.to_date) {
      const toDateTime = `${filters.to_date}T23:59:59`
      query.checkin_time = { $lte: toDateTime }
    }

    if (filters.user_id) {
      query.user_id = filters.user_id
    }

    if (filters.status) {
      query.status = filters.status
    }

    const total = await Attendance.countDocuments(query)
    const attendanceData = await Attendance.find(query)
      .populate('user_id', 'username name role contact')
      .populate('branch_id', 'name address phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Lấy work schedules để so sánh
    const branchSchedules = await WorkSchedule.find({ branch_id: branchId })

    // Tạo map từ user_id + date + shift
    const scheduleMap = {}
    branchSchedules.forEach((schedule) => {
      const key = `${schedule.user_id}_${schedule.date}_${schedule.shift}`
      scheduleMap[key] = schedule
    })

    // Kết hợp attendance data với schedule comparison
    const enrichedData = attendanceData.map((attendance) => {
      const checkinDate = attendance.checkin_time.split('T')[0]

      // Xác định shift từ checkin time
      const checkinHour = parseInt(attendance.checkin_time.split('T')[1].split(':')[0])
      const shift = checkinHour < 12 ? 'morning' : 'afternoon'

      const scheduleKey = `${attendance.user_id}_${checkinDate}_${shift}`
      const scheduledShift = scheduleMap[scheduleKey]

      return {
        ...attendance.toObject(),
        scheduledShift: scheduledShift || null,
        isOnSchedule: !!scheduledShift,
        shift: shift,
        date: checkinDate,
      }
    })

    return {
      data: enrichedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Get attendance history for all branches with work schedule comparison
  async getAttendanceHistoryAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit
    const query = {}

    // Add optional filters
    if (filters.from_date && filters.to_date) {
      const fromDateTime = `${filters.from_date}T00:00:00`
      const toDateTime = `${filters.to_date}T23:59:59`
      query.checkin_time = { $gte: fromDateTime, $lte: toDateTime }
    } else if (filters.from_date) {
      const fromDateTime = `${filters.from_date}T00:00:00`
      query.checkin_time = { $gte: fromDateTime }
    } else if (filters.to_date) {
      const toDateTime = `${filters.to_date}T23:59:59`
      query.checkin_time = { $lte: toDateTime }
    }

    if (filters.branch_id) {
      query.branch_id = filters.branch_id
    }

    if (filters.user_id) {
      query.user_id = filters.user_id
    }

    if (filters.status) {
      query.status = filters.status
    }

    const total = await Attendance.countDocuments(query)
    const attendanceData = await Attendance.find(query)
      .populate('user_id', 'username name role contact')
      .populate('branch_id', 'name address phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Lấy tất cả work schedules để so sánh
    const allSchedules = await WorkSchedule.find()

    // Tạo map từ user_id + date + shift
    const scheduleMap = {}
    allSchedules.forEach((schedule) => {
      const key = `${schedule.user_id}_${schedule.date}_${schedule.shift}`
      scheduleMap[key] = schedule
    })

    // Kết hợp attendance data với schedule comparison
    const enrichedData = attendanceData.map((attendance) => {
      const checkinDate = attendance.checkin_time.split('T')[0]

      // Xác định shift từ checkin time
      const checkinHour = parseInt(attendance.checkin_time.split('T')[1].split(':')[0])
      const shift = checkinHour < 12 ? 'morning' : 'afternoon'

      const scheduleKey = `${attendance.user_id}_${checkinDate}_${shift}`
      const scheduledShift = scheduleMap[scheduleKey]

      return {
        ...attendance.toObject(),
        scheduledShift: scheduledShift || null,
        isOnSchedule: !!scheduledShift,
        shift: shift,
        date: checkinDate,
      }
    })

    return {
      data: enrichedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Get detailed attendance record with invoices created during this shift
  async getAttendanceDetailWithInvoices(attendanceId) {
    const attendance = await Attendance.findById(attendanceId)
      .populate('user_id', 'username name role contact')
      .populate('branch_id', 'name address phone')

    if (!attendance) {
      return null
    }

    // Get work schedule for this shift
    const checkinDate = attendance.checkin_time.split('T')[0]
    const checkinHour = parseInt(attendance.checkin_time.split('T')[1].split(':')[0])
    const shift = checkinHour < 12 ? 'morning' : 'afternoon'

    const workSchedule = await WorkSchedule.findOne({
      user_id: attendance.user_id._id,
      date: checkinDate,
      shift: shift,
    })

    // Get invoices created by this employee between checkin and checkout time
    const invoiceFilter = {
      employee_id: attendance.user_id._id,
      branch_id: attendance.branch_id._id,
      createdAt: {
        $gte: attendance.checkin_time,
        $lte: attendance.checkout_time || new Date(),
      },
    }

    const invoices = await SalesInvoice.find(invoiceFilter)
      .populate('customer_id', 'name phone address')
      .populate('items.medicine_id', 'name unit price category')
      .populate('items.batch_id', 'batch_number expiry_date')
      .sort({ createdAt: -1 })
      .lean()

    return {
      ...attendance.toObject(),
      date: checkinDate,
      shift: shift,
      scheduledShift: workSchedule || null,
      isOnSchedule: !!workSchedule,
      invoices: invoices,
      invoiceCount: invoices.length,
      invoiceSummary: {
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        totalItems: invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0),
      },
    }
  }
}

export default new WorkScheduleRepository()
