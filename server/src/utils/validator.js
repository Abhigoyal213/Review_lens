/**
 * validator.js - Runtime Schema Validation for AI Responses using Zod
 * 
 * Never trust LLM output directly. This module defines strict Zod schemas
 * to ensure that Gemini's response contains only valid, allowed values.
 */

import { z } from 'zod';

/**
 * Allowed sentiment values
 */
export const ALLOWED_SENTIMENTS = ['positive', 'neutral', 'negative'];

/**
 * Allowed topic categories
 */
export const ALLOWED_TOPICS = [
  'quality',
  'delivery',
  'price',
  'packaging',
  'support',
  'size_fit',
  'other',
];

/**
 * Strict Zod Schema for AI review analysis response
 */
export const reviewAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative'], {
    errorMap: () => ({ message: "Sentiment must be 'positive', 'neutral', or 'negative'." }),
  }),
  topics: z
    .array(
      z.enum([
        'quality',
        'delivery',
        'price',
        'packaging',
        'support',
        'size_fit',
        'other',
      ], {
        errorMap: () => ({
          message:
            "Topic must be one of: 'quality', 'delivery', 'price', 'packaging', 'support', 'size_fit', 'other'.",
        }),
      })
    )
    .min(1, 'At least one topic must be specified.'),
  summary: z.string().trim().min(3, 'Summary must be a non-empty string.'),
  // Accept both needs_reply (snake_case from prompt) and needsReply (camelCase)
  needs_reply: z.boolean().optional(),
  needsReply: z.boolean().optional(),
}).transform((data) => {
  // Normalize needs_reply to a single canonical boolean field
  const needsReplyVal = data.needs_reply !== undefined ? data.needs_reply : Boolean(data.needsReply);
  return {
    sentiment: data.sentiment,
    topics: data.topics,
    summary: data.summary,
    needs_reply: needsReplyVal,
  };
});

/**
 * Validates raw AI JSON object against the schema
 * 
 * @param {Object} rawData - Object parsed from Gemini AI response
 * @returns {{ success: boolean, data?: Object, error?: string }}
 */
export const validateAIResponse = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {
      success: false,
      error: 'AI response is not an object.',
    };
  }

  const result = reviewAnalysisSchema.safeParse(rawData);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorMessages = issues.length > 0
      ? issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
      : result.error.message || 'Validation failed';
    return {
      success: false,
      error: errorMessages,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

export default validateAIResponse;
