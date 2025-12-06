import inventoryRepository from './inventory.repository.js'
import { AppError } from '../../utils/AppError.js'
import { convertFromBaseUnit } from '../../utils/unitConversion.js'

class InventoryService {
  /**
   * Lấy tồn kho theo chi nhánh (kèm chi tiết lô thuốc)
   * @param {String} branchId - ID chi nhánh
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getInventoryByBranch(branchId, query = {}) {
    // Validate branchId
    if (!branchId) {
      throw new AppError(400, 'ID chi nhánh là bắt buộc')
    }

    // Kiểm tra branch tồn tại
    const branch = await inventoryRepository.validateBranch(branchId)
    if (!branch) {
      throw new AppError(404, 'Chi nhánh không tồn tại')
    }

    const { medicine_id, low_stock } = query

    // Nếu yêu cầu low_stock
    if (low_stock === 'true') {
      const inventory = await inventoryRepository.getLowStock(branchId)
      return this._transformInventoryData(inventory)
    }

    // Build filter
    const filter = {}
    if (medicine_id) {
      // Validate medicine tồn tại
      const medicine = await inventoryRepository.validateMedicine(medicine_id)
      if (!medicine) {
        throw new AppError(404, 'Thuốc không tồn tại')
      }
      filter.medicine_id = medicine_id
    }

    const inventory = await inventoryRepository.getByBranch(branchId, filter)
    return this._transformInventoryData(inventory)
  }

  /**
   * Lấy tồn kho toàn hệ thống (admin only) - kèm chi tiết lô thuốc
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getAllInventory(query = {}) {
    const { branch_id, medicine_id, low_stock } = query

    // Nếu yêu cầu low_stock
    if (low_stock === 'true') {
      const inventory = await inventoryRepository.getLowStock(branch_id || null)
      return this._transformInventoryData(inventory)
    }

    // Build filter
    const filter = {}

    if (branch_id) {
      // Validate branch tồn tại
      const branch = await inventoryRepository.validateBranch(branch_id)
      if (!branch) {
        throw new AppError(404, 'Chi nhánh không tồn tại')
      }
      filter.branch_id = branch_id
    }

    if (medicine_id) {
      // Validate medicine tồn tại
      const medicine = await inventoryRepository.validateMedicine(medicine_id)
      if (!medicine) {
        throw new AppError(404, 'Thuốc không tồn tại')
      }
      filter.medicine_id = medicine_id
    }

    const inventory = await inventoryRepository.getAll(filter)
    return this._transformInventoryData(inventory)
  }

  /**
   * Transform dữ liệu tồn kho từ aggregate
   * @param {Array} inventory - Dữ liệu tồn kho từ repository
   * @returns {Array} - Dữ liệu đã transform
   */
  _transformInventoryData(inventory) {
    return inventory.map((item) => {
      // Calculate quantities per unit based on base unit (quantity luôn ở base unit)
      const baseQuantity = item.quantity || 0
      let quantities_by_unit = {
        box: 0,
        blister: 0,
        tablet: baseQuantity,
      }

      // Convert base units to other units if medicine has package_structure
      if (item.medicine_package_structure) {
        try {
          const convertBox = convertFromBaseUnit(
            { package_structure: item.medicine_package_structure, base_unit: 'tablet' },
            baseQuantity,
            'box'
          )
          quantities_by_unit.box = convertBox.quantity

          const convertBlister = convertFromBaseUnit(
            { package_structure: item.medicine_package_structure, base_unit: 'tablet' },
            baseQuantity,
            'blister'
          )
          quantities_by_unit.blister = convertBlister.quantity
        } catch (e) {
          // If conversion fails, keep defaults
          quantities_by_unit.box = 0
          quantities_by_unit.blister = 0
        }
      }

      const status =
        baseQuantity === 0
          ? 'out_of_stock'
          : baseQuantity <= item.medicine_warning_threshold
            ? 'low_stock'
            : 'sufficient'

      // Tính tổng giá trị tồn kho
      const totalValue = item.batches.reduce((sum, batch) => {
        return sum + ((batch.quantity || 0) * batch.import_price || 0)
      }, 0)

      return {
        _id: item._id,
        branch: {
          _id: item.branch_id,
          name: item.branch_name,
          address: item.branch_address,
          phone: item.branch_phone,
        },
        medicine: {
          _id: item.medicine_id,
          name: item.medicine_name,
          generic_name: item.medicine_generic_name,
          brand_name: item.medicine_brand_name,
          unit: item.medicine_unit,
          base_unit: item.medicine_base_unit || 'tablet',
          package_structure: item.medicine_package_structure,
          prices: item.medicine_prices,
          category: item.medicine_category,
          description: item.medicine_description,
          dosage_form: item.medicine_dosage_form,
          strength: item.medicine_strength,
          manufacturer: item.medicine_manufacturer,
          country_of_origin: item.medicine_country_of_origin,
          indications: item.medicine_indications,
          contraindications: item.medicine_contraindications,
          side_effects: item.medicine_side_effects,
          usage_instructions: item.medicine_usage_instructions,
          storage_conditions: item.medicine_storage_conditions,
          registration_number: item.medicine_registration_number,
          barcode: item.medicine_barcode,
          status: item.medicine_status,
          warning_threshold: item.medicine_warning_threshold,
        },
        // Total quantity in base unit (tablet)
        total_quantity_in_base_unit: item.quantity || 0, // quantity luôn ở base unit
        // Quantities broken down by unit
        quantities_by_unit,
        warning_threshold: item.medicine_warning_threshold,
        status,
        batches: item.batches.map((batch) => ({
          _id: batch._id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          import_price: batch.import_price,
          quantity: batch.quantity || 0, // quantity luôn ở base unit
          initial_quantity: batch.initial_quantity || 0,
          supplier: {
            _id: batch.supplier_id,
            name: batch.supplier?.name || 'N/A',
          },
          batch_value: (batch.quantity || 0) * batch.import_price,
          status: batch.status,
          imported_at: batch.createdAt,
        })),
        total_value: totalValue,
        last_updated: item.last_updated,
      }
    })
  }

