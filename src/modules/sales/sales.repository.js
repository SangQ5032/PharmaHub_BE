// MODULE: SALES - REPOSITORY (Làm việc trực tiếp với MongoDB)
// ---------------------------------------------------------------------
// CHỨC NĂNG CHÍNH:
//  - validateBranch: kiểm tra chi nhánh tồn tại
//  - getMedicinesByIds: lấy danh sách thuốc theo _id phục vụ tính giá
//  - createWithInventoryUpdate: tạo hóa đơn + TRỪ TỒN KHO trong 1 transaction
//  - findById / findAll: truy vấn hóa đơn (có populate)
// LƯU Ý: cần MongoDB Replica Set để dùng session/transaction
// ---------------------------------------------------------------------

import mongoose from 'mongoose'
import { SalesInvoice } from './sales.model.js'
import { Inventory } from '../inventory/inventory.model.js'
import { Medicine } from '../medicines/medicines.model.js'
import Branch from '../branch/branch.model.js'

class SalesRepository {
  // Kiểm tra chi nhánh
  async validateBranch(branchId) {
    return Branch.findById(branchId).lean()
  }

  // Lấy thông tin các thuốc theo danh sách ID (lấy name, unit, price)
  async getMedicinesByIds(medicineIds) {
    return Medicine.find({ _id: { $in: medicineIds } })
      .select('name unit price')
      .lean()
  }

  // Tạo hóa đơn và trừ tồn kho trong CÙNG 1 TRANSACTION
  async createWithInventoryUpdate(saleData) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      // 1) Tạo hóa đơn
      const [created] = await SalesInvoice.create([saleData], { session })

      // 2) Trừ tồn kho theo từng mặt hàng
      for (const item of saleData.items) {
        const inv = await Inventory.findOne({
          branch_id: saleData.branch_id,
          medicine_id: item.medicine_id,
        }).session(session)

        if (!inv) {
          throw new Error(`Không tìm thấy tồn kho cho thuốc ${item.medicine_id}`)
        }
        if (inv.quantity < item.quantity) {
          throw new Error(`Tồn kho không đủ cho thuốc ${item.medicine_id}`)
        }

        inv.quantity -= item.quantity
        inv.last_updated = new Date()
        await inv.save({ session })
      }

      // 3) Commit transaction
      await session.commitTransaction()
      session.endSession()

      // 4) Trả về bản ghi đầy đủ (có populate)
      return await SalesInvoice.findById(created._id)
        .populate('branch_id', 'name address phone')
        .populate('employee_id', 'username fullName role')
        .populate('items.medicine_id', 'name unit price')
        .lean()
    } catch (err) {
      // Lỗi => rollback
      await session.abortTransaction()
      session.endSession()
      throw err
    }
  }

  // Lấy 1 hóa đơn theo id
  async findById(id) {
    return SalesInvoice.findById(id)
      .populate('branch_id', 'name address phone')
      .populate('employee_id', 'username fullName role')
      .populate('items.medicine_id', 'name unit price')
      .lean()
  }

  // Danh sách hóa đơn (lọc/phân trang/sắp xếp)
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options
    const skip = (page - 1) * limit

    const [rows, total] = await Promise.all([
      SalesInvoice.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('branch_id', 'name')
        .populate('employee_id', 'username fullName')
        .lean(),
      SalesInvoice.countDocuments(filter),
    ])

    return { rows, total, page, limit, pages: Math.ceil(total / limit) }
  }
}

export default new SalesRepository()
