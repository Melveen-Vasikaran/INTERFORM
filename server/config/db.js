const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('ℹ️  No MONGODB_URI environment variable detected.');
    console.log('🚀 Running in Enterprise In-Memory DB Mode with full seed dataset initialized.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnectedToMongo = true;
    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('🔄 Falling back to Enterprise In-Memory DB Mode for continuous operation.');
    return false;
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
