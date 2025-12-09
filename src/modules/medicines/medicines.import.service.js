// MODULE: MEDICINES - IMPORT SERVICE
// Mục đích: Xử lý import thuốc từ file Excel
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import medicinesRepo from './medicines.repository.js'
import { AppError } from '../../utils/AppError.js'
import mongoose from 'mongoose'
import { Unit } from '../units/units.model.js'

/**
 * Đọc file Excel và trả về dữ liệu
 * @param {String} filePath - Đường dẫn đến file Excel
 * @returns {Array} - Mảng các object chứa dữ liệu từ Excel
 */
const readExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0] // Lấy sheet đầu tiên
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    return data
  } catch (error) {
    throw new AppError(400, `Lỗi đọc file Excel: ${error.message}`)
  }
}

/**
 * Tạo hoặc lấy đơn vị từ database
 * Nếu đơn vị chưa tồn tại, tự động tạo mới
 * @param {String} unitName - Tên đơn vị
 * @param {Number} ratioToBase - Tỷ lệ chuyển đổi so với đơn vị cơ sở (mặc định: 1)
 * @returns {Object} - Unit document
 */
const getOrCreateUnit = async (unitName, ratioToBase = 1) => {
  if (!unitName || typeof unitName !== 'string') {
    return null
  }

  // Loại bỏ khoảng trắng thừa và chuẩn hóa
  const normalizedName = unitName.replace(/\s+/g, ' ').trim()

  if (!normalizedName) {
    return null
  }

  // Tìm đơn vị - tìm kiếm linh hoạt (không phân biệt hoa thường)
  let unit = await Unit.findOne({
    $or: [
      {
        name: {
          $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        },
      },
      {
        short_name: {
          $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        },
      },
    ],
  })

  // Nếu không tìm thấy, tạo đơn vị mới
  if (!unit) {
    // Tạo short_name từ name (chuyển về chữ thường, không dấu)
    const shortName = normalizedName.toLowerCase()

    unit = await Unit.create({
      name: normalizedName,
      short_name: shortName,
      ratio_to_base: ratioToBase,
    })
  }

  return unit
}

/**
 * Validate và chuẩn hóa dữ liệu từ Excel
 * @param {Array} excelData - Dữ liệu từ Excel
 * @returns {Array} - Mảng các object đã được validate và chuẩn hóa
 */
