/**
 * aiValidatorService.js - Validation and Retry-Once Pipeline for Gemini AI
 * 
 * Requirements:
 * 1. Validate every AI response with Zod.
 * 2. If response is invalid or contains an unsupported value:
 *    - Retry once.
 *    - Validate the second response.
 *    - If validation fails again, mark review as 'analysis_failed' without crashing.
 */

import { validateAIResponse } from '../utils/validator.js';
import { analyzeReviewWithGemini } from './geminiService.js';

/**
 * Analyzes a review and validates its response with retry-once capability
 * 
 * @param {string} reviewText - Review text
 * @param {string} product - Product name
 * @param {Function} [aiCaller] - Optional AI function (defaults to analyzeReviewWithGemini, customizable for testing)
 * @returns {Promise<{ status: string, analysis?: Object, error?: string }>}
 */
export const analyzeAndValidateReview = async (
  reviewText,
  product = '',
  aiCaller = analyzeReviewWithGemini
) => {
  // Attempt 1: Call AI and validate
  try {
    const firstRawResponse = await aiCaller(reviewText, product);
    const firstValidation = validateAIResponse(firstRawResponse);

    if (firstValidation.success) {
      return {
        status: 'analyzed',
        analysis: firstValidation.data,
      };
    }

    console.warn(`⚠️ First AI validation failed: ${firstValidation.error}. Retrying once...`);
  } catch (error) {
    console.warn(`⚠️ First AI call error: ${error.message}. Retrying once...`);
  }

  // Attempt 2: Retry once
  try {
    const secondRawResponse = await aiCaller(reviewText, product);
    const secondValidation = validateAIResponse(secondRawResponse);

    if (secondValidation.success) {
      return {
        status: 'analyzed',
        analysis: secondValidation.data,
      };
    }

    console.error(`❌ Second AI validation failed: ${secondValidation.error}. Marking as analysis_failed.`);
    return {
      status: 'analysis_failed',
      error: `Validation failed after retry: ${secondValidation.error}`,
    };
  } catch (secondError) {
    console.error(`❌ Second AI call error: ${secondError.message}. Marking as analysis_failed.`);
    return {
      status: 'analysis_failed',
      error: `AI call failed after retry: ${secondError.message}`,
    };
  }
};
