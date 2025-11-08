import mongoose from 'mongoose'

function getMongoUri() {
  const a = (process.env.MONGO_URI || '').trim()
  const b = (process.env.MONGODB_URI || '').trim()
  const c = (process.env.DATABASE_URL || '').trim()
  const uri = a || b || c || 'mongodb://127.0.0.1:27017/pharmahub_db'
  return uri
}

export async function connectDB() {
  const uri = getMongoUri()
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true
  })
  console.log('✅ MongoDB connected:', uri)
}

export default connectDB
