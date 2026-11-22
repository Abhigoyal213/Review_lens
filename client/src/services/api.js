/**
 * api.js - Frontend API Service
 * 
 * Centralizes all Axios HTTP requests to the Express backend.
 */

import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60s timeout for large CSV uploads or AI batch operations
});

/**
 * Uploads a CSV file to backend
 * 
 * @param {File} file - CSV file selected by user
 * @returns {Promise<Object>} Upload response summary
 */
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/reviews/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Triggers batch AI review analysis in chunks of 5
 * 
 * @returns {Promise<Object>} Batch analysis stats
 */
export const triggerBatchAnalysis = async () => {
  const response = await API.post('/reviews/analyze');
  return response.data;
};

/**
 * Fetches dashboard summary statistics, top insights, and AI usage metrics
 * 
 * @returns {Promise<Object>} Dashboard statistics
 */
export const fetchDashboardStats = async () => {
  const response = await API.get('/reviews/stats');
  return response.data;
};

/**
 * Fetches review list with optional filters
 * 
 * @param {Object} [filters] - { product, sentiment, topic }
 * @returns {Promise<Array>} Array of review objects
 */
export const fetchReviews = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.product) params.append('product', filters.product);
  if (filters.sentiment) params.append('sentiment', filters.sentiment);
  if (filters.topic) params.append('topic', filters.topic);

  const response = await API.get(`/reviews?${params.toString()}`);
  return response.data;
};

/**
 * Generates an empathetic customer support reply on-demand for a single review
 * 
 * @param {string} reviewId - MongoDB _id of the review
 * @returns {Promise<string>} Generated suggested reply text
 */
export const generateSuggestedReply = async (reviewId) => {
  const response = await API.post(`/reviews/${reviewId}/reply`);
  return response.data;
};

/**
 * Checks backend server health
 * 
 * @returns {Promise<Object>} Server status and DB state
 */
export const checkHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

export default API;
