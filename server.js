import dotenv from 'dotenv'
import app from './app.js'
import mongoose from 'mongoose'
import { connectDB } from './src/config/db.js' // nếu bạn vẫn muốn dùng hàm connectDB

dotenv.config()

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || 'localhost'

const startServer = async () => {
  try {
    await connectDB() // kết nối MongoDB
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 API base URL: http://${HOST}:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
