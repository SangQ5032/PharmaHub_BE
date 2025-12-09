// Script để tạo các đơn vị (units) cơ bản vào database
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Unit } from '../src/modules/units/units.model.js'

dotenv.config()

// Kết nối database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Đã kết nối MongoDB')
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error)
    process.exit(1)
  }
}

// Các đơn vị cơ bản cần tạo
// Lưu ý: ratio_to_base = 1 nghĩa là đơn vị đó có thể là đơn vị cơ sở
// Mỗi loại thuốc có thể có đơn vị cơ sở khác nhau (Viên, Gói, Chai, Ống, v.v.)
const defaultUnits = [
  // === Đơn vị cho thuốc dạng viên ===
  {
    name: 'Viên',
    short_name: 'viên',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc viên
  },
  {
    name: 'Vỉ',
    short_name: 'vỉ',
    ratio_to_base: 10, // 1 vỉ = 10 viên (khi đơn vị cơ sở là Viên)
  },
  {
    name: 'Hộp',
    short_name: 'hộp',
    ratio_to_base: 100, // 1 hộp = 100 viên (khi đơn vị cơ sở là Viên)
  },
  {
    name: 'Lọ',
    short_name: 'lọ',
    ratio_to_base: 50, // 1 lọ = 50 viên (khi đơn vị cơ sở là Viên)
  },

  // === Đơn vị cho thuốc dạng gói ===
  {
    name: 'Gói',
    short_name: 'gói',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng gói
  },
  {
    name: 'Thùng',
    short_name: 'thùng',
    ratio_to_base: 20, // 1 thùng = 20 gói (khi đơn vị cơ sở là Gói)
  },

  // === Đơn vị cho thuốc dạng lỏng ===
  {
    name: 'Chai',
    short_name: 'chai',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng lỏng (chai)
  },
  {
    name: 'Lọ',
    short_name: 'lọ',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng lỏng (lọ) - có thể dùng chung với lọ viên
  },
  {
    name: 'Lít',
    short_name: 'lít',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng lỏng (theo thể tích)
  },
  {
    name: 'Ml',
    short_name: 'ml',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng lỏng (theo thể tích nhỏ)
  },

  // === Đơn vị cho thuốc tiêm ===
  {
    name: 'Ống',
    short_name: 'ống',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc tiêm
  },
  {
    name: 'Hộp ống',
    short_name: 'hộp ống',
    ratio_to_base: 10, // 1 hộp = 10 ống (khi đơn vị cơ sở là Ống)
  },

  // === Đơn vị cho thuốc mỡ, kem ===
  {
    name: 'Tuýp',
    short_name: 'tuýp',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc mỡ, kem
  },
  {
    name: 'Hộp tuýp',
    short_name: 'hộp tuýp',
    ratio_to_base: 12, // 1 hộp = 12 tuýp (khi đơn vị cơ sở là Tuýp)
  },

  // === Đơn vị khác ===
  {
    name: 'Viên nang',
    short_name: 'viên nang',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng viên nang
  },
  {
    name: 'Viên nén',
    short_name: 'viên nén',
    ratio_to_base: 1, // Đơn vị cơ sở cho thuốc dạng viên nén
  },
]

// Hàm seed units
const seedUnits = async () => {
  try {
    console.log('🔄 Đang tạo các đơn vị cơ bản...')

    let created = 0
    let skipped = 0

    for (const unitData of defaultUnits) {
      // Kiểm tra xem unit đã tồn tại chưa
      const existing = await Unit.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${unitData.name}$`, 'i') } },
          { short_name: { $regex: new RegExp(`^${unitData.short_name}$`, 'i') } },
        ],
      })

      if (existing) {
        console.log(`⏭️  Đã tồn tại: ${unitData.name} (${unitData.short_name})`)
        skipped++
      } else {
        await Unit.create(unitData)
        console.log(
          `✅ Đã tạo: ${unitData.name} (${unitData.short_name}) - Tỷ lệ: ${unitData.ratio_to_base}`
        )
        created++
      }
    }

    console.log('\n📊 Tổng kết:')
    console.log(`   ✅ Đã tạo mới: ${created} đơn vị`)
    console.log(`   ⏭️  Đã bỏ qua: ${skipped} đơn vị (đã tồn tại)`)
    console.log(`   📦 Tổng cộng: ${defaultUnits.length} đơn vị`)
  } catch (error) {
    console.error('❌ Lỗi khi tạo đơn vị:', error)
    throw error
  }
}

// Chạy script
const run = async () => {
  try {
    await connectDB()
    await seedUnits()
    console.log('\n✅ Hoàn tất! Bạn có thể import file Excel bây giờ.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi:', error)
    process.exit(1)
  }
}

run()
