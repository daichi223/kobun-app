/**
 * Data validation utilities for the ancient Japanese vocabulary app
 * Provides type-safe validation for JSONL data and user inputs
 */

export interface WordData {
  lemma: string;
  meanings: Array<{
    sense: string;
    aliases?: string[];
    examples?: Array<{
      jp: string;
      translation?: string;
      source?: string;
    }>;
  }>;
}

/**
 * Validates a single word object from JSONL data
 * @param data - Raw parsed JSON object
 * @returns Validated WordData or null if invalid
 */
export function validateWordData(data: any): WordData | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check required fields
  if (typeof data.lemma !== 'string' || !data.lemma.trim()) {
    return null;
  }

  if (!Array.isArray(data.meanings) || data.meanings.length === 0) {
    return null;
  }

  // Validate each meaning
  for (const meaning of data.meanings) {
    if (!meaning || typeof meaning !== 'object') {
      return null;
    }

    if (typeof meaning.sense !== 'string' || !meaning.sense.trim()) {
      return null;
    }

    // Validate examples if present
    if (meaning.examples && Array.isArray(meaning.examples)) {
      for (const example of meaning.examples) {
        if (!example || typeof example !== 'object') {
          return null;
        }
        if (typeof example.jp !== 'string' || !example.jp.trim()) {
          return null;
        }
      }
    }
  }

  return data as WordData;
}

/**
 * Validates range text input (e.g., "1-50")
 * @param rangeText - User input string
 * @returns Parsed range object or null if invalid
 */
export function validateRange(rangeText: string): { start: number; end: number } | null {
  if (!rangeText || typeof rangeText !== 'string') {
    return null;
  }

  // Restrict regex to prevent ReDoS and limit input size
  const trimmed = rangeText.trim();
  if (trimmed.length > 20) {
    return null;
  }

  const match = trimmed.match(/^(\d{1,4})-(\d{1,4})$/);
  if (!match) {
    return null;
  }

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);

  // Validate bounds
  if (start < 1 || end > 10000 || start > end) {
    return null;
  }

  return { start, end };
}

/**
 * Safely parses JSON with error handling
 * @param jsonString - String to parse
 * @returns Parsed object or null if invalid
 */
export function safeJsonParse(jsonString: string): any | null {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return null;
    }

    // Prevent extremely large JSON strings
    if (jsonString.length > 100000) {
      console.warn('JSON string too large, skipping');
      return null;
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Validates localStorage data structure for SRS stats
 * @param data - Raw parsed data from localStorage
 * @returns Valid stats object or empty object
 */
export function validateSRSStats(data: any): Record<string, any> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const validStats: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof key === 'string' && value && typeof value === 'object') {
      // Basic validation for SRS stat structure
      const stat = value as any;
      if (
        typeof stat.ef === 'number' &&
        typeof stat.reps === 'number' &&
        typeof stat.interval === 'number' &&
        typeof stat.dueAt === 'number' &&
        typeof stat.last === 'number' &&
        stat.ef >= 1.3 && stat.ef <= 2.5 &&
        stat.reps >= 0 &&
        stat.interval >= 0
      ) {
        validStats[key] = stat;
      }
    }
  }

  return validStats;
}