import 'dotenv/config' 
import app from './app.js'
import connectDB from './src/config/db.js'

const PORT = Number(process.env.PORT) || 5000
const HOST = process.env.HOST || '0.0.0.0'

async function startServer() {
  try {
    await connectDB()
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
