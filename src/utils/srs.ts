// SRS (Spaced Repetition System) Implementation - Simplified SM-2 Algorithm

import { ReviewStat } from '@/types/quiz';

export const SRS_KEY = "kobun.srs.v1";

export const defaultStat: ReviewStat = {
  ef: 2.5,
  reps: 0,
  interval: 0,
  dueAt: 0,
  last: 0
};

/**
 * Calculate next review statistics based on previous stat and answer quality
 * @param prev Previous review statistics (undefined for new items)
 * @param quality Answer quality: 1(Again) / 3(Hard) / 4(Good) / 5(Easy)
 * @returns Updated review statistics
 */
export function nextSRS(prev: ReviewStat | undefined, quality: number): ReviewStat {
  const s = { ...(prev ?? defaultStat) };
  const q = Math.max(0, Math.min(5, quality));

  // Reset for incorrect answers (quality < 3)
  if (q < 3) {
    s.reps = 0;
    s.interval = 1;
  } else {
    // Increment for correct answers
    s.reps += 1;
    if (s.reps === 1) {
      s.interval = 1;
    } else if (s.reps === 2) {
      s.interval = 6;
    } else {
      s.interval = Math.round(s.interval * s.ef);
    }
  }

  // Update easiness factor based on quality
  s.ef = s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  s.ef = Math.max(1.3, Math.min(2.5, s.ef));

  // Calculate next review time
  const ms = s.interval * 24 * 60 * 60 * 1000;
  s.last = Date.now();
  s.dueAt = s.last + ms;

  return s;
}

/**
 * Check if a review item is due for review
 * @param stat Review statistics
 * @param currentTime Current timestamp (defaults to Date.now())
 * @returns true if due for review
 */
export function isDue(stat: ReviewStat | undefined, currentTime: number = Date.now()): boolean {
  if (!stat) return true; // New items are always due
  return (stat.dueAt ?? 0) <= currentTime;
}

/**
 * Get review statistics from localStorage
 * @param key Storage key
 * @returns Parsed review statistics or empty object
 */
export function loadStats(key: string = SRS_KEY): Record<string, ReviewStat> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save review statistics to localStorage
 * @param stats Review statistics to save
 * @param key Storage key
 */
export function saveStats(stats: Record<string, ReviewStat>, key: string = SRS_KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to save SRS stats:', error);
  }
}

/**
 * Calculate review statistics for a pool of questions
 * @param questions Array of question IDs
 * @param stats Current review statistics
 * @param currentTime Current timestamp
 * @returns Object with due, new, and total counts
 */
export function calculateReviewStats(
  questions: string[],
  stats: Record<string, ReviewStat>,
  currentTime: number = Date.now()
): { dueCount: number; newCount: number; totalCount: number } {
  let dueCount = 0;
  let newCount = 0;

  for (const id of questions) {
    const stat = stats[id];
    if (!stat) {
      newCount++;
    } else if (isDue(stat, currentTime)) {
      dueCount++;
    }
  }

  return {
    dueCount,
    newCount,
    totalCount: questions.length
  };
}