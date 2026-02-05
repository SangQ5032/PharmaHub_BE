import { Inventory } from './inventory.model.js'
import Branch from '../branch/branch.model.js'
import { Medicine } from '../medicines/medicines.model.js'

class CrossBranchRepository {
  /**
   * Lấy tồn kho tất cả chi nhánh
   * @param {Object} filter - Điều kiện lọc (medicine_id, branch_id)
   * @param {String} sortBy - Sắp xếp (asc/desc)
   * @returns {Promise<Array>} - Danh sách tồn kho từ tất cả chi nhánh
   */
  async getAllBranchesInventory(filter = {}, sortBy = 'desc') {
    const matchStage = {}

    if (filter.medicine_id) {
      matchStage.medicine_id = filter.medicine_id
    }

    if (filter.branch_id) {
      matchStage.branch_id = filter.branch_id
    }

    const sortOrder = sortBy === 'asc' ? 1 : -1

    const inventory = await Inventory.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $sort: {
          quantity: sortOrder,
        },
      },
      {
        $project: {
          _id: 1,
          branch_id: '$branch._id',
          branch_name: '$branch.name',
          branch_address: '$branch.address',
          branch_phone: '$branch.phone',
          medicine_id: '$medicine._id',
          medicine_name: '$medicine.name',
          medicine_unit: '$medicine.unit',
          medicine_category: '$medicine.category',
          quantity: 1,
          warning_threshold: '$medicine.warning_threshold',
          last_updated: 1,
        },
      },
    ])

    return inventory
  }

  /**
   * So sánh tồn kho của 1 loại thuốc giữa các chi nhánh
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Thông tin thuốc và tồn kho từ các chi nhánh
   */
  async compareMedicineAcrossBranches(medicineId) {
    const result = await Inventory.aggregate([
      { $match: { medicine_id: medicineId } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $sort: {
          quantity: -1,
        },
      },
      {
        $group: {
          _id: '$medicine._id',
          medicine_name: { $first: '$medicine.name' },
          medicine_unit: { $first: '$medicine.unit' },
          medicine_category: { $first: '$medicine.category' },
          warning_threshold: { $first: '$medicine.warning_threshold' },
          branches: {
            $push: {
              branch_id: '$branch._id',
              branch_name: '$branch.name',
              branch_address: '$branch.address',
              quantity: '$quantity',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          medicine_id: '$_id',
          medicine_name: 1,
          medicine_unit: 1,
          medicine_category: 1,
          warning_threshold: 1,
          branches: 1,
        },
      },
    ])

    return result.length > 0 ? result[0] : null
  }

  /**
   * Tìm chi nhánh có hàng sẵn (cho bán hàng & điều phối)
   * @param {String} medicineId - ID thuốc
   * @param {Number} quantity - Số lượng cần
   * @returns {Promise<Object>} - Thông tin thuốc và danh sách chi nhánh có hàng
   */
  async findAvailableBranches(medicineId, quantity) {
    const result = await Inventory.aggregate([
      { $match: { medicine_id: medicineId } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $addFields: {
          can_fulfill: { $gte: ['$quantity', quantity] },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
      {
        $group: {
          _id: '$medicine._id',
          medicine_name: { $first: '$medicine.name' },
          medicine_unit: { $first: '$medicine.unit' },
          medicine_category: { $first: '$medicine.category' },
          warning_threshold: { $first: '$medicine.warning_threshold' },
          available_branches: {
            $push: {
              branch_id: '$branch._id',
              branch_name: '$branch.name',
              branch_address: '$branch.address',
              available_quantity: '$quantity',
              can_fulfill: '$can_fulfill',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          medicine_id: '$_id',
          medicine_name: 1,
          medicine_unit: 1,
          medicine_category: 1,
          warning_threshold: 1,
          available_branches: 1,
        },
      },
    ])

    return result.length > 0 ? result[0] : null
  }

  /**
   * Validate medicine tồn tại
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Thông tin thuốc
   */
  async validateMedicine(medicineId) {
    return await Medicine.findById(medicineId).lean()
  }

  /**
   * Validate branch tồn tại
   * @param {String} branchId - ID chi nhánh
   * @returns {Promise<Object>} - Thông tin chi nhánh
   */
  async validateBranch(branchId) {
    return await Branch.findById(branchId).lean()
  }
}

export default new CrossBranchRepository()
