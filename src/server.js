require('dotenv').config()
const app = require('./app')
const env = require('./config/env')

app.listen(env.PORT, () => {
  console.log(`Quorum API running on port ${env.PORT} [${env.NODE_ENV}]`)
})