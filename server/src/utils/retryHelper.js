/**
 * retryHelper.js - Exponential Backoff and Error Recovery Utility
 * 
 * Handles transient network errors, rate limiting (HTTP 429), and temporary server errors (500/503)
 * by retrying with exponentially increasing delays: delay = baseDelay * (2 ^ attempt).
 */

/**
 * Executes an async function with exponential backoff on transient errors
 * 
 * @param {Function} asyncFn - Async function to execute
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @param {number} [baseDelayMs=1000] - Base delay in milliseconds (default: 1000ms = 1s)
 * @returns {Promise<any>} Result of asyncFn
 */
export const executeWithExponentialBackoff = async (
  asyncFn,
  maxRetries = 3,
  baseDelayMs = 1000
) => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await asyncFn();
    } catch (error) {
      attempt++;

      const statusNum = Number(error.status) || Number(error.code) || 0;
      const errorMsg = (error.message || '') + ' ' + (typeof error === 'string' ? error : JSON.stringify(error));

      const isRateLimit =
        statusNum === 429 ||
        error.status === 'RESOURCE_EXHAUSTED' ||
        errorMsg.includes('429') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('Resource has been exhausted');

      const isServerError =
        statusNum >= 500 ||
        statusNum === 503 ||
        error.status === 'UNAVAILABLE' ||
        errorMsg.includes('500') ||
        errorMsg.includes('503') ||
        errorMsg.includes('UNAVAILABLE') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('overloaded');

      const isTransient = isRateLimit || isServerError;

      // If error is not transient or we exceeded max retries, throw
      if (!isTransient || attempt > maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay: 1s, 2s, 4s...
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `⏳ Transient API error encountered (attempt ${attempt}/${maxRetries}): ${error.message}. Backing off for ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default executeWithExponentialBackoff;
