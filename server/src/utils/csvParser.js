/**
 * csvParser.js - CSV Parsing Utility
 * 
 * Parses raw CSV buffers/strings into JavaScript objects.
 * Configured with fault-tolerant options (relax_quotes, skip_empty_lines)
 * so malformed quotes or tricky characters don't crash the parser.
 */

import { parse } from 'csv-parse/sync';

/**
 * Expected columns in the customer review CSV
 */
export const REQUIRED_COLUMNS = ['review_id', 'product', 'rating', 'date', 'review_text'];

/**
 * Parses raw CSV buffer or text into an array of row objects
 * 
 * @param {Buffer|string} input - Raw CSV buffer or string
 * @returns {Array<Object>} Array of raw parsed review row objects
 */
export const parseCSV = (input) => {
  if (!input) {
    throw new Error('No CSV content provided for parsing.');
  }

  // Convert buffer to string if needed
  const content = Buffer.isBuffer(input) ? input.toString('utf-8') : input;

  // Parse CSV synchronously with fault-tolerant settings
  const records = parse(content, {
    columns: true, // Use the first header row as object keys
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true, // Handle unescaped or messy quotes gracefully
    relax_column_count: true, // Don't crash if a row has extra/fewer delimiters
  });

  if (!records || records.length === 0) {
    throw new Error('CSV file appears to be empty or has no data rows.');
  }

  // Verify that required columns exist in the header
  const headers = Object.keys(records[0]).map((h) => h.trim().toLowerCase());
  const missingHeaders = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missingHeaders.length > 0) {
    throw new Error(
      `CSV is missing required columns: ${missingHeaders.join(', ')}. Expected: ${REQUIRED_COLUMNS.join(', ')}`
    );
  }

  return records;
};

export default parseCSV;
