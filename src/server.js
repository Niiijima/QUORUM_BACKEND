import 'dotenv/config'
import './jobs/mint-coins.js'
import app from './app.js'
import env from './config/env.js'

app.listen(env.PORT, () => {
  console.log(`Quorum API running on port ${env.PORT} [${env.NODE_ENV}]`)
})

const logger = require('./config/logger')
