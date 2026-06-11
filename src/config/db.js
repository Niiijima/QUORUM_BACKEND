import prisma from '../lib/prisma.js';
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('MongoDB connected via Prisma');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

export default connectDB;