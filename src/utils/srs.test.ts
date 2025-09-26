import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  nextSRS,
  isDue,
  loadStats,
  saveStats,
  calculateReviewStats,
  defaultStat,
  SRS_KEY,
  type ReviewStat
} from './srs'

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test data
const mockStat: ReviewStat = {
  ef: 2.3,
  reps: 3,
  interval: 15,
  dueAt: Date.now() + 1000 * 60 * 60 * 24, // 1 day from now
  last: Date.now() - 1000 * 60 * 60 * 24 * 14 // 14 days ago
};

describe('SRS Algorithm Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('nextSRS function', () => {
    it('should initialize with default stats for new items', () => {
      const result = nextSRS(undefined, 4);
      expect(result.ef).toBe(2.5);
      expect(result.reps).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.dueAt).toBeGreaterThan(result.last);
    });

    it('should reset reps and interval for incorrect answers (quality < 3)', () => {
      const prevStat: ReviewStat = { ef: 2.3, reps: 3, interval: 10, dueAt: 0, last: 0 };
      const result = nextSRS(prevStat, 1); // Again

      expect(result.reps).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.ef).toBeLessThan(prevStat.ef); // EF should decrease
    });

    it('should increment reps for correct answers (quality >= 3)', () => {
      const prevStat: ReviewStat = { ef: 2.5, reps: 1, interval: 1, dueAt: 0, last: 0 };
      const result = nextSRS(prevStat, 4); // Good

      expect(result.reps).toBe(2);
      expect(result.interval).toBe(6); // Second rep should be 6 days
    });

    it('should calculate interval correctly after second repetition', () => {
      const prevStat: ReviewStat = { ef: 2.5, reps: 2, interval: 6, dueAt: 0, last: 0 };
      const result = nextSRS(prevStat, 4); // Good

      expect(result.reps).toBe(3);
      expect(result.interval).toBe(Math.round(6 * 2.5)); // interval * EF
    });

    it('should clamp easiness factor between 1.3 and 2.5', () => {
      // Test lower bound
      const lowStat: ReviewStat = { ef: 1.3, reps: 1, interval: 1, dueAt: 0, last: 0 };
      const lowResult = nextSRS(lowStat, 1); // Again
      expect(lowResult.ef).toBe(1.3); // Should not go below 1.3

      // Test upper bound
      const highStat: ReviewStat = { ef: 2.5, reps: 1, interval: 1, dueAt: 0, last: 0 };
      const highResult = nextSRS(highStat, 5); // Easy
      expect(highResult.ef).toBe(2.5); // Should not go above 2.5
    });

    it('should clamp quality values between 0 and 5', () => {
      const stat: ReviewStat = { ef: 2.5, reps: 0, interval: 0, dueAt: 0, last: 0 };

      // Test negative quality
      const negResult = nextSRS(stat, -1);
      expect(negResult.reps).toBe(0); // Should be treated as 0 (failure)

      // Test high quality
      const highResult = nextSRS(stat, 10);
      expect(highResult.reps).toBe(1); // Should be treated as 5 (maximum)
    });

    it('should calculate due time correctly', () => {
      const currentTime = Date.now();
      const result = nextSRS(undefined, 4);
      const expectedDueTime = currentTime + (result.interval * 24 * 60 * 60 * 1000);

      expect(result.last).toBe(currentTime);
      expect(result.dueAt).toBe(expectedDueTime);
    });

    it('should maintain consistent behavior across multiple reviews', () => {
      let stat: ReviewStat | undefined = undefined;

      // First review: correct
      stat = nextSRS(stat, 4);
      expect(stat.reps).toBe(1);
      expect(stat.interval).toBe(1);

      // Second review: correct
      stat = nextSRS(stat, 4);
      expect(stat.reps).toBe(2);
      expect(stat.interval).toBe(6);

      // Third review: incorrect (should reset)
      stat = nextSRS(stat, 1);
      expect(stat.reps).toBe(0);
      expect(stat.interval).toBe(1);

      // Fourth review: correct again
      stat = nextSRS(stat, 4);
      expect(stat.reps).toBe(1);
      expect(stat.interval).toBe(1);
    });

    it('should handle edge case qualities correctly', () => {
      const stat = { ...defaultStat };

      // Test quality 2 (should reset)
      const result2 = nextSRS(stat, 2);
      expect(result2.reps).toBe(0);
      expect(result2.interval).toBe(1);

      // Test quality 3 (hard but correct)
      const result3 = nextSRS(stat, 3);
      expect(result3.reps).toBe(1);
      expect(result3.interval).toBe(1);
    });

    it('should preserve original stat object (immutability)', () => {
      const originalStat = { ...mockStat };
      const result = nextSRS(originalStat, 4);

      expect(originalStat).toEqual(mockStat); // Original should be unchanged
      expect(result).not.toBe(originalStat); // Should be different object
    });
  });

  describe('isDue function', () => {
    it('should return true for new items (undefined stat)', () => {
      expect(isDue(undefined)).toBe(true);
    });

    it('should return true when current time >= dueAt', () => {
      const currentTime = Date.now();
      const pastDueStat: ReviewStat = {
        ...mockStat,
        dueAt: currentTime - 1000 // 1 second ago
      };

      expect(isDue(pastDueStat, currentTime)).toBe(true);
    });

    it('should return false when current time < dueAt', () => {
      const currentTime = Date.now();
      const futureDueStat: ReviewStat = {
        ...mockStat,
        dueAt: currentTime + 1000 // 1 second from now
      };

      expect(isDue(futureDueStat, currentTime)).toBe(false);
    });

    it('should use Date.now() as default current time', () => {
      const futureDueStat: ReviewStat = {
        ...mockStat,
        dueAt: Date.now() + 1000
      };

      expect(isDue(futureDueStat)).toBe(false);
    });
  });

  describe('loadStats function', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockClear();
    });

    it('should load stats from localStorage', () => {
      const mockStats = { 'word1': mockStat };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStats));

      const result = loadStats();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(SRS_KEY);
      expect(result).toEqual(mockStats);
    });

    it('should return empty object when no data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadStats();

      expect(result).toEqual({});
    });

    it('should return empty object when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = loadStats();

      expect(result).toEqual({});
    });

    it('should use custom key when provided', () => {
      const customKey = 'custom-key';
      localStorageMock.getItem.mockReturnValue('{}');

      loadStats(customKey);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(customKey);
    });
  });

  describe('saveStats function', () => {
    beforeEach(() => {
      localStorageMock.setItem.mockClear();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.mocked(console.warn).mockRestore();
    });

    it('should save stats to localStorage', () => {
      const stats = { 'word1': mockStat };

      saveStats(stats);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        SRS_KEY,
        JSON.stringify(stats)
      );
    });

    it('should use custom key when provided', () => {
      const customKey = 'custom-key';
      const stats = { 'word1': mockStat };

      saveStats(stats, customKey);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        customKey,
        JSON.stringify(stats)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      saveStats({ 'word1': mockStat });

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to save SRS stats:',
        expect.any(Error)
      );
    });
  });

  describe('calculateReviewStats function', () => {
    it('should calculate stats correctly for mixed question pool', () => {
      const questions = ['new1', 'due1', 'future1', 'new2'];
      const currentTime = Date.now();
      const stats = {
        'due1': { ...mockStat, dueAt: currentTime - 1000 },
        'future1': { ...mockStat, dueAt: currentTime + 1000 }
      };

      const result = calculateReviewStats(questions, stats, currentTime);

      expect(result).toEqual({
        dueCount: 1,    // due1
        newCount: 2,    // new1, new2
        totalCount: 4   // all questions
      });
    });

    it('should handle empty question array', () => {
      const result = calculateReviewStats([], {});

      expect(result).toEqual({
        dueCount: 0,
        newCount: 0,
        totalCount: 0
      });
    });

    it('should use Date.now() as default current time', () => {
      const questions = ['test1'];
      const stats = {
        'test1': { ...mockStat, dueAt: Date.now() + 1000 }
      };

      const result = calculateReviewStats(questions, stats);

      expect(result.dueCount).toBe(0); // Should not be due
    });

    it('should count all new questions correctly', () => {
      const questions = ['new1', 'new2', 'new3'];

      const result = calculateReviewStats(questions, {});

      expect(result.newCount).toBe(3);
      expect(result.dueCount).toBe(0);
      expect(result.totalCount).toBe(3);
    });
  });
});