/**
 * AnalysisCache.js - Mongoose Model for AI Result Caching
 * 
 * Stores the AI-analyzed sentiment, topics, summary, and reply status keyed by the
 * SHA-256 hash of the normalized review text.
 * When a customer review with the same text is encountered again (e.g., R012 and R015),
 * the cached result is reused, eliminating duplicate Gemini API calls.
 */

import mongoose from 'mongoose';

const analysisCacheSchema = new mongoose.Schema(
  {
    // SHA-256 hash of normalized review text (unique identifier for cache lookup)
    textHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Cached sentiment: positive, neutral, or negative
    sentiment: {
      type: String,
      required: true,
      enum: ['positive', 'neutral', 'negative'],
    },
    // Cached list of relevant topics
    topics: {
      type: [String],
      required: true,
    },
    // Cached single-line English summary
    summary: {
      type: String,
      required: true,
    },
    // Cached flag indicating if merchant should reply
    needsReply: {
      type: Boolean,
      required: true,
    },
    // Sample snippet of the original text for easier debugging/inspection
    sampleText: {
      type: String,
      default: '',
    },
    // Counter tracking how many times this cached analysis has been reused
    hitCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const AnalysisCache = mongoose.model('AnalysisCache', analysisCacheSchema);
export default AnalysisCache;
