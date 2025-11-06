import { AppError } from '../utils/AppError.js'
import mongoose from 'mongoose'

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err)

  // Xử lý lỗi AppError (custom error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
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
