// Script cập nhật status cho suppliers không có status
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Supplier } from '../src/modules/suppliers/suppliers.model.js'

dotenv.config()

async function updateSuppliersStatus() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Đã kết nối database')

    // Tìm suppliers không có status hoặc status null/undefined
    const suppliersToUpdate = await Supplier.find({
      $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }],
    })

    console.log(`\n📊 Tìm thấy ${suppliersToUpdate.length} suppliers cần cập nhật`)

    if (suppliersToUpdate.length === 0) {
      console.log('✅ Tất cả suppliers đã có status')
      process.exit(0)
    }

    // Cập nhật status thành 'active' (default)
    const result = await Supplier.updateMany(
      {
        $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }],
      },
      {
        $set: { status: 'active' },
      }
    )

    console.log(`\n✅ Đã cập nhật ${result.modifiedCount} suppliers với status = 'active'`)

    // Kiểm tra lại
    const activeSuppliers = await Supplier.find({ status: 'active' }).lean()
    console.log(`\n📊 Tổng số suppliers có status = 'active': ${activeSuppliers.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi:', error)
    process.exit(1)
  }
}

updateSuppliersStatus()
