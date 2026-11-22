/**
 * reviewRoutes.js - Express Routes for ReviewLens Reviews
 * 
 * Defines endpoints for uploading CSV files, fetching reviews, and statistics.
 */

import express from 'express';
import { upload } from '../config/multer.js';
import { handleCSVUpload } from '../controllers/uploadController.js';
import { Review } from '../models/Review.js';

const router = express.Router();

/**
 * POST /api/reviews/upload
 * Handles multipart/form-data CSV file upload
 */
router.post('/upload', upload.single('file'), handleCSVUpload);

/**
 * GET /api/reviews
 * Fetches all reviews from database with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { product, sentiment, topic } = req.query;
    const filter = {};

    if (product) filter.product = product;
    if (sentiment) filter.sentiment = sentiment;
    if (topic) filter.topics = topic;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
