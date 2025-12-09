import { AppError } from '../utils/AppError.js'
import mongoose from 'mongoose'
import multer from 'multer'

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err)
  console.error('❌ Error details:', {
    message: err.message,
    code: err.code,
    name: err.name,
    statusCode: err.statusCode,
    contentType: req.headers['content-type'],
    hasFile: !!req.file,
  })

  // Xử lý lỗi Multer (file upload)
  if (err instanceof multer.MulterError) {
    let message = 'Lỗi upload file'
    let statusCode = 400

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File quá lớn. Kích thước tối đa là 10MB'
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Field name không đúng. Vui lòng sử dụng field name "file"'
    } else {
      message = `Lỗi upload file: ${err.message}`
    }

    return res.status(statusCode).json({
      success: false,
      status: 'error',
      message: message,
    })
  }

  // Xử lý lỗi từ multer fileFilter
  if (
    err.message &&
    (err.message.includes('Chỉ chấp nhận file Excel') || err.message.includes('file Excel'))
  ) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: err.message,
    })
  }

  // Xử lý lỗi khi Content-Type không đúng (không phải multipart/form-data)
  if (err.message && err.message.includes('multipart')) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Content-Type phải là multipart/form-data. Vui lòng sử dụng FormData khi gửi file.',
    })
  }

  // Xử lý lỗi AppError (custom error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: 'error',
      message: err.message,
    })
  }

  // Xử lý lỗi validation của Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: messages,
    })
  }

  // Xử lý lỗi CastError (sai định dạng ObjectId, ...)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid ${err.path}: ${err.value}`,
    })
  }

  // Xử lý lỗi duplicate key (trùng unique field)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({
      status: 'error',
      message: `${field} đã tồn tại`,
    })
  }

  // Lỗi khác - trả về message chi tiết trong development, generic trong production
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorHandler
