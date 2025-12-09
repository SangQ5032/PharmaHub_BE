import mongoose from 'mongoose'

const SalesItemSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    batch_code: {
      type: String,
      required: true,
      trim: true,
    },
    // Số lượng người dùng nhập (theo đơn vị)
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    // Đơn vị tính (linh hoạt - hỗ trợ bất kỳ đơn vị nào từ package_structure)
    unit: {
      type: String,
      trim: true,
      default: 'tablet',
    },
    // Tổng số lượng tính theo base unit (viên)
    total_base_units: {
      type: Number,
      required: true,
      min: [0, 'Base units phải >= 0'],
    },
    // Đơn giá tính theo unit đã chọn
    unit_price: {
      type: Number,
      required: true,
      min: [0, 'Đơn giá phải lớn hơn hoặc bằng 0'],
    },
    // Thành tiền (quantity * unit_price)
    line_total: {
      type: Number,
      required: true,
      min: [0, 'Thành tiền phải lớn hơn hoặc bằng 0'],
    },
  },
  { _id: false }
)

const SalesInvoiceSchema = new mongoose.Schema(
  {
    invoice_code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customer_name: {
      type: String,
      trim: true,
    },
    customer_phone: {
      type: String,
      trim: true,
    },
    payment_method: {
      type: String,
      enum: ['cash', 'card', 'bank', 'e-wallet'],
      default: 'cash',
    },
    items: {
      type: [SalesItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0
        },
        message: 'Cần ít nhất 1 sản phẩm trong hóa đơn',
      },
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Tạm tính phải lớn hơn hoặc bằng 0'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Chiết khấu không hợp lệ'],
      description: 'Số tiền giảm giá (tự động từ total_spent hoặc manual)',
    },
    tax_rate: {
      type: Number,
      default: 0,
      min: [0, 'Thuế suất không hợp lệ'],
    },
    tax_amount: {
      type: Number,
      default: 0,
      min: [0, 'Tiền thuế không hợp lệ'],
    },
    total_amount: {
      type: Number,
      required: true,
      min: [0, 'Tổng tiền phải lớn hơn hoặc bằng 0'],
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
    exported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'invoices',
  }
)

SalesInvoiceSchema.index({ branch_id: 1, createdAt: -1 })
SalesInvoiceSchema.index({ employee_id: 1, createdAt: -1 })

const SalesInvoice = mongoose.model('SalesInvoice', SalesInvoiceSchema)

export default SalesInvoice