  /**
   * Lấy tồn kho của 1 loại thuốc tại chi nhánh cụ thể
   * @param {String} branchId - ID chi nhánh
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Chi tiết tồn kho
   */
  async getInventoryByBranchAndMedicine(branchId, medicineId) {
    if (!branchId || !medicineId) {
      throw new AppError(400, 'ID chi nhánh và ID thuốc là bắt buộc')
    }

    // Validate branch tồn tại
    const branch = await inventoryRepository.validateBranch(branchId)
    if (!branch) {
      throw new AppError(404, 'Chi nhánh không tồn tại')
    }

    // Validate medicine tồn tại
    const medicine = await inventoryRepository.validateMedicine(medicineId)
    if (!medicine) {
      throw new AppError(404, 'Thuốc không tồn tại')
    }

    const filter = {
      medicine_id: medicineId,
    }

    const inventory = await inventoryRepository.getByBranch(branchId, filter)
    const transformed = this._transformInventoryData(inventory)

    if (transformed.length === 0) {
      throw new AppError(404, 'Không tìm thấy tồn kho cho thuốc này tại chi nhánh')
    }

    return transformed[0]
  }

  /**
   * Lấy danh sách batch của thuốc tại chi nhánh (dành cho chọn batch khi tạo hóa đơn)
   * @param {String} branchId - ID chi nhánh
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Array>} - Danh sách batch
   */
  async getBatchesForMedicine(branchId, medicineId) {
    if (!branchId || !medicineId) {
      throw new AppError(400, 'ID chi nhánh và ID thuốc là bắt buộc')
    }

    // Validate branch tồn tại
    const branch = await inventoryRepository.validateBranch(branchId)
    if (!branch) {
      throw new AppError(404, 'Chi nhánh không tồn tại')
    }

    // Validate medicine tồn tại
    const medicine = await inventoryRepository.validateMedicine(medicineId)
    if (!medicine) {
      throw new AppError(404, 'Thuốc không tồn tại')
    }

    const batches = await inventoryRepository.getBatchesByBranchAndMedicine(branchId, medicineId)

    return batches.map((batch) => ({
      _id: batch._id,
      batch_number: batch.batch_number,
      expiry_date: batch.expiry_date,
      quantity: batch.quantity,
      import_price: batch.import_price,
      supplier_id: batch.supplier_id,
      status: batch.status,
    }))
  }

  /**
   * Lấy chi tiết tồn kho bằng inventory ID
   * @param {String} inventoryId - ID inventory record
   * @returns {Promise<Object>} - Chi tiết tồn kho
   */
  async getInventoryById(inventoryId) {
    if (!inventoryId) {
      throw new AppError(400, 'ID tồn kho là bắt buộc')
    }

    const inventory = await inventoryRepository.getInventoryById(inventoryId)

    if (!inventory || inventory.length === 0) {
      throw new AppError(404, 'Không tìm thấy tồn kho')
    }

    const transformed = this._transformInventoryData(inventory)
    return transformed[0]
  }
}

export default new InventoryService()
