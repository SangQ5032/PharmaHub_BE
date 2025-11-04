import mongoose from 'mongoose'

const ImportItemSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Thuốc là bắt buộc'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    unit_price: {
      type: Number,
      required: [true, 'Đơn giá là bắt buộc'],
      min: [0, 'Đơn giá phải lớn hơn hoặc bằng 0'],
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

// Pre-save hook để tính tổng chi phí tự động
ImportSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.total_cost = this.items.reduce((total, item) => {
      return total + item.quantity * item.unit_price
    }, 0)
  }
  next()
})

export const Import = mongoose.model('Import', ImportSchema)

