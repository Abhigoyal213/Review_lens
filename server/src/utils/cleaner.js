/**
 * cleaner.js - CSV Data Cleaning and Normalization Utility
 * 
 * Cleans messy real-world review data by:
 * 1. Stripping HTML tags (e.g. <b>Love it!</b> -> Love it!)
 * 2. Normalizing whitespace and newlines
 * 3. Handling empty reviews (flagging as isEmpty = true)
 * 4. Sanitizing invalid/missing ratings (e.g. 'five', missing, out of range -> null)
 * 5. Computing SHA-256 hashes for duplicate detection and caching
 * 6. Preserving multilingual Hindi and Hinglish text
 */

import crypto from 'crypto';

/**
 * Strips HTML tags from review text safely
 * 
 * @param {string} text - Raw review text possibly containing HTML
 * @returns {string} Text with HTML tags removed
 */
export const stripHtml = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
};

/**
 * Normalizes text for consistent hash generation and comparison
 * Trims extra whitespace, strips HTML, and converts to lowercase
 * 
 * @param {string} text - Review text
 * @returns {string} Normalized string
 */
export const normalizeText = (text) => {
  if (!text) return '';
  const noHtml = stripHtml(text);
  // Collapse multiple spaces/newlines into a single space and trim
  return noHtml.replace(/\s+/g, ' ').trim().toLowerCase();
};

/**
 * Generates a SHA-256 hash from normalized text
 * Used for duplicate detection and cache lookup
 * 
 * @param {string} text - Review text
 * @returns {string} 64-character hexadecimal SHA-256 hash
 */
export const generateTextHash = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized, 'utf-8').digest('hex');
};

/**
 * Sanitizes and validates the star rating
 * 
 * Rules:
 * - Must be an integer between 1 and 5
 * - Textual ratings (e.g. "five") return null
 * - Missing or empty ratings return null
 * - Out-of-bounds ratings (< 1 or > 5) return null
 * 
 * @param {string|number} rawRating - Raw rating value from CSV
 * @returns {number|null} Valid integer rating (1-5) or null if invalid
 */
export const parseRating = (rawRating) => {
  if (rawRating === undefined || rawRating === null) return null;
  
  const trimmed = String(rawRating).trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);

  // Check if it's a valid integer between 1 and 5
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return null;
  }

  return num;
};

/**
 * Cleans a single CSV row object and returns a structured Review object
 * 
 * @param {Object} row - Parsed CSV row
 * @param {Set<string>} seenHashesInBatch - Set of hashes seen so far in this upload batch
 * @returns {Object} Cleaned review object ready for DB persistence
 */
export const cleanReviewRow = (row, seenHashesInBatch = new Set()) => {
  const rawId = (row.review_id || row.reviewId || '').trim();
  const rawProduct = (row.product || '').trim();
  const rawDate = (row.date || '').trim();
  const rawText = row.review_text || row.reviewText || '';
  const rawRating = row.rating !== undefined && row.rating !== null ? String(row.rating).trim() : '';

  // 1. Strip HTML tags from review text
  const textWithoutHtml = stripHtml(rawText);

  // 2. Clean whitespace (collapse consecutive spaces/tabs/newlines into a single space)
  const cleanedText = textWithoutHtml.replace(/\s+/g, ' ').trim();

  // 3. Compute normalized hash
  const textHash = generateTextHash(cleanedText);

  // 4. Check if text is empty
  const isEmpty = cleanedText.length === 0;

  // 5. Check for duplicates in current batch (e.g. R012 and R015)
  let isDuplicate = false;
  if (!isEmpty && textHash) {
    if (seenHashesInBatch.has(textHash)) {
      isDuplicate = true;
    } else {
      seenHashesInBatch.add(textHash);
    }
  }

  // 6. Validate rating (store null if invalid like "five", while saving rawRating for audit)
  const rating = parseRating(rawRating);

  return {
    reviewId: rawId,
    product: rawProduct,
    rating,
    rawRating,
    date: rawDate,
    reviewText: cleanedText,
    originalText: rawText,
    textHash,
    isDuplicate,
    isEmpty,
    analysisStatus: isEmpty ? 'skipped' : 'pending',
  };
};

/**
 * Cleans an entire batch of parsed CSV rows
 * 
 * @param {Array<Object>} records - Array of raw parsed CSV row objects
 * @returns {Array<Object>} Array of cleaned review objects
 */
export const cleanReviewBatch = (records) => {
  const seenHashes = new Set();
  return records.map((record) => cleanReviewRow(record, seenHashes));
};
