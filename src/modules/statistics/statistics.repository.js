// src/modules/statistics/statistics.repository.js
import SalesInvoice from '../sales/sales.model.js'

class StatisticsRepository {
  /**
   * Thống kê tổng quan về doanh số bán thuốc
   * @param {Object} filters - { startDate, endDate, branchId, employeeId }
   * @returns {Promise<Object>} - Tổng số lượng và doanh thu
   */
  async getOverallStats(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId) {
      matchConditions.branch_id = filters.branchId
    }

    // Lọc theo nhân viên
    if (filters.employeeId) {
      matchConditions.employee_id = filters.employeeId
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
        },
      },
    ])

    return (
      result[0] || {
        totalQuantity: 0,
        totalRevenue: 0,
        totalInvoices: 0,
        totalDiscount: 0,
        totalTax: 0,
      }
    )
  }

  /**
   * Thống kê chi tiết theo từng thuốc
   * @param {Object} filters - { startDate, endDate, branchId, employeeId }
   * @returns {Promise<Array>} - Danh sách thuốc với số lượng và doanh thu
   */
  async getMedicineStats(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId) {
      matchConditions.branch_id = filters.branchId
    }

    // Lọc theo nhân viên
    if (filters.employeeId) {
      matchConditions.employee_id = filters.employeeId
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine_id',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.line_total' },
          averagePrice: { $avg: '$items.unit_price' },
          timesOrdered: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $project: {
          _id: 1,
          medicineName: '$medicine.name',
          medicineUnit: '$medicine.unit',
          medicineCategory: '$medicine.category',
          totalQuantity: 1,
          totalRevenue: 1,
          averagePrice: { $round: ['$averagePrice', 0] },
          timesOrdered: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Lấy top thuốc bán chạy nhất
   * @param {Object} filters - { startDate, endDate, branchId, employeeId, limit }
   * @returns {Promise<Array>} - Top thuốc bán chạy
   */
  async getTopSellingMedicines(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId) {
      matchConditions.branch_id = filters.branchId
    }

    // Lọc theo nhân viên
    if (filters.employeeId) {
      matchConditions.employee_id = filters.employeeId
    }

    const limit = parseInt(filters.limit) || 10

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine_id',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.line_total' },
          averagePrice: { $avg: '$items.unit_price' },
          timesOrdered: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $project: {
          _id: 1,
          medicineName: '$medicine.name',
          medicineUnit: '$medicine.unit',
          medicineCategory: '$medicine.category',
          totalQuantity: 1,
          totalRevenue: 1,
          averagePrice: { $round: ['$averagePrice', 0] },
          timesOrdered: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ])

    return result
  }

  /**
   * Thống kê theo khoảng thời gian (ngày, tuần, tháng)
   * @param {Object} filters - { startDate, endDate, branchId, employeeId, groupBy }
   * @returns {Promise<Array>} - Thống kê theo thời gian
   */
  async getStatsByPeriod(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId) {
      matchConditions.branch_id = filters.branchId
    }

    // Lọc theo nhân viên
    if (filters.employeeId) {
      matchConditions.employee_id = filters.employeeId
    }

    // Xác định cách group theo thời gian
    const groupBy = filters.groupBy || 'day'
    let dateGroup = {}

    switch (groupBy) {
      case 'day':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        }
        break
      case 'month':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        }
        break
      case 'year':
        dateGroup = {
          year: { $year: '$createdAt' },
        }
        break
      default:
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: dateGroup,
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          totalInvoices: { $size: '$totalInvoices' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    return result
  }

  /**
   * Thống kê theo chi nhánh
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Thống kê từng chi nhánh
   */
  async getStatsByBranch(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$branch_id',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $addToSet: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $project: {
          _id: 1,
          branchName: '$branch.name',
          branchAddress: '$branch.address',
          totalQuantity: 1,
          totalRevenue: 1,
          totalInvoices: { $size: '$totalInvoices' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê theo nhân viên
   * @param {Object} filters - { startDate, endDate, branchId }
   * @returns {Promise<Array>} - Thống kê từng nhân viên
   */
  async getStatsByEmployee(filters = {}) {
    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Lọc theo chi nhánh
    if (filters.branchId) {
      matchConditions.branch_id = filters.branchId
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$employee_id',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $addToSet: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 1,
          employeeName: '$employee.fullName',
          employeeUsername: '$employee.username',
          totalQuantity: 1,
          totalRevenue: 1,
          totalInvoices: { $size: '$totalInvoices' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }
}

export default new StatisticsRepository()
