import { Inventory } from './inventory.model.js'
import Branch from '../branch/branch.model.js'
import { Medicine } from '../medicines/medicines.model.js'
import { Batch } from '../batches/batches.model.js'
import mongoose from 'mongoose'

class InventoryRepository {
  /**
   * Lấy tồn kho theo chi nhánh (kèm chi tiết lô thuốc)
   * @param {String} branchId - ID chi nhánh
   * @param {Object} filter - Điều kiện lọc
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getByBranch(branchId, filter = {}) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const medicineIdFilter = filter.medicine_id
      ? new mongoose.Types.ObjectId(filter.medicine_id)
      : null

    const inventory = await Inventory.aggregate([
      {
        $match: {
          branch_id: branchObjectId,
          ...(medicineIdFilter && { medicine_id: medicineIdFilter }),
        },
      },
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
          from: 'batches',
          let: { medicine_id: '$medicine_id', branch_id: '$branch_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$medicine_id', '$$medicine_id'] },
                    { $eq: ['$branch_id', '$$branch_id'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'suppliers',
                localField: 'supplier_id',
                foreignField: '_id',
                as: 'supplier',
              },
            },
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                batch_number: 1,
                expiry_date: 1,
                import_price: 1,
                quantity: 1,
                initial_quantity: 1,
                supplier_id: 1,
                'supplier.name': 1,
                status: 1,
                createdAt: 1,
              },
            },
            { $sort: { expiry_date: 1 } },
          ],
          as: 'batches',
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
          medicine_category: '$medicine.category_id',
          medicine_description: '$medicine.description',
          medicine_generic_name: '$medicine.generic_name',
          medicine_brand_name: '$medicine.brand_name',
          medicine_dosage_form: '$medicine.dosage_form',
          medicine_strength: '$medicine.strength',
          medicine_retail_price: '$medicine.retail_price',
          medicine_manufacturer: '$medicine.manufacturer',
          medicine_country_of_origin: '$medicine.country_of_origin',
          medicine_indications: '$medicine.indications',
          medicine_contraindications: '$medicine.contraindications',
          medicine_side_effects: '$medicine.side_effects',
          medicine_usage_instructions: '$medicine.usage_instructions',
          medicine_storage_conditions: '$medicine.storage_conditions',
          medicine_registration_number: '$medicine.registration_number',
          medicine_barcode: '$medicine.barcode',
          medicine_status: '$medicine.status',
          medicine_warning_threshold: '$medicine.alert_threshold',
          quantity: 1,
          batches: 1,
          last_updated: 1,
        },
      },
    ])

    return inventory
  }

  /**
   * Lấy tồn kho toàn hệ thống (kèm chi tiết lô thuốc)
   * @param {Object} filter - Điều kiện lọc
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getAll(filter = {}) {
    const branchIdFilter = filter.branch_id ? new mongoose.Types.ObjectId(filter.branch_id) : null
    const medicineIdFilter = filter.medicine_id
      ? new mongoose.Types.ObjectId(filter.medicine_id)
      : null

    const inventory = await Inventory.aggregate([
      {
        $match: {
          ...(branchIdFilter && { branch_id: branchIdFilter }),
          ...(medicineIdFilter && { medicine_id: medicineIdFilter }),
        },
      },
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
          from: 'batches',
          let: { medicine_id: '$medicine_id', branch_id: '$branch_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$medicine_id', '$$medicine_id'] },
                    { $eq: ['$branch_id', '$$branch_id'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'suppliers',
                localField: 'supplier_id',
                foreignField: '_id',
                as: 'supplier',
              },
            },
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                batch_number: 1,
                expiry_date: 1,
                import_price: 1,
                quantity: 1,
                initial_quantity: 1,
                supplier_id: 1,
                'supplier.name': 1,
                status: 1,
                createdAt: 1,
              },
            },
            { $sort: { expiry_date: 1 } },
          ],
          as: 'batches',
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
          medicine_category: '$medicine.category_id',
          medicine_description: '$medicine.description',
          medicine_generic_name: '$medicine.generic_name',
          medicine_brand_name: '$medicine.brand_name',
          medicine_dosage_form: '$medicine.dosage_form',
          medicine_strength: '$medicine.strength',
          medicine_retail_price: '$medicine.retail_price',
          medicine_manufacturer: '$medicine.manufacturer',
          medicine_country_of_origin: '$medicine.country_of_origin',
          medicine_indications: '$medicine.indications',
          medicine_contraindications: '$medicine.contraindications',
          medicine_side_effects: '$medicine.side_effects',
          medicine_usage_instructions: '$medicine.usage_instructions',
          medicine_storage_conditions: '$medicine.storage_conditions',
          medicine_registration_number: '$medicine.registration_number',
          medicine_barcode: '$medicine.barcode',
          medicine_status: '$medicine.status',
          medicine_warning_threshold: '$medicine.alert_threshold',
          quantity: 1,
          batches: 1,
          last_updated: 1,
        },
      },
    ])

    return inventory
  }

  /**
   * Lấy tồn kho với filter low stock (kèm chi tiết lô thuốc)
   * @param {String} branchId - ID chi nhánh (optional)
   * @returns {Promise<Array>} - Danh sách thuốc sắp hết
   */
  async getLowStock(branchId = null) {
    const branchObjectId = branchId ? new mongoose.Types.ObjectId(branchId) : null
    const matchStage = branchObjectId ? { branch_id: branchObjectId } : {}

    const inventory = await Inventory.aggregate([
      { $match: matchStage },
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
          from: 'batches',
          let: { medicine_id: '$medicine_id', branch_id: '$branch_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$medicine_id', '$$medicine_id'] },
                    { $eq: ['$branch_id', '$$branch_id'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'suppliers',
                localField: 'supplier_id',
                foreignField: '_id',
                as: 'supplier',
              },
            },
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                batch_number: 1,
                expiry_date: 1,
                import_price: 1,
                quantity: 1,
                initial_quantity: 1,
                supplier_id: 1,
                'supplier.name': 1,
                status: 1,
                createdAt: 1,
              },
            },
            { $sort: { expiry_date: 1 } },
          ],
          as: 'batches',
        },
      },
      {
        $addFields: {
          isLowStock: {
            $lte: ['$quantity', '$medicine.alert_threshold'],
          },
        },
      },
      { $match: { isLowStock: true } },
      {
        $project: {
          _id: 1,
          branch_id: '$branch._id',
          branch_name: '$branch.name',
          branch_address: '$branch.address',
          medicine_id: '$medicine._id',
          medicine_name: '$medicine.name',
          medicine_unit: '$medicine.unit',
          medicine_category: '$medicine.category_id',
          medicine_generic_name: '$medicine.generic_name',
          medicine_retail_price: '$medicine.retail_price',
          medicine_description: '$medicine.description',
          medicine_dosage_form: '$medicine.dosage_form',
          medicine_strength: '$medicine.strength',
          medicine_manufacturer: '$medicine.manufacturer',
          medicine_country_of_origin: '$medicine.country_of_origin',
          medicine_indications: '$medicine.indications',
          medicine_contraindications: '$medicine.contraindications',
          medicine_side_effects: '$medicine.side_effects',
          medicine_usage_instructions: '$medicine.usage_instructions',
          medicine_storage_conditions: '$medicine.storage_conditions',
          medicine_registration_number: '$medicine.registration_number',
          medicine_barcode: '$medicine.barcode',
          medicine_status: '$medicine.status',
          medicine_warning_threshold: '$medicine.alert_threshold',
          quantity: 1,
          batches: 1,
          last_updated: 1,
          status: { $cond: [{ $eq: ['$quantity', 0] }, 'out_of_stock', 'low_stock'] },
        },
      },
    ])

    return inventory
  }

  /**
   * Kiểm tra tồn tại của branch
   * @param {String} branchId - ID chi nhánh
   * @returns {Promise<Object>} - Branch object
   */
  async validateBranch(branchId) {
    const branch = await Branch.findById(branchId).lean()
    return branch
  }

  /**
   * Kiểm tra tồn tại của medicine
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Medicine object
   */
  async validateMedicine(medicineId) {
    const medicine = await Medicine.findById(medicineId).lean()
    return medicine
  }

  /**
   * Lấy tồn kho bằng inventory ID (kèm chi tiết lô thuốc)
   * @param {String} inventoryId - ID inventory
   * @returns {Promise<Array>} - Dữ liệu tồn kho
   */
  async getInventoryById(inventoryId) {
    const inventoryObjectId = new mongoose.Types.ObjectId(inventoryId)

    const inventory = await Inventory.aggregate([
      {
        $match: {
          _id: inventoryObjectId,
        },
      },
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
          from: 'batches',
          let: { medicine_id: '$medicine_id', branch_id: '$branch_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$medicine_id', '$$medicine_id'] },
                    { $eq: ['$branch_id', '$$branch_id'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'suppliers',
                localField: 'supplier_id',
                foreignField: '_id',
                as: 'supplier',
              },
            },
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                batch_number: 1,
                expiry_date: 1,
                import_price: 1,
                quantity: 1,
                initial_quantity: 1,
                supplier_id: 1,
                'supplier.name': 1,
                status: 1,
                createdAt: 1,
              },
            },
            { $sort: { expiry_date: 1 } },
          ],
          as: 'batches',
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
          medicine_category: '$medicine.category_id',
          medicine_description: '$medicine.description',
          medicine_generic_name: '$medicine.generic_name',
          medicine_brand_name: '$medicine.brand_name',
          medicine_dosage_form: '$medicine.dosage_form',
          medicine_strength: '$medicine.strength',
          medicine_retail_price: '$medicine.retail_price',
          medicine_manufacturer: '$medicine.manufacturer',
          medicine_country_of_origin: '$medicine.country_of_origin',
          medicine_indications: '$medicine.indications',
          medicine_contraindications: '$medicine.contraindications',
          medicine_side_effects: '$medicine.side_effects',
          medicine_usage_instructions: '$medicine.usage_instructions',
          medicine_storage_conditions: '$medicine.storage_conditions',
          medicine_registration_number: '$medicine.registration_number',
          medicine_barcode: '$medicine.barcode',
          medicine_status: '$medicine.status',
          medicine_warning_threshold: '$medicine.alert_threshold',
          quantity: 1,
          batches: 1,
          last_updated: 1,
        },
      },
    ])

    return inventory
  }
}

export default new InventoryRepository()
