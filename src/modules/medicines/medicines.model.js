// MODULE: MEDICINES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của thuốc (medicine) trong MongoDB
// - Chỉ mô tả dữ liệu và các chỉ mục/virtual cần thiết
// - Không chứa logic nghiệp vụ hay gọi DB trực tiếp ở đây
import mongoose from 'mongoose'

const MedicineSchema = new mongoose.Schema(
  {
    // Tên thuốc - dùng để hiển thị, tìm kiếm
    name: {
      type: String,
      required: [true, 'Tên thuốc là bắt buộc'],
      trim: true,
      index: true,
    },
    // Tên chung/hoạt chất chính
    generic_name: {
      type: String,
      trim: true,
    },
    // Tên thương mại/tên nhãn hiệu
    brand_name: {
      type: String,
      trim: true,
    },
    // Dạng bào chế (viên, hộp, chai, ...)
    dosage_form: {
      type: String,
      trim: true,
    },
    // Hàm lượng hoạt chất
    strength: {
      type: String,
      trim: true,
    },
    // Đơn vị cơ sở (đơn vị nhỏ nhất, ví dụ: tablet/viên)
    base_unit: {
      type: String,
      default: 'tablet',
      trim: true,
    },
    // Quy cách đóng gói (legacy - keep for backward compatibility)
    packaging: {
      type: String,
      trim: true,
    },
    // Cấu trúc đơn vị: mô tả mối quan hệ giữa các đơn vị
    // Ví dụ: { box: { contains: 10, child: "blister" }, blister: { contains: 10, child: "tablet" }, tablet: { contains: 1, child: null } }
    package_structure: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Thông tin giá theo từng đơn vị
    prices: {
      // Giá của base unit (viên)
      base_unit_price: {
        type: Number,
        default: 0,
        min: [0, 'Giá base unit phải >= 0'],
      },
      // Giá theo từng đơn vị (linh hoạt - hỗ trợ bất kỳ đơn vị nào từ package_structure)
      // Ví dụ: { box: 100000, blister: 10000, tablet: 1000 } hoặc { box: 150000, bottle: 30000, tablet: 2000 }
      price_per_unit: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      _id: false,
    },
    // Tham chiếu tới danh mục/loại thuốc
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    // Có yêu cầu đơn kê đơn không?
    prescription_required: {
      type: Boolean,
      default: false,
    },
    // Thuốc được kiểm soát/hạn chế không?
    is_controlled: {
      type: Boolean,
      default: false,
    },
    // Hãng sản xuất
    manufacturer: {
      type: String,
      trim: true,
    },
    // Nước sản xuất
    country_of_origin: {
      type: String,
      trim: true,
    },
    // Chỉ định sử dụng
    indications: {
      type: String,
      trim: true,
    },
    // Chống chỉ định
    contraindications: {
      type: String,
      trim: true,
    },
    // Tác dụng phụ
    side_effects: {
      type: String,
      trim: true,
    },
    // Hướng dẫn sử dụng
    usage_instructions: {
      type: String,
      trim: true,
    },
    // Điều kiện bảo quản
    storage_conditions: {
      type: String,
      trim: true,
    },
    // Số đăng ký
    registration_number: {
      type: String,
      trim: true,
      index: true,
    },
    // Mã vạch
    barcode: {
      type: String,
      trim: true,
      index: true,
    },
    // Ngưỡng cảnh báo tồn kho
    alert_threshold: {
      type: Number,
      default: 50,
      min: [0, 'Ngưỡng cảnh báo phải lớn hơn hoặc bằng 0'],
    },
    // Trạng thái (active, inactive, ...)
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'medicines',
  }
)

// Index text cho phép tìm kiếm nhanh theo tên/generic name/brand name
MedicineSchema.index({ name: 'text', generic_name: 'text', brand_name: 'text' })

export const Medicine = mongoose.model('Medicine', MedicineSchema)
