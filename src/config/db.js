const prisma = require('./prisma')

async function connectDB() {
  try {
    await prisma.$connect()
    console.log('MongoDB connected via Prisma')
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB