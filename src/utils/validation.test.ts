import { describe, it, expect } from 'vitest';
import { validateWordData, validateRange, safeJsonParse, validateSRSStats } from './validation';

describe('Data Validation Utils', () => {
  describe('validateWordData', () => {
    it('should validate correct word data', () => {
      const validWord = {
        lemma: 'おどろく',
        meanings: [{
          sense: '気づく',
          examples: [{
            jp: '秋来ぬと目にはさやかに見えねども',
            translation: '秋が来たと目にははっきり見えないけれど'
          }]
        }]
      };

      const result = validateWordData(validWord);
      expect(result).toEqual(validWord);
    });

    it('should reject word without lemma', () => {
      const invalidWord = {
        meanings: [{ sense: '意味' }]
      };

      const result = validateWordData(invalidWord);
      expect(result).toBeNull();
    });

    it('should reject word without meanings', () => {
      const invalidWord = {
        lemma: 'test',
        meanings: []
      };

      const result = validateWordData(invalidWord);
      expect(result).toBeNull();
    });

    it('should reject word with invalid meaning structure', () => {
      const invalidWord = {
        lemma: 'test',
        meanings: [{ invalid: 'structure' }]
      };

      const result = validateWordData(invalidWord);
      expect(result).toBeNull();
    });

    it('should reject word with invalid examples', () => {
      const invalidWord = {
        lemma: 'test',
        meanings: [{
          sense: '意味',
          examples: [{ invalid: 'example' }]
        }]
      };

      const result = validateWordData(invalidWord);
      expect(result).toBeNull();
    });
  });

  describe('validateRange', () => {
    it('should validate correct range format', () => {
      const result = validateRange('1-50');
      expect(result).toEqual({ start: 1, end: 50 });
    });

    it('should handle whitespace', () => {
      const result = validateRange(' 10 - 100 ');
      expect(result).toEqual({ start: 10, end: 100 });
    });

    it('should reject invalid format', () => {
      expect(validateRange('invalid')).toBeNull();
      expect(validateRange('1-')).toBeNull();
      expect(validateRange('-50')).toBeNull();
      expect(validateRange('50-1')).toBeNull(); // end < start
    });

    it('should reject ranges outside bounds', () => {
      expect(validateRange('0-50')).toBeNull(); // start < 1
      expect(validateRange('1-10001')).toBeNull(); // end > 10000
    });

    it('should reject overly long inputs', () => {
      const longInput = '1-50'.repeat(10);
      expect(validateRange(longInput)).toBeNull();
    });

    it('should reject numbers with too many digits', () => {
      expect(validateRange('12345-67890')).toBeNull();
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"test": "value"}';
      const result = safeJsonParse(json);
      expect(result).toEqual({ test: 'value' });
    });

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json');
      expect(result).toBeNull();
    });

    it('should return null for non-string input', () => {
      const result = safeJsonParse(null as any);
      expect(result).toBeNull();
    });

    it('should reject extremely large JSON strings', () => {
      const largeJson = '"' + 'a'.repeat(100001) + '"';
      const result = safeJsonParse(largeJson);
      expect(result).toBeNull();
    });
  });

  describe('validateSRSStats', () => {
    it('should validate correct SRS stats', () => {
      const validStats = {
        'word1|sense1': {
          ef: 2.5,
          reps: 2,
          interval: 6,
          dueAt: Date.now() + 86400000,
          last: Date.now()
        }
      };

      const result = validateSRSStats(validStats);
      expect(result).toEqual(validStats);
    });

    it('should filter out invalid entries', () => {
      const mixedStats = {
        'valid|entry': {
          ef: 2.0,
          reps: 1,
          interval: 1,
          dueAt: Date.now(),
          last: Date.now()
        },
        'invalid|entry': {
          ef: 'invalid', // should be number
          reps: 1,
          interval: 1,
          dueAt: Date.now(),
          last: Date.now()
        }
      };

      const result = validateSRSStats(mixedStats);
      expect(result).toEqual({
        'valid|entry': mixedStats['valid|entry']
      });
    });

    it('should return empty object for null/undefined', () => {
      expect(validateSRSStats(null)).toEqual({});
      expect(validateSRSStats(undefined)).toEqual({});
      expect(validateSRSStats([])).toEqual({});
    });

    it('should validate EF bounds', () => {
      const invalidEF = {
        'test|entry': {
          ef: 3.0, // > 2.5
          reps: 1,
          interval: 1,
          dueAt: Date.now(),
          last: Date.now()
        }
      };

      const result = validateSRSStats(invalidEF);
      expect(result).toEqual({});
    });

    it('should validate negative values', () => {
      const negativeValues = {
        'test|entry': {
          ef: 2.0,
          reps: -1, // should be >= 0
          interval: 1,
          dueAt: Date.now(),
          last: Date.now()
        }
      };

      const result = validateSRSStats(negativeValues);
      expect(result).toEqual({});
    });
  });
});