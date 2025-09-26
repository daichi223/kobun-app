import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shuffle,
  shuffleInPlace,
  shuffleSeeded,
  pickRandom,
  validateShuffle,
  createSeededRandom
} from './shuffle'

describe('Shuffle Utility Tests', () => {
  beforeEach(() => {
    // Reset Math.random to ensure consistent test results
    vi.spyOn(Math, 'random').mockRestore();
  });

  describe('shuffle function', () => {
    it('should return array with same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result).toHaveLength(input.length);
    });

    it('should contain all original elements', () => {
      const input = ['a', 'b', 'c', 'd', 'e'];
      const result = shuffle(input);

      for (const item of input) {
        expect(result).toContain(item);
      }
    });

    it('should not modify the original array', () => {
      const input = [1, 2, 3, 4, 5];
      const originalCopy = [...input];
      const result = shuffle(input);
      expect(input).toEqual(originalCopy);
      expect(result).not.toBe(input); // Should be different object reference
    });

    it('should handle empty arrays', () => {
      const input: number[] = [];
      const result = shuffle(input);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(result).not.toBe(input); // Should be new array
    });

    it('should handle single element arrays', () => {
      const input = [42];
      const result = shuffle(input);
      expect(result).toEqual([42]);
      expect(result).toHaveLength(1);
      expect(result).not.toBe(input); // Should be new array
    });

    it('should handle arrays with duplicate elements', () => {
      const input = [1, 1, 2, 2, 3, 3];
      const result = shuffle(input);
      expect(result).toHaveLength(6);
      expect(result.filter(x => x === 1)).toHaveLength(2);
      expect(result.filter(x => x === 2)).toHaveLength(2);
      expect(result.filter(x => x === 3)).toHaveLength(2);
    });

    it('should work with different data types', () => {
      const strings = ['hello', 'world', 'test'];
      const stringResult = shuffle(strings);
      expect(stringResult).toHaveLength(3);
      expect(stringResult).toContain('hello');
      expect(stringResult).toContain('world');
      expect(stringResult).toContain('test');

      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const objectResult = shuffle(objects);
      expect(objectResult).toHaveLength(3);
      expect(objectResult.map(o => o.id).sort()).toEqual([1, 2, 3]);
    });

    it('should eventually produce different arrangements (statistical test)', () => {
      const input = [1, 2, 3, 4, 5];
      const arrangements = new Set<string>();

      // Run shuffle 100 times and collect unique arrangements
      for (let i = 0; i < 100; i++) {
        arrangements.add(JSON.stringify(shuffle(input)));
      }

      // With 5 elements, there are 120 possible arrangements (5!)
      // We expect to see multiple different arrangements in 100 shuffles
      expect(arrangements.size).toBeGreaterThan(1);
    });

    it('should produce deterministic results with mocked random', () => {
      // Mock Math.random to return specific sequence
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.8) // j = Math.floor(0.8 * 5) = 4
        .mockReturnValueOnce(0.2) // j = Math.floor(0.2 * 4) = 0
        .mockReturnValueOnce(0.7) // j = Math.floor(0.7 * 3) = 2
        .mockReturnValueOnce(0.5); // j = Math.floor(0.5 * 2) = 1

      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);

      // Expected result based on mocked random values
      expect(result).toEqual([4, 5, 1, 3, 2]);
    });
  });

  describe('shuffleInPlace function', () => {
    it('should modify the original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      const result = shuffleInPlace(input);

      expect(result).toBe(input); // Same reference
      expect(result).toHaveLength(original.length);
      expect(validateShuffle(original, result)).toBe(true);
    });

    it('should handle empty arrays', () => {
      const input: number[] = [];
      const result = shuffleInPlace(input);

      expect(result).toBe(input);
      expect(result).toEqual([]);
    });
  });

  describe('shuffleSeeded function', () => {
    it('should produce consistent results with same seed', () => {
      const input = [1, 2, 3, 4, 5];
      const seed = 12345;

      const result1 = shuffleSeeded(input, seed);
      const result2 = shuffleSeeded(input, seed);

      expect(result1).toEqual(result2);
    });

    it('should produce different results with different seeds', () => {
      const input = [1, 2, 3, 4, 5];

      const result1 = shuffleSeeded(input, 12345);
      const result2 = shuffleSeeded(input, 54321);

      expect(result1).not.toEqual(result2);
    });

    it('should preserve all elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleSeeded(input, 123);

      expect(validateShuffle(input, result)).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(shuffleSeeded([], 123)).toEqual([]);
      expect(shuffleSeeded([42], 123)).toEqual([42]);
    });
  });

  describe('pickRandom function', () => {
    it('should return requested number of elements', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = pickRandom(input, 5);

      expect(result).toHaveLength(5);
      for (const item of result) {
        expect(input).toContain(item);
      }
    });

    it('should return all elements when count >= array length', () => {
      const input = [1, 2, 3];
      const result = pickRandom(input, 5);

      expect(result).toHaveLength(3);
      expect(validateShuffle(input, result)).toBe(true);
    });

    it('should return empty array when count <= 0', () => {
      const input = [1, 2, 3, 4, 5];

      expect(pickRandom(input, 0)).toEqual([]);
      expect(pickRandom(input, -1)).toEqual([]);
    });

    it('should not modify original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];

      pickRandom(input, 3);

      expect(input).toEqual(original);
    });

    it('should return unique elements (no duplicates from shuffle)', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = pickRandom(input, 5);

      const uniqueItems = new Set(result);
      expect(uniqueItems.size).toBe(result.length);
    });
  });

  describe('validateShuffle function', () => {
    it('should return true for valid shuffles', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = [5, 1, 3, 2, 4];

      expect(validateShuffle(original, shuffled)).toBe(true);
    });

    it('should return false for different lengths', () => {
      const original = [1, 2, 3];
      const shuffled = [1, 2, 3, 4];

      expect(validateShuffle(original, shuffled)).toBe(false);
    });

    it('should return false for different elements', () => {
      const original = [1, 2, 3];
      const shuffled = [1, 2, 4];

      expect(validateShuffle(original, shuffled)).toBe(false);
    });

    it('should handle arrays with duplicates correctly', () => {
      const original = [1, 1, 2, 2, 3];
      const validShuffle = [2, 1, 3, 2, 1];
      const invalidShuffle = [1, 1, 1, 2, 3];

      expect(validateShuffle(original, validShuffle)).toBe(true);
      expect(validateShuffle(original, invalidShuffle)).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(validateShuffle([], [])).toBe(true);
      expect(validateShuffle([], [1])).toBe(false);
      expect(validateShuffle([1], [])).toBe(false);
    });

    it('should handle complex objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const original = [obj1, obj2];
      const shuffled = [obj2, obj1];

      expect(validateShuffle(original, shuffled)).toBe(true);
    });
  });

  describe('createSeededRandom function', () => {
    it('should produce consistent sequence with same seed', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(12345);

      const sequence1 = [rng1(), rng1(), rng1()];
      const sequence2 = [rng2(), rng2(), rng2()];

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(54321);

      const sequence1 = [rng1(), rng1(), rng1()];
      const sequence2 = [rng2(), rng2(), rng2()];

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should produce values between 0 and 1', () => {
      const rng = createSeededRandom(123);

      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });
});