const validateAndNormalizeExcelData = async (excelData) => {
  if (!Array.isArray(excelData) || excelData.length === 0) {
    throw new AppError(400, 'File Excel không có dữ liệu hoặc định dạng không đúng')
  }

  const normalizedData = []
  const errors = [] // Lỗi chặn (blocking errors)
  const warnings = [] // Cảnh báo (non-blocking warnings)

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i]
    const rowNumber = i + 2 // +2 vì bắt đầu từ hàng 2 (hàng 1 là header)

    try {
      // Validate các trường bắt buộc
      if (!row['Tên thuốc'] && !row['Ten thuoc'] && !row['name']) {
        errors.push(`Dòng ${rowNumber}: Thiếu tên thuốc`)
        continue
      }

      const name = row['Tên thuốc'] || row['Ten thuoc'] || row['name']
      const description = row['Mô tả'] || row['Mo ta'] || row['description'] || ''
      const imageUrl = row['Hình ảnh'] || row['Hinh anh'] || row['image_url'] || ''
      let baseUnitName = (row['Đơn vị cơ sở'] || row['Don vi co so'] || row['base_unit'] || '')
        .toString()
        .trim()
      const unitsString = row['Đơn vị'] || row['Don vi'] || row['units'] || ''
      const isActive =
        row['Hoạt động'] !== undefined
          ? row['Hoạt động']
          : row['Hoat dong'] !== undefined
            ? row['Hoat dong']
            : row['is_active'] !== undefined
              ? row['is_active']
              : true

      // Tỷ lệ chuyển đổi cho các đơn vị (tùy chọn, định dạng: "Đơn vị 1:10, Đơn vị 2:20" hoặc "Đơn vị 1=10, Đơn vị 2=20")
      const unitRatiosString =
        row['Tỷ lệ đơn vị'] || row['Ty le don vi'] || row['unit_ratios'] || row['Unit Ratios'] || ''

      // Các trường mới: Nhà sản xuất
      const manufacturer = row['Nhà sản xuất'] || row['Nha san xuat'] || row['manufacturer'] || ''

      // Các trường thông tin dược
      const activeIngredient =
        row['Thành phần'] ||
        row['Thanh phan'] ||
        row['active_ingredient'] ||
        row['Active Ingredient'] ||
        ''
      const indication =
        row['Công dụng'] || row['Cong dung'] || row['indication'] || row['Indication'] || ''
      const usage = row['Chỉ định'] || row['Chi dinh'] || row['usage'] || row['Usage'] || ''
      const contraindication =
        row['Chống chỉ định'] ||
        row['Chong chi dinh'] ||
        row['contraindication'] ||
        row['Contraindication'] ||
        ''
      const dosage = row['Liều dùng'] || row['Lieu dung'] || row['dosage'] || row['Dosage'] || ''
      const administration =
        row['Cách dùng'] || row['Cach dung'] || row['administration'] || row['Administration'] || ''
      const sideEffects =
        row['Tác dụng phụ'] ||
        row['Tac dung phu'] ||
        row['side_effects'] ||
        row['Side Effects'] ||
        ''
      const drugInteractions =
        row['Tương tác thuốc'] ||
        row['Tuong tac thuoc'] ||
        row['drug_interactions'] ||
        row['Drug Interactions'] ||
        ''
      const otherInfo =
        row['Thông tin khác'] ||
        row['Thong tin khac'] ||
        row['other_info'] ||
        row['Other Info'] ||
        ''

      // Giá nhập mặc định và giá bán mặc định
      const defaultImportPrice =
        row['Giá nhập'] ||
        row['Gia nhap'] ||
        row['default_import_price'] ||
        row['import_price'] ||
        ''
      const defaultRetailPrice =
        row['Giá bán'] || row['Gia ban'] || row['default_retail_price'] || row['retail_price'] || ''

      // Thời hạn sử dụng mặc định (ngày)
      const defaultExpiryDuration =
        row['Thời hạn sử dụng (ngày)'] ||
        row['Thời hạn sử dụng (tháng)'] || // Hỗ trợ cũ: tự động chuyển đổi tháng sang ngày
        row['Thoi han su dung (ngay)'] ||
        row['Thoi han su dung (thang)'] ||
        row['default_expiry_duration_days'] ||
        row['default_expiry_duration_months'] || // Hỗ trợ cũ
        row['expiry_duration_days'] ||
        row['expiry_duration_months'] ||
        ''

      // Tìm hoặc tạo base_unit (tự động tạo nếu chưa tồn tại)
      let baseUnit = null
      if (baseUnitName) {
        // Loại bỏ khoảng trắng thừa và chuẩn hóa
        baseUnitName = baseUnitName.replace(/\s+/g, ' ').trim()

        // Tự động tạo hoặc lấy đơn vị cơ sở (tỷ lệ mặc định: 1)
        baseUnit = await getOrCreateUnit(baseUnitName, 1)

        if (!baseUnit) {
          errors.push(`Dòng ${rowNumber}: Không thể tạo đơn vị cơ sở "${baseUnitName}"`)
          continue
        }
      } else {
        errors.push(`Dòng ${rowNumber}: Thiếu đơn vị cơ sở`)
        continue
      }

      // Parse tỷ lệ chuyển đổi từ chuỗi (nếu có)
      // Định dạng: "Hộp:10, Vỉ:5" hoặc "Hộp=10, Vỉ=5"
      const unitRatiosMap = {}
      if (unitRatiosString) {
        const ratios = unitRatiosString
          .toString()
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r)

        for (const ratioStr of ratios) {
          // Hỗ trợ cả ":" và "="
          const separator = ratioStr.includes(':') ? ':' : '='
          const parts = ratioStr.split(separator).map((p) => p.trim())
          if (parts.length === 2) {
            const unitName = parts[0]
            const ratio = parseFloat(parts[1])
            if (!isNaN(ratio) && ratio > 0) {
              unitRatiosMap[unitName] = ratio
            }
          }
        }
      }

      // Xử lý danh sách units (có thể là chuỗi phân cách bởi dấu phẩy)
      // Tự động tạo đơn vị mới nếu chưa tồn tại
      const unitsArray = []
      const unitRatiosMapForMedicine = new Map() // Lưu tỷ lệ riêng cho từng thuốc
      if (unitsString) {
        const unitNames = unitsString
          .toString()
          .split(',')
          .map((u) => u.trim())
          .filter((u) => u)

        for (const unitName of unitNames) {
          // Loại bỏ khoảng trắng thừa và chuẩn hóa
          const normalizedUnitName = unitName.replace(/\s+/g, ' ').trim()

          // Lấy tỷ lệ từ map (nếu có), nếu không có thì dùng mặc định: 10
          // (giả định đơn vị lớn hơn thường có tỷ lệ 10 so với đơn vị nhỏ hơn)
          const ratio = unitRatiosMap[normalizedUnitName] || 10

          // Tự động tạo hoặc lấy đơn vị (dùng ratio mặc định từ Unit nếu đã tồn tại)
          const unit = await getOrCreateUnit(normalizedUnitName, ratio)

          if (unit) {
            unitsArray.push(unit._id)
            // Lưu tỷ lệ riêng cho thuốc này (có thể khác với ratio_to_base trong Unit)
            unitRatiosMapForMedicine.set(unit._id.toString(), ratio)
          } else {
            warnings.push(
              `Dòng ${rowNumber}: Không thể tạo đơn vị "${normalizedUnitName}". Thuốc vẫn được tạo nhưng không có đơn vị này.`
            )
          }
        }
      }

      // Đảm bảo units là array of ObjectId hợp lệ
      const validUnits = unitsArray.filter((unitId) => {
        return mongoose.Types.ObjectId.isValid(unitId)
      })

      // Xây dựng pharmaceutical_info object (chỉ thêm các trường có giá trị)
      const pharmaceuticalInfo = {}
      if (activeIngredient)
        pharmaceuticalInfo.active_ingredient = activeIngredient.toString().trim()
      if (indication) pharmaceuticalInfo.indication = indication.toString().trim()
      if (usage) pharmaceuticalInfo.usage = usage.toString().trim()
      if (contraindication) pharmaceuticalInfo.contraindication = contraindication.toString().trim()
      if (dosage) pharmaceuticalInfo.dosage = dosage.toString().trim()
      if (administration) pharmaceuticalInfo.administration = administration.toString().trim()
      if (sideEffects) pharmaceuticalInfo.side_effects = sideEffects.toString().trim()
      if (drugInteractions)
        pharmaceuticalInfo.drug_interactions = drugInteractions.toString().trim()
      if (otherInfo) pharmaceuticalInfo.other_info = otherInfo.toString().trim()

      // Validate và parse giá nhập mặc định
      let parsedImportPrice = null
      if (defaultImportPrice) {
        const price = parseFloat(defaultImportPrice.toString().replace(/[^\d.-]/g, ''))
        if (!isNaN(price) && price >= 0) {
          parsedImportPrice = price
        } else {
          warnings.push(
            `Dòng ${rowNumber}: Giá nhập mặc định không hợp lệ "${defaultImportPrice}", sẽ bỏ qua.`
          )
        }
      }

      // Validate và parse giá bán mặc định
      let parsedRetailPrice = null
      if (defaultRetailPrice) {
        const price = parseFloat(defaultRetailPrice.toString().replace(/[^\d.-]/g, ''))
        if (!isNaN(price) && price >= 0) {
          parsedRetailPrice = price
        } else {
          warnings.push(
            `Dòng ${rowNumber}: Giá bán mặc định không hợp lệ "${defaultRetailPrice}", sẽ bỏ qua.`
          )
        }
      }

      // Validate và parse thời hạn sử dụng mặc định (ngày)
      let parsedExpiryDuration = null
      if (defaultExpiryDuration) {
        const duration = parseFloat(defaultExpiryDuration.toString().replace(/[^\d.-]/g, ''))
        if (!isNaN(duration) && duration > 0) {
          // Kiểm tra nếu là dữ liệu cũ (từ cột "Thời hạn sử dụng (tháng)"), chuyển đổi sang ngày
          const isOldMonthFormat =
            row['Thời hạn sử dụng (tháng)'] ||
            row['Thoi han su dung (thang)'] ||
            row['default_expiry_duration_months'] ||
            row['expiry_duration_months']

          if (isOldMonthFormat) {
            // Chuyển đổi từ tháng sang ngày (1 tháng = 30 ngày)
            parsedExpiryDuration = Math.round(duration * 30)
            warnings.push(
              `Dòng ${rowNumber}: Đã chuyển đổi thời hạn sử dụng từ ${duration} tháng sang ${parsedExpiryDuration} ngày.`
            )
          } else {
            // Giữ nguyên nếu là ngày
            parsedExpiryDuration = Math.round(duration)
          }
        } else {
          warnings.push(
            `Dòng ${rowNumber}: Thời hạn sử dụng mặc định không hợp lệ "${defaultExpiryDuration}", sẽ bỏ qua.`
          )
        }
      }

      // Xây dựng object dữ liệu đã chuẩn hóa
      const medicineData = {
        name: name.toString().trim(),
        description: description.toString().trim(),
        image_url: imageUrl.toString().trim(),
        base_unit: baseUnit._id,
        units: validUnits, // Chỉ lấy các ObjectId hợp lệ
        is_active: isActive === true || isActive === 'true' || isActive === 1 || isActive === '1',
      }

      // Thêm unit_ratios nếu có (lưu tỷ lệ riêng cho từng thuốc)
      if (unitRatiosMapForMedicine.size > 0) {
        medicineData.unit_ratios = unitRatiosMapForMedicine
      }

      // Thêm các trường mới nếu có giá trị
      if (manufacturer) {
        medicineData.manufacturer = manufacturer.toString().trim()
      }

      if (Object.keys(pharmaceuticalInfo).length > 0) {
        medicineData.pharmaceutical_info = pharmaceuticalInfo
      }

      if (parsedImportPrice !== null) {
        medicineData.default_import_price = parsedImportPrice
      }

      if (parsedRetailPrice !== null) {
        medicineData.default_retail_price = parsedRetailPrice
      }

      if (parsedExpiryDuration !== null) {
        medicineData.default_expiry_duration_days = parsedExpiryDuration
      }

      normalizedData.push(medicineData)
    } catch (error) {
      errors.push(`Dòng ${rowNumber}: ${error.message}`)
    }
  }

  if (errors.length > 0 && normalizedData.length === 0) {
    throw new AppError(400, `Lỗi validate dữ liệu:\n${errors.join('\n')}`)
  }

  return { normalizedData, errors, warnings }
}

