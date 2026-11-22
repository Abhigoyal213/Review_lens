/**
 * uploadController.js - Handles CSV File Upload & Data Cleaning
 * 
 * Flow:
 * 1. Receives uploaded CSV file from Multer
 * 2. Parses CSV buffer into structured rows
 * 3. Cleans each row (handles missing ratings, empty text, HTML, and duplicates)
 * 4. Persists cleaned reviews into MongoDB (idempotent upsert via bulkWrite)
 * 5. Returns detailed processing summary
 */

import { parseCSV } from '../utils/csvParser.js';
import { cleanReviewBatch } from '../utils/cleaner.js';
import { Review } from '../models/Review.js';

/**
 * POST /api/reviews/upload
 * Accepts a CSV file via multipart/form-data under the field name 'file'
 */
export const handleCSVUpload = async (req, res) => {
  try {
    // 1. Verify that a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a CSV file with field name "file".',
      });
    }

    // 2. Parse the CSV file buffer
    const rawRecords = parseCSV(req.file.buffer);

    // 3. Clean and normalize records (handle bad data, HTML, ratings, duplicates)
    const cleanedRecords = cleanReviewBatch(rawRecords);

    // 4. Calculate cleaning summary stats
    const emptyCount = cleanedRecords.filter((r) => r.isEmpty).length;
    const duplicateCount = cleanedRecords.filter((r) => r.isDuplicate).length;
    const invalidRatingCount = cleanedRecords.filter((r) => r.rating === null).length;
    const validCount = cleanedRecords.filter((r) => !r.isEmpty).length;

    // 5. Upsert records into MongoDB (idempotent by reviewId)
    const bulkOps = cleanedRecords.map((review) => ({
      updateOne: {
        filter: { reviewId: review.reviewId },
        update: { $set: review },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Review.bulkWrite(bulkOps);
    }

    // 6. Return upload & cleaning summary
    return res.status(200).json({
      success: true,
      message: `Successfully processed and cleaned ${cleanedRecords.length} reviews.`,
      stats: {
        totalRows: cleanedRecords.length,
        validReviews: validCount,
        emptyReviews: emptyCount,
        duplicateReviews: duplicateCount,
        invalidOrMissingRatings: invalidRatingCount,
      },
      preview: cleanedRecords.slice(0, 5),
    });
  } catch (error) {
    console.error('Upload & Cleaning Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
