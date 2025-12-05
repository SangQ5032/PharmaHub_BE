import mongoose from 'mongoose'

const InventorySchema = new mongoose.Schema(
  {
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
      index: true,
    },
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Thuốc là bắt buộc'],
      index: true,
    },
    // Số lượng tính theo base unit (viên)
    quantity_in_base_unit: {
      type: Number,
      required: [true, 'Số lượng base unit là bắt buộc'],
      min: [0, 'Số lượng không được âm'],
      default: 0,
    },
    // Legacy field - for backward compatibility
    quantity: {
      type: Number,
      default: null,
    },
    // Mô tả tồn kho theo từng đơn vị (đây là computed value, chỉ dùng để lưu cache)
    quantities_by_unit: {
      box: {
        type: Number,
        default: 0,
      },
      blister: {
        type: Number,
        default: 0,
      },
      tablet: {
        type: Number,
        default: 0,
      },
      _id: false,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'inventory',
  }
)

// Compound index để đảm bảo mỗi thuốc chỉ có 1 record trong 1 chi nhánh
InventorySchema.index({ branch_id: 1, medicine_id: 1 }, { unique: true })

// Method để cập nhật số lượng tồn kho
InventorySchema.methods.updateQuantity = function (amount) {
  this.quantity += amount
  this.last_updated = new Date()
  return this.save()
}

// Static method để tìm hoặc tạo mới inventory
InventorySchema.statics.findOrCreate = async function (branchId, medicineId) {
  let inventory = await this.findOne({
    branch_id: branchId,
    medicine_id: medicineId,
  })

  if (!inventory) {
    inventory = await this.create({
      branch_id: branchId,
      medicine_id: medicineId,
      quantity: 0,
    })
  }

  return inventory
}

export const Inventory = mongoose.model('Inventory', InventorySchema)
