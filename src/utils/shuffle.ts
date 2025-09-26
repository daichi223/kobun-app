/**
 * Shuffle array utility using Fisher-Yates algorithm
 * Creates a new shuffled array without modifying the original
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param arr The array to shuffle
 * @returns A new array with the same elements in random order
 */
export function shuffle<T>(arr: T[]): T[] {
  if (arr.length <= 1) return [...arr];

  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles an array in place (modifies the original array)
 * @param arr The array to shuffle in place
 * @returns The same array reference, now shuffled
 */
export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates a seeded pseudo-random number generator for deterministic shuffling
 * Useful for testing and reproducible results
 * @param seed The seed value
 * @returns A function that returns pseudo-random numbers between 0 and 1
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return function(): number {
    // Simple Linear Congruential Generator (LCG)
    state = (state * 1103515245 + 12345) % (2 ** 31);
    return state / (2 ** 31);
  };
}

/**
 * Shuffles an array using a seeded random number generator for deterministic results
 * @param arr The array to shuffle
 * @param seed The seed for random number generation
 * @returns A new shuffled array with deterministic order based on seed
 */
export function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  if (arr.length <= 1) return [...arr];

  const result = [...arr];
  const rng = createSeededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks N random elements from an array without replacement
 * @param arr The source array
 * @param count The number of elements to pick
 * @returns A new array with randomly selected elements
 */
export function pickRandom<T>(arr: T[], count: number): T[] {
  if (count >= arr.length) return shuffle(arr);
  if (count <= 0) return [];

  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

/**
 * Validates that a shuffle operation preserves all original elements
 * @param original The original array
 * @param shuffled The shuffled array
 * @returns true if the shuffled array contains exactly the same elements
 */
export function validateShuffle<T>(original: T[], shuffled: T[]): boolean {
  if (original.length !== shuffled.length) return false;

  const originalMap = new Map<T, number>();
  const shuffledMap = new Map<T, number>();

  // Count occurrences in original
  for (const item of original) {
    originalMap.set(item, (originalMap.get(item) || 0) + 1);
  }

  // Count occurrences in shuffled
  for (const item of shuffled) {
    shuffledMap.set(item, (shuffledMap.get(item) || 0) + 1);
  }

  // Compare counts
  if (originalMap.size !== shuffledMap.size) return false;

  for (const [item, count] of originalMap) {
    if (shuffledMap.get(item) !== count) return false;
  }

  return true;
}