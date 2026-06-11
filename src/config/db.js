// src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log(' MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(' MongoDB Connection Error:', error.message);
    console.error('Please check your MONGO_URL and Atlas network access');
    process.exit(1);
  }
};

export default connectDB;