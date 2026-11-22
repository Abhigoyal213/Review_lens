/**
 * reviewRoutes.js - Express API Routes for ReviewLens
 * 
 * Endpoints:
 * - POST /api/reviews/upload    : Upload and clean CSV
 * - POST /api/reviews/analyze   : Trigger batch analysis with caching & backoff
 * - POST /api/reviews/:id/reply : Generate customer reply on-demand
 * - GET  /api/reviews           : List reviews with optional filters
 * - GET  /api/reviews/stats     : Summary cards, top complaints/praises, and AI metrics
 */

import express from 'express';
import { upload } from '../config/multer.js';
import { handleCSVUpload } from '../controllers/uploadController.js';
import { Review } from '../models/Review.js';
import { AnalysisCache } from '../models/AnalysisCache.js';
import { processPendingReviews } from '../services/batchProcessor.js';
import { generateCustomerReply } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/reviews/upload
 * Handles multipart CSV upload, cleaning, and upsert
 */
router.post('/upload', upload.single('file'), handleCSVUpload);

/**
 * POST /api/reviews/analyze
 * Triggers batch processing in chunks of 5 with SHA-256 caching and retry backoff
 */
router.post('/analyze', async (req, res) => {
  try {
    const stats = await processPendingReviews();
    res.status(200).json({
      success: true,
      message: 'Batch review analysis completed successfully.',
      stats,
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/reviews/:id/reply
 * Generates an empathetic customer support reply on-demand for a single review
 */
router.post('/:id/reply', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    if (!review.needsReply) {
      return res.status(400).json({
        success: false,
        error: 'This review was marked as not needing a reply.',
      });
    }

    // Call Gemini to generate courteous response
    const reply = await generateCustomerReply(review);
    review.suggestedReply = reply;
    await review.save();

    res.status(200).json({
      success: true,
      suggestedReply: reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reviews/stats
 * Aggregates dashboard summary cards, top complaints, top praises, and AI usage metrics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const analyzedReviews = await Review.countDocuments({
      analysisStatus: { $in: ['analyzed', 'cached'] },
    });
    const positiveReviews = await Review.countDocuments({ sentiment: 'positive' });
    const neutralReviews = await Review.countDocuments({ sentiment: 'neutral' });
    const negativeReviews = await Review.countDocuments({ sentiment: 'negative' });
    const needsReplyCount = await Review.countDocuments({ needsReply: true });

    // Calculate percentages based on analyzed reviews
    const denominator = analyzedReviews > 0 ? analyzedReviews : 1;
    const positivePct = Math.round((positiveReviews / denominator) * 100);
    const neutralPct = Math.round((neutralReviews / denominator) * 100);
    const negativePct = Math.round((negativeReviews / denominator) * 100);

    // Aggregate Top 3 Complaints (from negative reviews by topic)
    const negativeTopics = await Review.aggregate([
      { $match: { sentiment: 'negative', topics: { $exists: true, $ne: [] } } },
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // Aggregate Top 3 Praises (from positive reviews by topic)
    const positiveTopics = await Review.aggregate([
      { $match: { sentiment: 'positive', topics: { $exists: true, $ne: [] } } },
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // Cache metrics
    const totalCachedEntries = await AnalysisCache.countDocuments();
    const cacheHitSum = await AnalysisCache.aggregate([
      { $group: { _id: null, totalHits: { $sum: '$hitCount' } } },
    ]);
    const totalHits = cacheHitSum.length > 0 ? cacheHitSum[0].totalHits : 0;

    // Rating Mismatch Detection (Bonus): Flag reviews where star rating contradicts sentiment
    // e.g. 5 stars with negative sentiment (R008), or 1-2 stars with positive sentiment
    const mismatches = await Review.find({
      analysisStatus: { $in: ['analyzed', 'cached'] },
      rating: { $ne: null },
      $or: [
        { rating: { $gte: 4 }, sentiment: 'negative' },
        { rating: { $lte: 2 }, sentiment: 'positive' },
      ],
    }).select('reviewId product rating sentiment reviewText');

    res.status(200).json({
      success: true,
      stats: {
        totalReviews,
        analyzedReviews,
        sentiment: {
          positive: positiveReviews,
          positivePct,
          neutral: neutralReviews,
          neutralPct,
          negative: negativeReviews,
          negativePct,
        },
        needsReply: needsReplyCount,
        topComplaints: negativeTopics.map((t) => ({ topic: t._id, count: t.count })),
        topPraises: positiveTopics.map((t) => ({ topic: t._id, count: t.count })),
        cache: {
          uniqueEntries: totalCachedEntries,
          totalReusedHits: totalHits,
        },
        ratingMismatches: {
          count: mismatches.length,
          reviews: mismatches,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

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
