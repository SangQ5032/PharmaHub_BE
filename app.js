import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import errorHandler from './src/middlewares/errorHandler.js'
import routes from './src/routes/index.js'
dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger (chỉ dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Mount module routes
app.use('/api', routes)
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' })
})

app.use(errorHandler) // luôn để cuối cùng

export default app
