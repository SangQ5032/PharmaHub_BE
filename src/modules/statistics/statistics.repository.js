// src/modules/statistics/statistics.repository.js
import SalesInvoice from '../sales/sales.model.js'
import { Import } from '../imports/imports.model.js'
import { Batch } from '../batches/batches.model.js'
import Branch from '../branch/branch.model.js'
import Payroll from '../payroll/payroll.model.js'

class StatisticsRepository {
  /**
   * Thống kê tổng quan về doanh số bán thuốc
   * @param {Object} filters - { startDate, endDate, branchId, employeeId }
   * @returns {Promise<Object>} - Tổng số lượng và doanh thu
   */
  async getOverallStats(filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId

    const matchConditions = { status: 'completed' }

    // Lọc theo thời gian
    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    // Lọc theo chi nhánh - chuyển đổi sang ObjectId
    if (filters.branchId) {
      matchConditions.branch_id = new ObjectId(filters.branchId)
    }

    // Lọc theo nhân viên - chuyển đổi sang ObjectId
    if (filters.employeeId) {
      matchConditions.employee_id = new ObjectId(filters.employeeId)
    }

    // Tính tổng quantity từ items
    const quantityResult = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
    ])

    // Tính tổng revenue, invoices, discount, tax từ invoice
    const invoiceResult = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
        },
      },
    ])

    // Merge kết quả
    const quantity = quantityResult[0]?.totalQuantity || 0
    const invoice = invoiceResult[0] || {
      totalRevenue: 0,
      totalInvoices: 0,
      totalDiscount: 0,
      totalTax: 0,
    }

    return {
      totalQuantity: quantity,
      totalRevenue: Math.round(invoice.totalRevenue),
      totalInvoices: invoice.totalInvoices,
      totalDiscount: Math.round(invoice.totalDiscount),
      totalTax: Math.round(invoice.totalTax),
    }

    // return (
    //   result[0] || {
    //     totalQuantity: 0,
    //     totalRevenue: 0,
    //     totalInvoices: 0,
    //     totalDiscount: 0,
    //     totalTax: 0,
    //   }
    // )
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
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          medicineUnit: { $ifNull: ['$medicine.unit', 'N/A'] },
          medicineCategory: { $ifNull: ['$medicine.category', 'N/A'] },
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
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
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
          timesOrdered: { $addToSet: '$_id' },
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
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          medicineUnit: { $ifNull: ['$medicine.unit', 'N/A'] },
          medicineCategory: { $ifNull: ['$medicine.category', 'N/A'] },
          totalQuantity: 1,
          totalRevenue: 1,
          averagePrice: { $round: ['$averagePrice', 0] },
          timesOrdered: { $size: '$timesOrdered' },
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
      case 'week':
        dateGroup = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
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
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          branchName: { $ifNull: ['$branch.name', 'Chi nhánh không tồn tại'] },
          branchAddress: { $ifNull: ['$branch.address', 'N/A'] },
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
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          employeeName: { $ifNull: ['$employee.fullName', 'Nhân viên không tồn tại'] },
          employeeUsername: { $ifNull: ['$employee.username', 'N/A'] },
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
   * Lấy doanh thu cá nhân của nhân viên (chỉ tập trung vào doanh thu)
   * @param {string} employeeId - ID của nhân viên
   * @param {Object} filters - { startDate, endDate, groupBy (day|week|month|year) }
   * @returns {Promise<Object|Array>} - Doanh thu cá nhân
   */
  async getEmployeePersonalRevenue(employeeId, filters = {}) {
    const matchConditions = {
      status: 'completed',
      employee_id: employeeId,
    }

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

    // Nếu không có groupBy, trả về tổng doanh thu
    if (!filters.groupBy) {
      const result = await SalesInvoice.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total_amount' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$total_amount' },
            minOrderValue: { $min: '$total_amount' },
            maxOrderValue: { $max: '$total_amount' },
          },
        },
      ])

      return (
        result[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          minOrderValue: 0,
          maxOrderValue: 0,
        }
      )
    }

    // Thống kê doanh thu theo thời gian (ngày/tuần/tháng/năm)
    let groupId
    switch (filters.groupBy) {
      case 'day':
        groupId = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
        break
      case 'week':
        groupId = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        }
        break
      case 'month':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        }
        break
      case 'year':
        groupId = { $year: '$createdAt' }
        break
      default:
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total_amount' },
        },
      },
      {
        $project: {
          _id: 1,
          period: '$_id',
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalOrders: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 0] },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result
  }

  /**
   * Thống kê cá nhân của nhân viên hiện tại (có lọc theo ngày/tháng/năm)
   * @param {string} employeeId - ID của nhân viên
   * @param {Object} filters - { startDate, endDate, groupBy (day|week|month|year) }
   * @returns {Promise<Object>} - Thống kê cá nhân gồm tổng số đơn hàng, tổng doanh thu, etc.
   */
  async getEmployeePersonalStatistics(employeeId, filters = {}) {
    const matchConditions = {
      status: 'completed',
      employee_id: employeeId,
    }

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

    // Nếu không có groupBy, trả về thống kê tổng hợp
    if (!filters.groupBy) {
      const result = await SalesInvoice.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalQuantity: { $sum: { $sum: '$items.quantity' } },
            totalRevenue: { $sum: '$total_amount' },
            totalDiscount: { $sum: '$discount' },
            totalTax: { $sum: '$tax_amount' },
            averageOrderValue: { $avg: '$total_amount' },
          },
        },
      ])

      return (
        result[0] || {
          totalOrders: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTax: 0,
          averageOrderValue: 0,
        }
      )
    }

    // Thống kê theo thời gian (ngày/tuần/tháng/năm)
    let groupId
    switch (filters.groupBy) {
      case 'day':
        groupId = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
        break
      case 'week':
        groupId = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        }
        break
      case 'month':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        }
        break
      case 'year':
        groupId = { $year: '$createdAt' }
        break
      default:
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: groupId,
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalRevenue: { $sum: '$total_amount' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
          averageOrderValue: { $avg: '$total_amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result
  }

  /**
   * Thống kê doanh thu toàn cửa hàng theo chi nhánh (BRANCH-MANAGER)
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate, groupBy }
   * @returns {Promise<Object>} - Tổng doanh thu, số đơn hàng, số lượng thuốc bán ra
   */
  async getBranchRevenueStatistics(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { status: 'completed', branch_id: branchObjectId }

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
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
          averageInvoiceValue: { $avg: '$total_amount' },
        },
      },
    ])

    return (
      result[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        totalQuantity: 0,
        totalDiscount: 0,
        totalTax: 0,
        averageInvoiceValue: 0,
      }
    )
  }

  /**
   * Thống kê doanh thu từng nhân viên theo chi nhánh
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách nhân viên với doanh thu của họ
   */
  async getBranchEmployeeRevenue(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { status: 'completed', branch_id: branchObjectId }

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
      {
        $group: {
          _id: '$employee_id',
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          averageOrderValue: { $avg: '$total_amount' },
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
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          employeeId: '$_id',
          employeeName: { $ifNull: ['$employee.name', 'Nhân viên không tồn tại'] },
          totalRevenue: 1,
          totalOrders: 1,
          totalQuantity: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 0] },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê số lượng thuốc đã bán ra và phân loại theo sản phẩm
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Object>} - Tổng số lượng bán + phân loại theo sản phẩm
   */
  async getBranchSalesMedicineStatistics(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { status: 'completed', branch_id: branchObjectId }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    // Tổng thống kê
    const overallStats = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalMedicineTypes: { $addToSet: '$items.medicine_id' },
          totalRevenue: { $sum: '$total_amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalMedicineTypes: { $size: '$totalMedicineTypes' },
          totalRevenue: 1,
        },
      },
    ])

    // Chi tiết theo từng loại thuốc
    const medicineDetails = await SalesInvoice.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine_id',
          medicineName: { $first: '$items.name' },
          batchNumber: { $first: '$items.batch_number' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.line_total' },
          timesOrdered: { $sum: 1 },
          averagePrice: { $avg: '$items.unit_price' },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      { $unwind: { path: '$medicineDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          medicineId: '$_id',
          medicineName: 1,
          category: { $ifNull: ['$medicineDetails.category_id', 'N/A'] },
          totalQuantity: 1,
          totalRevenue: 1,
          timesOrdered: 1,
          averagePrice: { $round: ['$averagePrice', 0] },
          _id: 0,
        },
      },
      { $sort: { totalQuantity: -1 } },
    ])

    return {
      overall: overallStats[0] || { totalQuantity: 0, totalMedicineTypes: 0, totalRevenue: 0 },
      medicineDetails,
    }
  }

  /**
   * Thống kê các lô hàng đã nhập
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate, supplierId }
   * @returns {Promise<Array>} - Danh sách các lô hàng nhập
   */
  async getBranchImportStatistics(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { branch_id: branchObjectId }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    if (filters.supplierId) {
      matchConditions.supplier_id = new ObjectId(filters.supplierId)
    }

    const result = await Import.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            batchNumber: '$items.batch_number',
            medicineId: '$items.medicine_id',
          },
          importId: { $first: '$_id' },
          quantity: { $sum: '$items.quantity' },
          unitPrice: { $first: '$items.unit_price' },
          expiryDate: { $first: '$items.expiry_date' },
          supplierId: { $first: '$supplier_id' },
          createdAt: { $first: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id.medicineId',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          batchNumber: '$_id.batchNumber',
          quantity: 1,
          unitPrice: 1,
          totalCost: { $multiply: ['$quantity', '$unitPrice'] },
          expiryDate: 1,
          supplierName: { $ifNull: ['$supplier.name', 'Nhà cung cấp không tồn tại'] },
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])

    return result
  }

  /**
   * Thống kê tình trạng lô hàng (hết/còn hàng, còn hạn/hết hạn)
   * @param {string} branchId - ID chi nhánh
   * @returns {Promise<Array>} - Danh sách lô hàng với tình trạng
   */
  async getBranchBatchStatusStatistics(branchId) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId

    const branchObjectId = new ObjectId(branchId)
    const today = new Date()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    const result = await Batch.aggregate([
      { $match: { branch_id: branchObjectId } },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          batchNumber: 1,
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          quantity: 1,
          initialQuantity: 1,
          status: 1,
          expiryDate: 1,
          importPrice: 1,
          isExpired: { $gte: [new Date(), '$expiryDate'] },
          isOutOfStock: { $eq: ['$quantity', 0] },
          quantitySold: { $subtract: ['$initialQuantity', '$quantity'] },
        },
      },
      {
        $addFields: {
          stockStatus: {
            $cond: [{ $eq: ['$quantity', 0] }, 'Hết hàng', 'Còn hàng'],
          },
          expiryStatus: {
            $cond: [{ $gte: [new Date(), '$expiryDate'] }, 'Hết hạn', 'Còn hạn'],
          },
        },
      },
      { $sort: { expiryDate: 1 } },
    ])

    // Tính toán thống kê tổng hợp
    const summary = {
      total: result.length,
      outOfStock: result.filter((b) => b.quantity === 0).length,
      inStock: result.filter((b) => b.quantity > 0).length,
      expired: result.filter((b) => b.isExpired).length,
      expiringSoon: result.filter(
        (b) => !b.isExpired && new Date(b.expiryDate).getTime() - today.getTime() <= thirtyDaysMs
      ).length,
      valid: result.filter(
        (b) => !b.isExpired && new Date(b.expiryDate).getTime() - today.getTime() > thirtyDaysMs
      ).length,
    }

    return {
      summary,
      details: result,
    }
  }

  /**
   * Thống kê doanh thu và số đơn hàng theo khách hàng
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách khách hàng với thống kê doanh thu
   */
  async getBranchCustomerStatistics(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { status: 'completed', branch_id: branchObjectId }

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
      {
        $group: {
          _id: '$customer_id',
          customerName: { $first: '$customer_name' },
          customerPhone: { $first: '$customer_phone' },
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          averageOrderValue: { $avg: '$total_amount' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          customerId: '$_id',
          customerName: { $ifNull: ['$customerDetails.name', '$customerName'] },
          customerPhone: { $ifNull: ['$customerDetails.phone', '$customerPhone'] },
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalOrders: 1,
          totalQuantity: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 0] },
          lastOrderDate: 1,
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê doanh thu theo chi nhánh theo khoảng thời gian
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate, groupBy }
   * @returns {Promise<Array>} - Thống kê theo thời gian
   */
  async getBranchRevenueByPeriod(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    const matchConditions = { status: 'completed', branch_id: branchObjectId }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchConditions.createdAt.$lte = new Date(filters.endDate)
      }
    }

    const groupBy = filters.groupBy || 'day'
    let dateGroup = {}

    switch (groupBy) {
      case 'day':
        dateGroup = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
        break
      case 'week':
        dateGroup = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        }
        break
      case 'month':
        dateGroup = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' },
        }
        break
      case 'year':
        dateGroup = {
          $year: '$createdAt',
        }
        break
      default:
        dateGroup = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: dateGroup,
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result
  }

  // ========== SYSTEM ADMIN STATISTICS ==========

  /**
   * Thống kê doanh thu từng chi nhánh (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách chi nhánh với doanh thu
   */
  async getSystemAdminBranchRevenueStatistics(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$branch_id',
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
          averageInvoiceValue: { $avg: '$total_amount' },
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
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          branchId: '$_id',
          branchName: { $ifNull: ['$branch.name', 'Chi nhánh không tồn tại'] },
          branchAddress: { $ifNull: ['$branch.address', 'N/A'] },
          branchPhone: { $ifNull: ['$branch.phone', 'N/A'] },
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalInvoices: 1,
          totalQuantity: 1,
          totalDiscount: { $round: ['$totalDiscount', 0] },
          totalTax: { $round: ['$totalTax', 0] },
          averageInvoiceValue: { $round: ['$averageInvoiceValue', 0] },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê tổng quan toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Object>} - Tổng doanh thu, số đơn hàng, số lượng thuốc bán ra
   */
  async getSystemAdminOverallStatistics(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
          averageInvoiceValue: { $avg: '$total_amount' },
          totalBranches: { $addToSet: '$branch_id' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalInvoices: 1,
          totalQuantity: 1,
          totalDiscount: { $round: ['$totalDiscount', 0] },
          totalTax: { $round: ['$totalTax', 0] },
          averageInvoiceValue: { $round: ['$averageInvoiceValue', 0] },
          totalBranches: { $size: '$totalBranches' },
        },
      },
    ])

    return (
      result[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        totalQuantity: 0,
        totalDiscount: 0,
        totalTax: 0,
        averageInvoiceValue: 0,
        totalBranches: 0,
      }
    )
  }

  /**
   * Thống kê doanh thu từng nhân viên toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách nhân viên với doanh thu
   */
  async getSystemAdminEmployeeRevenueStatistics(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$employee_id',
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          branchId: { $first: '$branch_id' },
          averageOrderValue: { $avg: '$total_amount' },
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
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          employeeId: '$_id',
          employeeName: { $ifNull: ['$employee.fullName', 'Nhân viên không tồn tại'] },
          employeeUsername: { $ifNull: ['$employee.username', 'N/A'] },
          branchName: { $ifNull: ['$branch.name', 'Chi nhánh không tồn tại'] },
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalOrders: 1,
          totalQuantity: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 0] },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê chi tiết thuốc bán chạy toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate, limit }
   * @returns {Promise<Array>} - Top thuốc bán chạy
   */
  async getSystemAdminTopSellingMedicines(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
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
          timesOrdered: { $addToSet: '$_id' },
          branchCount: { $addToSet: '$branch_id' },
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
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          medicineId: '$_id',
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          medicineUnit: { $ifNull: ['$medicine.unit', 'N/A'] },
          medicineCategory: { $ifNull: ['$medicine.category', 'N/A'] },
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 0] },
          averagePrice: { $round: ['$averagePrice', 0] },
          timesOrdered: { $size: '$timesOrdered' },
          branchesCount: { $size: '$branchCount' },
          _id: 0,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ])

    return result
  }

  /**
   * Thống kê doanh thu theo thời gian toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate, groupBy }
   * @returns {Promise<Array>} - Thống kê theo thời gian
   */
  async getSystemAdminRevenueByPeriod(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const groupBy = filters.groupBy || 'day'
    let dateGroup = {}

    switch (groupBy) {
      case 'day':
        dateGroup = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
        break
      case 'week':
        dateGroup = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        }
        break
      case 'month':
        dateGroup = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' },
        }
        break
      case 'year':
        dateGroup = {
          $year: '$createdAt',
        }
        break
      default:
        dateGroup = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: dateGroup,
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result
  }

  /**
   * Thống kê doanh thu theo khách hàng toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách khách hàng với thống kê doanh thu
   */
  async getSystemAdminCustomerStatistics(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$customer_id',
          customerName: { $first: '$customer_name' },
          customerPhone: { $first: '$customer_phone' },
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          averageOrderValue: { $avg: '$total_amount' },
          lastOrderDate: { $max: '$createdAt' },
          branchCount: { $addToSet: '$branch_id' },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          customerId: '$_id',
          customerName: { $ifNull: ['$customerDetails.name', '$customerName'] },
          customerPhone: { $ifNull: ['$customerDetails.phone', '$customerPhone'] },
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalOrders: 1,
          totalQuantity: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 0] },
          lastOrderDate: 1,
          branchesCount: { $size: '$branchCount' },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê tổng nhập hàng toàn hệ thống (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Object>} - Tổng nhập hàng
   */
  async getSystemAdminImportStatistics(filters = {}) {
    const matchConditions = {}

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        // Thêm 1 ngày để bao gồm cả ngày cuối
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await Import.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalImports: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          totalCost: { $sum: { $multiply: ['$items.quantity', '$items.unit_price'] } },
          totalBatches: { $addToSet: '$items.batch_number' },
        },
      },
      {
        $project: {
          _id: 0,
          totalImports: 1,
          totalQuantity: 1,
          totalCost: { $round: ['$totalCost', 0] },
          totalBatches: { $size: '$totalBatches' },
        },
      },
    ])

    return (
      result[0] || {
        totalImports: 0,
        totalQuantity: 0,
        totalCost: 0,
        totalBatches: 0,
      }
    )
  }

  /**
   * Thống kê tình trạng batch toàn hệ thống (SYSTEM-ADMIN)
   * @returns {Promise<Object>} - Tình trạng batch tổng hợp
   */
  async getSystemAdminBatchStatusStatistics() {
    const today = new Date()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    const result = await Batch.aggregate([
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          batchNumber: 1,
          medicineName: { $ifNull: ['$medicine.name', 'Thuốc không tồn tại'] },
          branchName: { $ifNull: ['$branch.name', 'Chi nhánh không tồn tại'] },
          quantity: 1,
          initialQuantity: 1,
          expiryDate: 1,
          importPrice: 1,
          isExpired: { $gte: [today, '$expiryDate'] },
          isOutOfStock: { $eq: ['$quantity', 0] },
          quantitySold: { $subtract: ['$initialQuantity', '$quantity'] },
        },
      },
      {
        $addFields: {
          stockStatus: {
            $cond: [{ $eq: ['$quantity', 0] }, 'Hết hàng', 'Còn hàng'],
          },
          expiryStatus: {
            $cond: [{ $gte: [today, '$expiryDate'] }, 'Hết hạn', 'Còn hạn'],
          },
        },
      },
      { $sort: { expiryDate: 1 } },
    ])

    // Tính toán thống kê tổng hợp
    const summary = {
      total: result.length,
      outOfStock: result.filter((b) => b.quantity === 0).length,
      inStock: result.filter((b) => b.quantity > 0).length,
      expired: result.filter((b) => b.isExpired).length,
      expiringSoon: result.filter(
        (b) => !b.isExpired && new Date(b.expiryDate).getTime() - today.getTime() <= thirtyDaysMs
      ).length,
      valid: result.filter(
        (b) => !b.isExpired && new Date(b.expiryDate).getTime() - today.getTime() > thirtyDaysMs
      ).length,
    }

    return {
      summary,
      details: result,
    }
  }

  /**
   * Thống kê doanh thu tất cả chi nhánh (SYSTEM-ADMIN)
   * @param {Object} filters - { startDate, endDate }
   * @returns {Promise<Array>} - Danh sách chi nhánh kèm doanh thu
   */
  async getSystemAdminBranchesRevenueStatistics(filters = {}) {
    const matchConditions = { status: 'completed' }

    if (filters.startDate || filters.endDate) {
      matchConditions.createdAt = {}
      if (filters.startDate) {
        matchConditions.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        matchConditions.createdAt.$lt = endDate
      }
    }

    const result = await SalesInvoice.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$branch_id',
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
          averageInvoiceValue: { $avg: '$total_amount' },
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branchInfo',
        },
      },
      { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          branchId: '$_id',
          branchName: { $ifNull: ['$branchInfo.name', 'Chi nhánh không tồn tại'] },
          branchAddress: { $ifNull: ['$branchInfo.address', 'N/A'] },
          branchPhone: { $ifNull: ['$branchInfo.phone', 'N/A'] },
          totalRevenue: { $round: ['$totalRevenue', 0] },
          totalInvoices: 1,
          totalQuantity: 1,
          totalDiscount: { $round: ['$totalDiscount', 0] },
          totalTax: { $round: ['$totalTax', 0] },
          averageInvoiceValue: { $round: ['$averageInvoiceValue', 0] },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])

    return result
  }

  /**
   * Thống kê doanh thu chi tiết chi nhánh (SYSTEM-ADMIN)
   * Bao gồm: doanh thu, chi tiêu (nhập hàng + lương nhân viên)
   * @param {string} branchId - ID chi nhánh
   * @param {Object} filters - { startDate, endDate, month }
   * @returns {Promise<Object>} - Thống kê chi tiết
   */
  async getSystemAdminBranchDetailedRevenueStatistics(branchId, filters = {}) {
    const mongoose = await import('mongoose')
    const ObjectId = mongoose.default.Types.ObjectId
    const branchObjectId = new ObjectId(branchId)

    // 1. Tính tổng doanh thu từ các hóa đơn bán hàng
    const invoiceMatch = { status: 'completed', branch_id: branchObjectId }
    if (filters.startDate || filters.endDate) {
      invoiceMatch.createdAt = {}
      if (filters.startDate) {
        invoiceMatch.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        invoiceMatch.createdAt.$lt = endDate
      }
    }

    const revenueStats = await SalesInvoice.aggregate([
      { $match: invoiceMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalInvoices: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax_amount' },
        },
      },
    ])

    // 2. Tính tổng chi tiêu nhập hàng
    const importMatch = { branch_id: branchObjectId }
    if (filters.startDate || filters.endDate) {
      importMatch.createdAt = {}
      if (filters.startDate) {
        importMatch.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        importMatch.createdAt.$lt = endDate
      }
    }

    const importStats = await Import.aggregate([
      { $match: importMatch },
      {
        $group: {
          _id: null,
          totalImportCost: { $sum: '$total_cost' },
          totalImports: { $sum: 1 },
          totalImportQuantity: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ])

    // 3. Tính tổng lương nhân viên theo chi nhánh (từ payroll với status: approved)
    let salaryMatch = { branch_id: branchObjectId, status: 'approved' }

    if (filters.month) {
      salaryMatch.month = filters.month
    } else if (filters.startDate || filters.endDate) {
      salaryMatch.createdAt = {}
      if (filters.startDate) {
        salaryMatch.createdAt.$gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        salaryMatch.createdAt.$lt = endDate
      }
    }

    const salaryStats = await Payroll.aggregate([
      { $match: salaryMatch },
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$final_salary' },
          totalEmployees: { $sum: 1 },
          totalBonus: { $sum: '$bonus_amount' },
          totalPenalty: { $sum: '$penalty_amount' },
        },
      },
    ])

    // 4. Lấy thông tin chi nhánh
    const branchInfo = await Branch.findById(branchObjectId)

    // Chuẩn bị data trả về
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalInvoices: 0,
      totalQuantity: 0,
      totalDiscount: 0,
      totalTax: 0,
    }

    const imports = importStats[0] || {
      totalImportCost: 0,
      totalImports: 0,
      totalImportQuantity: 0,
    }

    const salary = salaryStats[0] || {
      totalSalary: 0,
      totalEmployees: 0,
      totalBonus: 0,
      totalPenalty: 0,
    }

    const totalExpenditure = imports.totalImportCost + salary.totalSalary
    const netProfit = revenue.totalRevenue - totalExpenditure

    return {
      branchId: branchObjectId,
      branchName: branchInfo?.name || 'Chi nhánh không tồn tại',
      branchAddress: branchInfo?.address || 'N/A',
      branchPhone: branchInfo?.phone || 'N/A',
      // Doanh thu
      revenue: {
        totalRevenue: Math.round(revenue.totalRevenue),
        totalInvoices: revenue.totalInvoices,
        totalQuantity: revenue.totalQuantity,
        totalDiscount: Math.round(revenue.totalDiscount),
        totalTax: Math.round(revenue.totalTax),
        averageInvoiceValue:
          revenue.totalInvoices > 0 ? Math.round(revenue.totalRevenue / revenue.totalInvoices) : 0,
      },
      // Chi tiêu
      expenditure: {
        importCost: {
          totalCost: Math.round(imports.totalImportCost),
          totalImports: imports.totalImports,
          totalQuantity: imports.totalImportQuantity,
        },
        salary: {
          totalSalary: Math.round(salary.totalSalary),
          totalEmployees: salary.totalEmployees,
          totalBonus: Math.round(salary.totalBonus),
          totalPenalty: Math.round(salary.totalPenalty),
        },
        total: Math.round(totalExpenditure),
      },
      // Tổng hợp
      summary: {
        totalRevenue: Math.round(revenue.totalRevenue),
        totalExpenditure: Math.round(totalExpenditure),
        netProfit: Math.round(netProfit),
        profitMargin:
          revenue.totalRevenue > 0
            ? ((netProfit / revenue.totalRevenue) * 100).toFixed(2) + '%'
            : '0%',
      },
    }
  }
}

export default new StatisticsRepository()
