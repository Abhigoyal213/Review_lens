/**
 * validator.test.js - Automated Tests for Zod Schema Validation & Retry-Once Logic
 * 
 * Tests:
 * 1. Valid AI response passing Zod schema.
 * 2. Invalid sentiment (e.g. 'super_happy') being rejected.
 * 3. Invalid topic category being rejected.
 * 4. Missing required fields being rejected.
 * 5. Retry-once mechanism successfully recovering on attempt 2.
 * 6. Graceful marking as 'analysis_failed' without crashing if attempt 2 also fails.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAIResponse } from '../src/utils/validator.js';
import { analyzeAndValidateReview } from '../src/services/aiValidatorService.js';

describe('Zod Schema Validation & AI Retry-Once Logic', () => {
  it('should accept and normalize a valid AI response', () => {
    const validRaw = {
      sentiment: 'positive',
      topics: ['quality'],
      summary: 'The customer liked the product quality.',
      needs_reply: false,
    };

    const res = validateAIResponse(validRaw);
    assert.equal(res.success, true);
    assert.equal(res.data.sentiment, 'positive');
    assert.deepEqual(res.data.topics, ['quality']);
    assert.equal(res.data.summary, 'The customer liked the product quality.');
    assert.equal(res.data.needs_reply, false);
  });

  it('should reject an unsupported sentiment value (e.g. "super_good")', () => {
    const invalidSentiment = {
      sentiment: 'super_good', // Not in ['positive', 'neutral', 'negative']
      topics: ['quality'],
      summary: 'Product is good.',
      needs_reply: false,
    };

    const res = validateAIResponse(invalidSentiment);
    assert.equal(res.success, false);
    assert.ok(res.error.includes('sentiment'));
  });

  it('should reject an unsupported topic category (e.g. "discount")', () => {
    const invalidTopic = {
      sentiment: 'positive',
      topics: ['discount'], // Not in allowed topics list
      summary: 'Customer loved the discount.',
      needs_reply: false,
    };

    const res = validateAIResponse(invalidTopic);
    assert.equal(res.success, false);
    assert.ok(res.error.includes('topics'));
  });

  it('should reject responses with missing fields or empty summary', () => {
    const missingFields = {
      sentiment: 'negative',
      // topics is missing
      summary: '',
      needs_reply: true,
    };

    const res = validateAIResponse(missingFields);
    assert.equal(res.success, false);
  });

  it('should recover on retry when attempt 1 fails and attempt 2 succeeds', async () => {
    let callCount = 0;
    // Mock AI caller: fails on call 1, succeeds on call 2
    const mockAi = async () => {
      callCount++;
      if (callCount === 1) {
        return { sentiment: 'invalid_val', topics: ['quality'], summary: 'test', needs_reply: false };
      }
      return { sentiment: 'positive', topics: ['quality'], summary: 'Recovered on second attempt', needs_reply: false };
    };

    const result = await analyzeAndValidateReview('Great product', 'Shoes', mockAi);

    assert.equal(callCount, 2);
    assert.equal(result.status, 'analyzed');
    assert.equal(result.analysis.sentiment, 'positive');
    assert.equal(result.analysis.summary, 'Recovered on second attempt');
  });

  it('should mark review as analysis_failed without crashing when both attempts fail', async () => {
    let callCount = 0;
    // Mock AI caller: fails on both calls
    const mockAi = async () => {
      callCount++;
      return { sentiment: 'bad_sentiment_always', topics: ['unknown'], summary: '', needs_reply: 'not_bool' };
    };

    const result = await analyzeAndValidateReview('Defective item', 'Mug', mockAi);

    assert.equal(callCount, 2);
    assert.equal(result.status, 'analysis_failed');
    assert.ok(result.error);
    // The test completes normally, proving the application never crashes
  });
});
