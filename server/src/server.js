/**
 * server.js - ReviewLens Express Backend Entry Point
 * 
 * This file initializes the Express application, configures essential middleware
 * like CORS and JSON body parsing, loads environment variables, defines basic
 * health check endpoints, and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Health check endpoint - used to verify the server is running and healthy
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
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

// Start listening for incoming requests
app.listen(PORT, () => {
  console.log(`ReviewLens backend server is running on http://localhost:${PORT}`);
});

export default app;
