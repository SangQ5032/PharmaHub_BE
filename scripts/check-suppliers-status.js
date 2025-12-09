// Script kiểm tra status của suppliers trong database
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Supplier } from '../src/modules/suppliers/suppliers.model.js'

dotenv.config()

async function checkSuppliers() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Đã kết nối database')

    // Lấy tất cả suppliers
    const suppliers = await Supplier.find({}).lean()
    console.log(`\n📊 Tổng số suppliers: ${suppliers.length}`)

    if (suppliers.length === 0) {
      console.log('⚠️  Không có supplier nào trong database')
      process.exit(0)
    }

    console.log('\n📋 Chi tiết từng supplier:')
    suppliers.forEach((supplier, index) => {
      console.log(`\n${index + 1}. Supplier ID: ${supplier._id}`)
      console.log(`   Tên: ${supplier.name}`)
      console.log(`   Status: ${supplier.status || '(null/undefined)'}`)
      console.log(`   Có trường status: ${'status' in supplier}`)
      console.log(`   Status type: ${typeof supplier.status}`)
    })

    // Kiểm tra suppliers có status = 'active'
    const activeSuppliers = await Supplier.find({ status: 'active' }).lean()
    console.log(`\n✅ Suppliers có status = 'active': ${activeSuppliers.length}`)

    // Kiểm tra suppliers không có status
    const suppliersWithoutStatus = await Supplier.find({
      $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }],
    }).lean()
    console.log(`⚠️  Suppliers không có status: ${suppliersWithoutStatus.length}`)

    // Kiểm tra với filter status=active
    const filterTest = { status: 'active' }
    const filteredSuppliers = await Supplier.find(filterTest).lean()
    console.log(
      `\n🔍 Kết quả query với filter { status: 'active' }: ${filteredSuppliers.length} suppliers`
    )

    // Nếu có suppliers không có status, đề xuất cập nhật
    if (suppliersWithoutStatus.length > 0) {
      console.log('\n💡 Đề xuất: Cập nhật suppliers không có status thành "active"')
      console.log('   Chạy script: node scripts/update-suppliers-status.js')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi:', error)
    process.exit(1)
  }
}

checkSuppliers()
