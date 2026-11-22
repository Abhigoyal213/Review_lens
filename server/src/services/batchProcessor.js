/**
 * batchProcessor.js - Batch Processing, Caching, and Analysis Orchestrator
 * 
 * Requirements:
 * 1. Process reviews in batches of approximately 5 reviews (Feature 5).
 * 2. SHA-256 Caching: Check AnalysisCache before calling Gemini. Reuse cached analysis for duplicates (Feature 6).
 * 3. Rate-limit & exponential backoff handling for API errors.
 * 4. Zod schema validation and retry-once per review (Feature 3).
 * 5. Track AI usage statistics: API calls made, cache hits, processing time.
 */

import { Review } from '../models/Review.js';
import { AnalysisCache } from '../models/AnalysisCache.js';
import { analyzeAndValidateReview } from './aiValidatorService.js';
import { executeWithExponentialBackoff } from '../utils/retryHelper.js';

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES_MS = 1000;

/**
 * Runs batch analysis across all pending reviews
 * 
 * @param {Object} [options]
 * @param {Function} [options.aiCaller] - Optional custom AI caller for testing
 * @returns {Promise<Object>} Summary statistics of batch execution
 */
export const processPendingReviews = async (options = {}) => {
  const startTime = Date.now();

  // Find all reviews needing analysis
  const pendingReviews = await Review.find({
    analysisStatus: 'pending',
    isEmpty: false,
  }).sort({ createdAt: 1 });

  let apiCallsCount = 0;
  let cacheHitsCount = 0;
  let successCount = 0;
  let failedCount = 0;

  console.log(`🚀 Starting batch analysis for ${pendingReviews.length} pending reviews in chunks of ${BATCH_SIZE}...`);

  // Process sequentially in batches of 5
  for (let i = 0; i < pendingReviews.length; i += BATCH_SIZE) {
    const currentBatch = pendingReviews.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingReviews.length / BATCH_SIZE);

    console.log(`📦 Processing Batch ${batchNumber}/${totalBatches} (${currentBatch.length} reviews)...`);

    for (const review of currentBatch) {
      try {
        // Step 1: Check SHA-256 Cache in MongoDB
        if (review.textHash) {
          const cachedEntry = await AnalysisCache.findOne({ textHash: review.textHash });

          if (cachedEntry) {
            // Cache Hit! Reuse existing AI analysis without calling Gemini API
            review.sentiment = cachedEntry.sentiment;
            review.topics = cachedEntry.topics;
            review.summary = cachedEntry.summary;
            review.needsReply = cachedEntry.needsReply;
            review.analysisStatus = 'cached';
            await review.save();

            // Increment hit counter in cache
            cachedEntry.hitCount = (cachedEntry.hitCount || 1) + 1;
            await cachedEntry.save();

            cacheHitsCount++;
            successCount++;
            console.log(`⚡ Cache Hit for Review [${review.reviewId}]: reused analysis for "${review.product}"`);
            continue;
          }
        }

        // Step 2: Cache Miss - Call Gemini with Exponential Backoff & Schema Validation
        const result = await executeWithExponentialBackoff(
          async () => {
            apiCallsCount++;
            return await analyzeAndValidateReview(
              review.reviewText,
              review.product,
              options.aiCaller
            );
          },
          3, // maxRetries
          1000 // baseDelay
        );

        if (result.status === 'analyzed' && result.analysis) {
          const analysis = result.analysis;

          // Update Review document
          review.sentiment = analysis.sentiment;
          review.topics = analysis.topics;
          review.summary = analysis.summary;
          review.needsReply = analysis.needs_reply;
          review.analysisStatus = 'analyzed';
          await review.save();

          // Store in SHA-256 Cache for future reuse
          if (review.textHash) {
            await AnalysisCache.findOneAndUpdate(
              { textHash: review.textHash },
              {
                textHash: review.textHash,
                sentiment: analysis.sentiment,
                topics: analysis.topics,
                summary: analysis.summary,
                needsReply: analysis.needs_reply,
                sampleText: review.reviewText.slice(0, 100),
                hitCount: 1,
              },
              { upsert: true, returnDocument: 'after' }
            );
          }

          successCount++;
          console.log(`✅ Analyzed Review [${review.reviewId}]: ${analysis.sentiment} | needs_reply: ${analysis.needs_reply}`);
        } else {
          // Marked as analysis_failed
          review.analysisStatus = 'analysis_failed';
          await review.save();
          failedCount++;
          console.warn(`⚠️ Review [${review.reviewId}] marked as analysis_failed: ${result.error}`);
        }
      } catch (err) {
        review.analysisStatus = 'analysis_failed';
        await review.save();
        failedCount++;
        console.error(`❌ Error processing Review [${review.reviewId}]:`, err.message);
      }
    }

    // Pause briefly between batches to respect API rate limits
    if (i + BATCH_SIZE < pendingReviews.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  const totalTimeMs = Date.now() - startTime;

  return {
    success: true,
    totalProcessed: pendingReviews.length,
    successCount,
    failedCount,
    apiCalls: apiCallsCount,
    cacheHits: cacheHitsCount,
    processingTimeMs: totalTimeMs,
    processingTimeSeconds: (totalTimeMs / 1000).toFixed(2),
  };
};

export default processPendingReviews;
