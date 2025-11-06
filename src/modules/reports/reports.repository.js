// MODULE: REPORTS - REPOSITORY (Data Access Layer)
// Mục đích: Xử lý truy vấn database cho báo cáo tồn kho
// - Sử dụng Aggregation Pipeline để tổng hợp dữ liệu
// - Không chứa business logic, chỉ truy vấn dữ liệu

import { Inventory } from '../inventory/inventory.model.js'
import Branch from '../branch/branch.model.js'

class ReportsRepository {
  /**
   * Lấy báo cáo tồn kho theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @returns {Object} Báo cáo tồn kho
   */
  async getInventoryReportByBranch(branchId) {
    const report = await Inventory.aggregate([
      // Stage 1: Lọc theo chi nhánh
      {
        $match: {
          branch_id: branchId,
        },
      },

      // Stage 2: Lookup thông tin thuốc
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },

      // Stage 3: Unwind medicine array
      {
        $unwind: '$medicine',
      },

      // Stage 4: Lookup thông tin chi nhánh
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },

      // Stage 5: Unwind branch array
      {
        $unwind: '$branch',
      },

      // Stage 6: Thêm các trường tính toán
      {
        $addFields: {
          // Tính status
          status: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'out_of_stock',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', '$medicine.warning_threshold'] },
                  then: 'low_stock',
                  else: 'sufficient',
                },
              },
            },
          },
          // Kiểm tra thuốc sắp hết hạn (3 tháng)
          isExpiringSoon: {
            $lte: [
              '$medicine.expiry_date',
              {
                $add: [new Date(), 3 * 30 * 24 * 60 * 60 * 1000], // 3 tháng
              },
            ],
          },
          // Kiểm tra thuốc đã hết hạn
          isExpired: {
            $lt: ['$medicine.expiry_date', new Date()],
          },
        },
      },

      // Stage 7: Group để tính tổng
      {
        $group: {
          _id: '$branch_id',
          branch_name: { $first: '$branch.name' },
          branch_address: { $first: '$branch.address' },
          total_medicines: { $sum: 1 }, // Tổng số loại thuốc
          total_quantity: { $sum: '$quantity' }, // Tổng số lượng
          low_stock_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0],
            },
          },
          out_of_stock_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0],
            },
          },
          expiring_soon_count: {
            $sum: {
              $cond: ['$isExpiringSoon', 1, 0],
            },
          },
          expired_count: {
            $sum: {
              $cond: ['$isExpired', 1, 0],
            },
          },
          items: {
            $push: {
              medicine_id: '$medicine._id',
              medicine_name: '$medicine.name',
              category: '$medicine.category',
              unit: '$medicine.unit',
              quantity: '$quantity',
              warning_threshold: '$medicine.warning_threshold',
              expiry_date: '$medicine.expiry_date',
              status: '$status',
              isExpiringSoon: '$isExpiringSoon',
              isExpired: '$isExpired',
              last_updated: '$last_updated',
            },
          },
        },
      },

      // Stage 8: Project để format output
      {
        $project: {
          _id: 0,
          branch_id: '$_id',
          branch_name: 1,
          branch_address: 1,
          report_date: new Date(),
          summary: {
            total_medicines: '$total_medicines',
            total_quantity: '$total_quantity',
            low_stock_count: '$low_stock_count',
            out_of_stock_count: '$out_of_stock_count',
            expiring_soon_count: '$expiring_soon_count',
            expired_count: '$expired_count',
          },
          items: 1,
        },
      },
    ])

    return report[0] || null
  }

  /**
   * Lấy báo cáo tồn kho toàn hệ thống (tất cả chi nhánh)
   * @param {String} branchId - ID chi nhánh (optional)
   * @returns {Array} Danh sách báo cáo theo chi nhánh
   */
  async getInventoryReportAll(branchId = null) {
    const matchStage = branchId ? { branch_id: branchId } : {}

    const reports = await Inventory.aggregate([
      // Stage 1: Lọc theo chi nhánh (nếu có)
      {
        $match: matchStage,
      },

      // Stage 2: Lookup thông tin thuốc
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },

      // Stage 3: Unwind medicine array
      {
        $unwind: '$medicine',
      },

      // Stage 4: Lookup thông tin chi nhánh
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },

      // Stage 5: Unwind branch array
      {
        $unwind: '$branch',
      },

      // Stage 6: Thêm các trường tính toán
      {
        $addFields: {
          status: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'out_of_stock',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', '$medicine.warning_threshold'] },
                  then: 'low_stock',
                  else: 'sufficient',
                },
              },
            },
          },
          isExpiringSoon: {
            $lte: [
              '$medicine.expiry_date',
              {
                $add: [new Date(), 3 * 30 * 24 * 60 * 60 * 1000],
              },
            ],
          },
          isExpired: {
            $lt: ['$medicine.expiry_date', new Date()],
          },
        },
      },

      // Stage 7: Group theo chi nhánh
      {
        $group: {
          _id: '$branch_id',
          branch_name: { $first: '$branch.name' },
          branch_address: { $first: '$branch.address' },
          total_medicines: { $sum: 1 },
          total_quantity: { $sum: '$quantity' },
          low_stock_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0],
            },
          },
          out_of_stock_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0],
            },
          },
          expiring_soon_count: {
            $sum: {
              $cond: ['$isExpiringSoon', 1, 0],
            },
          },
          expired_count: {
            $sum: {
              $cond: ['$isExpired', 1, 0],
            },
          },
        },
      },

      // Stage 8: Project để format output
      {
        $project: {
          _id: 0,
          branch_id: '$_id',
          branch_name: 1,
          branch_address: 1,
          summary: {
            total_medicines: '$total_medicines',
            total_quantity: '$total_quantity',
            low_stock_count: '$low_stock_count',
            out_of_stock_count: '$out_of_stock_count',
            expiring_soon_count: '$expiring_soon_count',
            expired_count: '$expired_count',
          },
        },
      },

      // Stage 9: Sort theo tên chi nhánh
      {
        $sort: { branch_name: 1 },
      },
    ])

    return reports
  }

  /**
   * Validate branch tồn tại
   * @param {String} branchId - ID chi nhánh
   * @returns {Boolean}
   */
  async validateBranch(branchId) {
    const branch = await Branch.findById(branchId)
    return !!branch
  }
}

export default new ReportsRepository()
