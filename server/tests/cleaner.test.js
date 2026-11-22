/**
 * cleaner.test.js - Automated Test for CSV Cleaning & Deduplication Logic
 * 
 * Verifies that the cleaning engine properly handles messy real-world data:
 * - HTML tag removal
 * - Invalid, non-numeric and out-of-range rating sanitation
 * - Empty review detection
 * - Duplicate review detection using SHA-256
 * - Hindi and multilingual Unicode text preservation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  stripHtml,
  normalizeText,
  generateTextHash,
  parseRating,
  cleanReviewRow,
  cleanReviewBatch,
} from '../src/utils/cleaner.js';

describe('CSV Data Cleaner & Duplicate Detector', () => {
  it('should strip HTML tags from review text (e.g. R024)', () => {
    const raw = '<b>Love it!</b> Keeps my desk clean, and the bamboo smells nice.';
    const cleaned = stripHtml(raw);
    assert.equal(cleaned, 'Love it! Keeps my desk clean, and the bamboo smells nice.');
  });

  it('should normalize ratings and treat invalid/missing ratings as null', () => {
    // Valid ratings
    assert.equal(parseRating('5'), 5);
    assert.equal(parseRating('1'), 1);
    assert.equal(parseRating(4), 4);

    // Missing rating (R010)
    assert.equal(parseRating(''), null);
    assert.equal(parseRating(null), null);
    assert.equal(parseRating(undefined), null);

    // Non-numeric textual rating (R022: "five")
    assert.equal(parseRating('five'), null);

    // Out-of-bounds ratings
    assert.equal(parseRating('0'), null);
    assert.equal(parseRating('6'), null);
    assert.equal(parseRating('-1'), null);
    assert.equal(parseRating('3.5'), null); // Only whole star ratings 1-5
  });

  it('should detect empty reviews and flag them as skipped (e.g. R005)', () => {
    const emptyRow = {
      review_id: 'R005',
      product: 'Cotton Bedsheet Set',
      rating: '5',
      date: '2026-10-07',
      review_text: '   ',
    };

    const cleaned = cleanReviewRow(emptyRow);
    assert.equal(cleaned.isEmpty, true);
    assert.equal(cleaned.reviewText, '');
    assert.equal(cleaned.analysisStatus, 'skipped');
  });

  it('should detect exact duplicate review text using SHA-256 hash (e.g. R012 vs R015)', () => {
    const rows = [
      {
        review_id: 'R012',
        product: 'Wireless Earbuds X2',
        rating: '1',
        date: '2026-10-03',
        review_text: 'The left earbud stopped working after 2 days.',
      },
      {
        review_id: 'R015',
        product: 'Wireless Earbuds X2',
        rating: '1',
        date: '2026-10-03',
        review_text: '  The left earbud stopped working after 2 days.  ',
      },
    ];

    const cleanedBatch = cleanReviewBatch(rows);

    assert.equal(cleanedBatch.length, 2);
    // R012 is the original
    assert.equal(cleanedBatch[0].isDuplicate, false);
    // R015 has identical text (despite extra whitespace) and must be marked duplicate
    assert.equal(cleanedBatch[1].isDuplicate, true);
    // Both must share the identical SHA-256 hash
    assert.equal(cleanedBatch[0].textHash, cleanedBatch[1].textHash);
    assert.ok(cleanedBatch[0].textHash.length === 64);
  });

  it('should correctly preserve Hindi Unicode characters without corruption (e.g. R016)', () => {
    const hindiRow = {
      review_id: 'R016',
      product: 'Wireless Earbuds X2',
      rating: '3',
      date: '2026-10-10',
      review_text: 'आवाज़ अच्छी है लेकिन बैटरी जल्दी खत्म हो जाती है।',
    };

    const cleaned = cleanReviewRow(hindiRow);
    assert.equal(cleaned.reviewText, 'आवाज़ अच्छी है लेकिन बैटरी जल्दी खत्म हो जाती है।');
    assert.equal(cleaned.isEmpty, false);
    assert.ok(cleaned.textHash.length === 64);
  });
});
