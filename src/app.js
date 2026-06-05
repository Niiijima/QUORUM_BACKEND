require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const env = require('./config/env')
const errorHandler = require('./middleware/error')
const { defaultLimiter } = require('./middleware/rateLimit')
const { requestLogger } = require('./config/logger')
const campaignRoutes = require('./modules/campaigns/campaigns.routes')
const adminRoutes = require('./modules/admin/admin.routes')

const app = express()

connectDB()

app.use(cors({ origin: env.CLIENT_URL }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)
app.use(defaultLimiter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/campaigns', campaignRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

module.exports = app