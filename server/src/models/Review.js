/**
 * Review.js - Mongoose Model for Customer Product Reviews
 * 
 * Stores both raw CSV customer review details and the subsequent AI-generated
 * analysis (sentiment, topics, summary, reply status).
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Review identifier from CSV (e.g. "R001")
    reviewId: {
      type: String,
      required: true,
      trim: true,
    },
    // Product name (e.g. "Cotton Bedsheet Set")
    product: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Numeric star rating (1-5). Null if missing, invalid or text like "five"
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Raw rating string preserved from CSV for auditing and mismatch checks
    rawRating: {
      type: String,
      default: '',
    },
    // Date string from CSV (e.g. "2026-10-02")
    date: {
      type: String,
      trim: true,
    },
    // Cleaned review text (whitespace trimmed, HTML stripped)
    reviewText: {
      type: String,
      default: '',
    },
    // Original review text directly from CSV
    originalText: {
      type: String,
      default: '',
    },
    // SHA-256 hash of normalized review text for caching and deduplication
    textHash: {
      type: String,
      index: true,
      default: '',
    },
    // Flag: whether this review has the exact same text as an earlier review in the file
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    // Flag: whether the review text was empty/blank in the CSV
    isEmpty: {
      type: Boolean,
      default: false,
    },
    // Status of AI processing
    analysisStatus: {
      type: String,
      enum: ['pending', 'analyzed', 'cached', 'analysis_failed', 'skipped'],
      default: 'pending',
      index: true,
    },
    // AI Analysis: sentiment classification
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', null],
      default: null,
      index: true,
    },
    // AI Analysis: array of matched topics
    topics: {
      type: [String],
      default: [],
    },
    // AI Analysis: concise 1-sentence English summary
    summary: {
      type: String,
      default: '',
    },
    // AI Analysis: whether this customer review needs merchant attention/reply
    needsReply: {
      type: Boolean,
      default: false,
      index: true,
    },
    // On-demand generated merchant reply (only populated when store owner clicks "Generate Reply")
    suggestedReply: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
