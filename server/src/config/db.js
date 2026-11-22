/**
 * db.js - MongoDB Connection Configuration
 * 
 * Uses Mongoose to establish a connection to the MongoDB database.
 * The connection URI is retrieved from environment variables (process.env.MONGODB_URI)
 * with a fallback to the local MongoDB instance.
 */

import mongoose from 'mongoose';

/**
 * Connects to MongoDB database with error handling
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reviewlens';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // We log the error but don't immediately crash so the app can provide helpful status
    throw error;
  }
};

export default connectDB;
