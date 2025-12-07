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
    // Số lượng tính theo base unit (viên) - quantity luôn lưu ở đơn vị nhỏ nhất
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng không được âm'],
      default: 0,
    },
    // Số lượng tính theo base unit (alias của quantity để match với database schema)
    quantity_in_base_unit: {
      type: Number,
      min: [0, 'Số lượng không được âm'],
      default: 0,
    },
    // Mô tả tồn kho theo từng đơn vị (đây là computed value, chỉ dùng để lưu cache)
    // Linh hoạt - hỗ trợ bất kỳ đơn vị nào từ package_structure
    // Ví dụ: { box: 5, blister: 0, tablet: 0 } hoặc { box: 3, bottle: 2, tablet: 0 }
    quantities_by_unit: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

// Pre-save hook để đồng bộ quantity_in_base_unit với quantity
InventorySchema.pre('save', function (next) {
  // Đồng bộ quantity_in_base_unit với quantity
  if (this.quantity !== undefined) {
    this.quantity_in_base_unit = this.quantity
  }
  next()
})

// Method để cập nhật số lượng tồn kho (quantity luôn ở base unit)
InventorySchema.methods.updateQuantity = function (amount) {
  this.quantity = (this.quantity || 0) + amount
  this.quantity_in_base_unit = this.quantity // Đồng bộ
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
