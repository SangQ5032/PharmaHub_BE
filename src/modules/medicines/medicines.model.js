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
    // Mô tả thuốc
    description: {
      type: String,
      trim: true,
    },
    // URL hình ảnh thuốc
    image_url: {
      type: String,
      trim: true,
    },
    // Đơn vị cơ sở (tham chiếu tới Unit)
    base_unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Đơn vị cơ sở là bắt buộc'],
      index: true,
    },
    // Danh sách các đơn vị (array of ObjectId tham chiếu tới Unit)
    units: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
      },
    ],
    // Tỷ lệ chuyển đổi riêng cho từng đơn vị của thuốc này (Map<unit_id, ratio>)
    // Ví dụ: { "unit_id_1": 100, "unit_id_2": 10 }
    // Nếu không có, sẽ dùng ratio_to_base từ Unit model
    unit_ratios: {
      type: Map,
      of: Number,
      default: {},
    },
    // Trạng thái hoạt động
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Nhà sản xuất
    manufacturer: {
      type: String,
      trim: true,
      index: true,
    },
    // Thông tin dược (thành phần, công dụng, chỉ định, chống chỉ định, liều dùng, cách dùng, tác dụng phụ, tương tác thuốc...)
    pharmaceutical_info: {
      // Thành phần hoạt chất
      active_ingredient: {
        type: String,
        trim: true,
      },
      // Công dụng
      indication: {
        type: String,
        trim: true,
      },
      // Chỉ định
      usage: {
        type: String,
        trim: true,
      },
      // Chống chỉ định
      contraindication: {
        type: String,
        trim: true,
      },
      // Liều dùng
      dosage: {
        type: String,
        trim: true,
      },
      // Cách dùng
      administration: {
        type: String,
        trim: true,
      },
      // Tác dụng phụ
      side_effects: {
        type: String,
        trim: true,
      },
      // Tương tác thuốc
      drug_interactions: {
        type: String,
        trim: true,
      },
      // Thông tin khác
      other_info: {
        type: String,
        trim: true,
      },
    },
    // Giá nhập mặc định (cho base unit) - dùng làm giá tham khảo khi nhập hàng
    default_import_price: {
      type: Number,
      min: [0, 'Giá nhập mặc định phải lớn hơn hoặc bằng 0'],
    },
    // Giá bán mặc định (cho base unit) - dùng làm giá tham khảo khi bán hàng
    default_retail_price: {
      type: Number,
      min: [0, 'Giá bán mặc định phải lớn hơn hoặc bằng 0'],
    },
    // Thời hạn sử dụng mặc định (tính bằng ngày) - dùng làm tham khảo
    default_expiry_duration_days: {
      type: Number,
      min: [1, 'Thời hạn sử dụng phải lớn hơn 0'],
    },
  },
  {
    timestamps: true,
    collection: 'medicines',
  }
)

// Index text cho phép tìm kiếm nhanh theo tên
MedicineSchema.index({ name: 'text' })

export const Medicine = mongoose.model('Medicine', MedicineSchema)
