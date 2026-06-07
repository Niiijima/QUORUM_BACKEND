import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import env from './config/env.js'
import errorHandler from './middleware/error.js'
import { defaultLimiter } from './middleware/rateLimit.js'
import { requestLogger } from './config/logger.js'
import campaignRoutes from './modules/campaigns/campaigns.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import paymentRoutes from './modules/payments/payments.routes.js'

const app = express()

connectDB()

app.use(cors({ origin: env.CLIENT_URL }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)
app.use(defaultLimiter)
app.use('/api/payments', paymentRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/campaigns', campaignRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

export default app