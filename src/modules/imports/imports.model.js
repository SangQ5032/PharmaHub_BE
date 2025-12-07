import mongoose from 'mongoose'

const ImportItemSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Thuốc là bắt buộc'],
    },
    // Số lượng tính theo base unit (viên/tablet) - quantity luôn lưu ở đơn vị nhỏ nhất
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    // Số lượng tính theo base unit (alias của quantity để match với database schema)
    quantity_in_base_unit: {
      type: Number,
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    // Đơn vị nhập (lo, box, blister, tablet, ...) - chỉ để tham khảo, quantity đã được convert về base unit
    unit: {
      type: String,
      trim: true,
    },
    unit_price: {
      type: Number,
      required: [true, 'Đơn giá là bắt buộc'],
      min: [0, 'Đơn giá phải lớn hơn hoặc bằng 0'],
    },
    batch_number: {
      type: String,
      required: [true, 'Mã lô hàng là bắt buộc'],
      trim: true,
    },
    expiry_date: {
      type: Date,
      required: [true, 'Ngày hết hạn là bắt buộc'],
    },
    // Giá bán lẻ cho base unit
    retail_price_for_base_unit: {
      type: Number,
      default: 0,
    },
    // Giá bán lẻ theo từng đơn vị (linh hoạt)
    retail_price_per_unit: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
)

const ImportSchema = new mongoose.Schema(
  {
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
      index: true,
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp là bắt buộc'],
      index: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nhân viên thực hiện là bắt buộc'],
      index: true,
    },
    items: {
      type: [ImportItemSchema],
      required: [true, 'Danh sách thuốc nhập là bắt buộc'],
      validate: {
        validator: function (items) {
          return items && items.length > 0
        },
        message: 'Phải có ít nhất 1 thuốc trong phiếu nhập',
      },
    },
    total_cost: {
      type: Number,
      required: [true, 'Tổng chi phí là bắt buộc'],
      min: [0, 'Tổng chi phí phải lớn hơn hoặc bằng 0'],
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
    collection: 'import_records',
  }
)

// Index để tìm kiếm nhanh
ImportSchema.index({ createdAt: -1 })
ImportSchema.index({ branch_id: 1, createdAt: -1 })

// Pre-save hook để tính tổng chi phí tự động và đồng bộ quantity_in_base_unit
// Lưu ý: unit_price là giá cho đơn vị nhập ban đầu, không phải giá cho base unit
// Tổng chi phí = số lượng đơn vị nhập gốc (quantity_original) × giá đơn vị nhập (unit_price)
// quantity trong items đã được convert về base unit, nhưng để tính total_cost cần dùng quantity_original
ImportSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    // Đồng bộ quantity_in_base_unit với quantity cho mỗi item
    this.items.forEach((item) => {
      if (item.quantity !== undefined) {
        item.quantity_in_base_unit = item.quantity
      }
    })

    this.total_cost = this.items.reduce((total, item) => {
      // Sử dụng quantity_original nếu có (số lượng đơn vị nhập gốc), nếu không thì dùng quantity (backward compatibility)
      const quantityForCost = item.quantity_original || item.quantity
      return total + quantityForCost * item.unit_price
    }, 0)
  }
  next()
})

export const Import = mongoose.model('Import', ImportSchema)
