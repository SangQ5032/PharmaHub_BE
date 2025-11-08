import mongoose from 'mongoose'

const SalesItemSchema = new mongoose.Schema(
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
      min: [0, 'Đơn giá phải >= 0'],
    },
    line_total: {
      type: Number,
      required: true,
      min: [0, 'Thành tiền không hợp lệ'],
    },
  },
  { _id: false }
)

const SalesInvoiceSchema = new mongoose.Schema(
  {
    invoice_no: {
      type: String,
      index: true,
      unique: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
      index: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nhân viên thực hiện là bắt buộc'],
      index: true,
    },
    customer_name: { type: String, trim: true },
    customer_phone: { type: String, trim: true },
    items: {
      type: [SalesItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0
        },
        message: 'Phải có ít nhất 1 thuốc trong hóa đơn',
      },
      required: true,
    },
    subtotal: { type: Number, required: true, min: [0, 'Tạm tính không hợp lệ'] },
    discount: { type: Number, default: 0, min: [0, 'Giảm giá không hợp lệ'] },
    tax_rate: { type: Number, default: 0, min: [0, 'Thuế suất không hợp lệ'] },
    tax_amount: { type: Number, required: true, min: [0, 'Thuế không hợp lệ'] },
    total_amount: { type: Number, required: true, min: [0, 'Tổng tiền không hợp lệ'] },
    payment_method: {
      type: String,
      enum: ['cash', 'card', 'bank', 'e-wallet'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'refunded'],
      default: 'completed',
      index: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true, collection: 'sales_invoices' }
)

SalesInvoiceSchema.pre('save', function (next) {
  if (!this.invoice_no) {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const ms = String(now.getTime()).slice(-6)
    this.invoice_no = `INV-${y}${m}${d}-${ms}`
  }
  next()
})

SalesInvoiceSchema.index({ createdAt: -1 })
SalesInvoiceSchema.index({ branch_id: 1, createdAt: -1 })

const SalesInvoice = mongoose.models.SalesInvoice || mongoose.model('SalesInvoice', SalesInvoiceSchema)
export { SalesInvoice }
export default SalesInvoice
