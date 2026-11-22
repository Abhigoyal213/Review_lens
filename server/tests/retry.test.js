/**
 * retry.test.js - Automated Tests for Exponential Backoff and Retry Logic
 * 
 * Tests:
 * 1. Immediate resolution on first attempt without delays.
 * 2. Exponential backoff retry on HTTP 429 rate-limit errors and recovery.
 * 3. Throwing after exceeding maximum retry attempts.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executeWithExponentialBackoff } from '../src/utils/retryHelper.js';

describe('Exponential Backoff & Rate Limit Retry Mechanism', () => {
  it('should return result immediately when no errors occur', async () => {
    let callCount = 0;
    const result = await executeWithExponentialBackoff(async () => {
      callCount++;
      return 'success';
    }, 3, 50);

    assert.equal(result, 'success');
    assert.equal(callCount, 1);
  });

  it('should retry on HTTP 429 rate limit error and succeed', async () => {
    let attempts = 0;

    const rateLimitedOperation = async () => {
      attempts++;
      if (attempts < 3) {
        const error = new Error('429 Too Many Requests - Resource has been exhausted');
        error.status = 429;
        throw error;
      }
      return { status: 'ok', data: 'analyzed' };
    };

    // Use a small 50ms base delay for fast automated unit test execution
    const result = await executeWithExponentialBackoff(rateLimitedOperation, 3, 50);

    assert.equal(attempts, 3);
    assert.equal(result.status, 'ok');
  });

  it('should fail cleanly and throw when max retries are exceeded', async () => {
    let attempts = 0;

    const permanentErrorOperation = async () => {
      attempts++;
      const error = new Error('500 Internal Server Error');
      error.status = 500;
      throw error;
    };

    await assert.rejects(
      async () => {
        await executeWithExponentialBackoff(permanentErrorOperation, 2, 50);
      },
      (err) => {
        assert.ok(err.message.includes('500'));
        return true;
      }
    );

    // Initial attempt + 2 retries = 3 attempts total
    assert.equal(attempts, 3);
  });
});