/**
 * Import thuốc từ file Excel
 * @param {String} filePath - Đường dẫn đến file Excel
 * @returns {Object} - Kết quả import
 */
export const importMedicinesFromExcel = async (filePath) => {
  try {
    console.log('📖 Reading Excel file:', filePath)
    // Đọc file Excel
    const excelData = readExcelFile(filePath)
    console.log(`📊 Read ${excelData.length} rows from Excel`)

    // Validate và chuẩn hóa dữ liệu
    console.log('🔍 Validating and normalizing data...')
    const { normalizedData, errors, warnings } = await validateAndNormalizeExcelData(excelData)
    console.log(
      `✅ Normalized ${normalizedData.length} medicines, ${errors.length} errors, ${warnings.length} warnings`
    )

    if (normalizedData.length === 0) {
      throw new AppError(400, 'Không có dữ liệu hợp lệ để import')
    }

    // Import vào database
    const results = {
      success: [],
      failed: [],
      errors: errors, // Lỗi chặn (blocking errors)
      warnings: warnings, // Cảnh báo (non-blocking warnings)
    }

    console.log('💾 Starting to save medicines to database...')
    for (let i = 0; i < normalizedData.length; i++) {
      const medicineData = normalizedData[i]
      try {
        // Kiểm tra xem thuốc đã tồn tại chưa (theo tên)
        const existing = await medicinesRepo.findByName(medicineData.name)
        if (existing) {
          results.failed.push({
            name: medicineData.name,
            reason: 'Thuốc đã tồn tại',
          })
          continue
        }

        // Chuyển đổi Map thành Object nếu cần (Mongoose có thể không nhận Map trực tiếp)
        if (medicineData.unit_ratios instanceof Map) {
          const unitRatiosObj = {}
          medicineData.unit_ratios.forEach((value, key) => {
            unitRatiosObj[key] = value
          })
          medicineData.unit_ratios = unitRatiosObj
        }

        // Tạo thuốc mới
        const created = await medicinesRepo.create(medicineData)
        results.success.push({
          _id: created._id,
          name: created.name,
        })
        console.log(`✅ Created medicine ${i + 1}/${normalizedData.length}: ${medicineData.name}`)
      } catch (error) {
        console.error(`❌ Failed to create medicine "${medicineData.name}":`, error.message)
        results.failed.push({
          name: medicineData.name,
          reason: error.message,
        })
      }
    }

    console.log(
      `📊 Import summary: ${results.success.length} success, ${results.failed.length} failed`
    )

    // Xóa file sau khi import xong
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('🗑️ Deleted temporary file:', filePath)
      }
    } catch (error) {
      console.error('⚠️ Lỗi xóa file:', error)
    }

    return results
  } catch (error) {
    console.error('❌ [medicineService] Error in importMedicinesFromExcel:', error)
    console.error('❌ [medicineService] Error stack:', error.stack)
    throw error
  }
}
