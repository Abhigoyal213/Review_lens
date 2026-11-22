/**
 * server.js - ReviewLens Express Backend Entry Point
 * 
 * This file initializes the Express application, configures essential middleware
 * like CORS and JSON body parsing, connects to MongoDB, defines health check
 * endpoints, and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Define port from environment variable or fallback to 5000
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) so frontend React app can connect
app.use(cors());

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Basic welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ReviewLens API',
    version: '1.0.0',
    status: 'online'
  });
});

// Health check endpoint - reports server and database connection health
app.get('/api/health', (req, res) => {
  // MongoDB readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Global error handling middleware - catches any unhandled errors gracefully
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start database connection and then start HTTP server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn('⚠️ Warning: Server starting without MongoDB connection. Re-check MongoDB service if needed.');
  }

  app.listen(PORT, () => {
    console.log(`ReviewLens backend server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
