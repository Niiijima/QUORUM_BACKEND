const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Quorum Backend is running', status: 'OK' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quorum server running on http://localhost:${PORT}`)
  })
}

module.exports = app