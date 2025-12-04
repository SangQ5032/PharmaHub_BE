import SalesInvoice from './sales.model.js'
import { Inventory } from '../inventory/inventory.model.js'
import { Batch } from '../batches/batches.model.js'
import { Medicine } from '../medicines/medicines.model.js'
import Customer from '../customers/customers.model.js'
import { AppError } from '../../utils/AppError.js'

class SalesRepository {
  async findMedicinesByIds(ids = []) {
    return Medicine.find({ _id: { $in: ids } }).lean()
  }

  async findBatchesByIds(ids = []) {
    return Batch.find({ _id: { $in: ids } }).lean()
  }

  async getInventoryByMedicineIds(branchId, medicineIds = []) {
    return Inventory.find({
      branch_id: branchId,
      medicine_id: { $in: medicineIds },
    })
      .select('medicine_id quantity')
      .lean()
  }

  async decreaseInventory(items = [], session) {
    for (const item of items) {
      const result = await Batch.updateOne(
        {
          _id: item.batch_id,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: { quantity: -item.quantity },
        },
        { session }
      )

      if (!result.matchedCount) {
        throw new AppError(
          400,
          'Tồn kho lô hàng đã thay đổi. Không thể trừ số lượng thuốc như yêu cầu, vui lòng thử lại.'
        )
      }
    }
  }

  async createInvoice(invoiceData, session) {
    const [invoice] = await SalesInvoice.create([invoiceData], { session })
    return invoice
  }

  async findInvoiceById(id) {
    return SalesInvoice.findById(id)
      .populate('branch_id', 'name address phone')
      .populate('employee_id', 'name username')
      .populate('customer_id', 'name phone address total_spent')
      .populate('items.medicine_id', 'name unit price')
      .populate('items.batch_id', 'batch_number expiry_date')
      .lean()
  }

  async existsInvoiceCode(code) {
    return SalesInvoice.exists({ invoice_code: code })
  }

  async findCustomerById(id) {
    return Customer.findById(id)
  }

  async findCustomerByPhone(phone) {
    return Customer.findOne({ phone })
  }

  async createCustomer(data, session) {
    const [customer] = await Customer.create([data], { session })
    return customer
  }

  async increaseCustomerTotalSpent(customerId, amount, session) {
    return Customer.findByIdAndUpdate(
      customerId,
      { $inc: { total_spent: amount } },
      { new: true, session }
    )
  }

  // Lấy danh sách hoá đơn với filter và pagination
  async findInvoices(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { created_at: -1 } } = options

    return SalesInvoice.find(filter)
      .populate('branch_id', 'name address phone')
      .populate('employee_id', 'name username')
      .populate('customer_id', 'name phone address total_spent')
      .populate('items.medicine_id', 'name unit price category')
      .populate('items.batch_id', 'batch_number expiry_date')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  // Đếm tổng số hoá đơn theo filter
  async countInvoices(filter = {}) {
    return SalesInvoice.countDocuments(filter)
  }

  // Tìm kiếm thuốc theo barcode và lấy thông tin batch + tồn kho
  async findMedicineByBarcode(barcode, branchId) {
    // Tìm thuốc theo barcode
    const medicine = await Medicine.findOne({ barcode: barcode })
      .populate('category_id', 'name description')
      .lean()

    if (!medicine) {
      return null
    }

    // Lấy danh sách batch chứa thuốc này và còn tồn kho
    const batches = await Batch.find({
      medicine_id: medicine._id,
      quantity: { $gt: 0 }, // Chỉ lấy batch còn tồn kho
    })
      .select('batch_number expiry_date quantity unit_price import_date')
      .sort({ expiry_date: 1 }) // Sắp xếp theo hạn sử dụng gần nhất
      .lean()

    // Lấy tồn kho tổng hợp từ inventory
    const inventory = await Inventory.findOne({
      branch_id: branchId,
      medicine_id: medicine._id,
    })
      .select('quantity')
      .lean()

    return {
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        generic_name: medicine.generic_name,
        brand_name: medicine.brand_name,
        barcode: medicine.barcode,
        dosage_form: medicine.dosage_form,
        strength: medicine.strength,
        unit: medicine.unit,
        category_id: medicine.category_id,
        retail_price: medicine.retail_price,
        manufacturer: medicine.manufacturer,
      },
      batches: batches.map((batch) => ({
        _id: batch._id,
        batch_number: batch.batch_number,
        expiry_date: batch.expiry_date,
        quantity: batch.quantity,
        unit_price: batch.unit_price,
        import_date: batch.import_date,
      })),
      availableQuantity: inventory?.quantity || 0,
    }
  }
}

export default new SalesRepository()
