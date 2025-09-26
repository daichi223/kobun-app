/**
 * Data processing utilities for the ancient Japanese vocabulary app
 */

export type Example = {
  jp: string;
  translation?: string;
  source?: string;
};

export type Meaning = {
  sense: string;
  aliases?: string[];
  examples?: Example[];
};

export type Word = {
  lemma: string;
  meanings: Meaning[];
};

export type Question = {
  id: string;         // "lemma|sense"
  wordNumber: number; // Word number (1, 2, 3...) for range filtering
  meaningId: string;  // "1-1", "1-2", etc.
  lemma: string;
  sense: string;
  examples: Example[];
};

export type Mode = "word2sense" | "sense2word" | "example2sense_jp" | "example2sense_tr";

/**
 * Parse JSONL (JSON Lines) data into an array of objects
 * @param text Raw JSONL text content
 * @returns Array of parsed JSON objects
 */
export function parseJSONL<T>(text: string): T[] {
  const lines = text.split('\n').filter(line => line.trim());
  const results: T[] = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]) as T;
      results.push(parsed);
    } catch (error) {
      console.warn(`Failed to parse JSONL line ${i + 1}:`, error);
      // Continue parsing other lines
    }
  }

  return results;
}

/**
 * Transform Word data into Question objects for quiz system
 * @param words Array of Word objects
 * @returns Array of Question objects
 */
export function transformWordsToQuestions(words: Word[]): Question[] {
  const questions: Question[] = [];
  let wordCounter = 0;

  for (const word of words) {
    wordCounter += 1;

    for (let meaningIndex = 0; meaningIndex < word.meanings.length; meaningIndex++) {
      const meaning = word.meanings[meaningIndex];
      const meaningId = `${wordCounter}-${meaningIndex + 1}`;

      questions.push({
        id: `${word.lemma}|${meaning.sense}`,
        wordNumber: wordCounter,
        meaningId: meaningId,
        lemma: word.lemma,
        sense: meaning.sense,
        examples: meaning.examples || []
      });
    }
  }

  return questions;
}

/**
 * Filter questions by word number range
 * @param questions Array of questions
 * @param rangeText Range string like "1-50" or "10-25"
 * @returns Filtered questions within the specified range
 */
export function filterQuestionsByRange(questions: Question[], rangeText: string): Question[] {
  const match = rangeText.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!match) {
    console.warn('Invalid range format:', rangeText);
    return questions;
  }

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);

  if (start > end) {
    console.warn('Invalid range: start > end', { start, end });
    return [];
  }

  return questions.filter(q => q.wordNumber >= start && q.wordNumber <= end);
}

/**
 * Filter questions that are compatible with the specified quiz mode
 * @param questions Array of questions
 * @param mode Quiz mode
 * @returns Questions that have the required data for the mode
 */
export function filterQuestionsByMode(questions: Question[], mode: Mode): Question[] {
  switch (mode) {
    case "example2sense_jp":
    case "example2sense_tr":
      // These modes require examples
      return questions.filter(q =>
        q.examples &&
        q.examples.length > 0 &&
        q.examples.some(ex =>
          mode === "example2sense_jp" ? ex.jp : ex.translation
        )
      );
    case "word2sense":
    case "sense2word":
    default:
      // These modes work with any question
      return questions;
  }
}

/**
 * Get the correct answer for a question based on the quiz mode
 * @param question The question object
 * @param mode Quiz mode
 * @returns The correct answer string
 */
export function getCorrectAnswer(question: Question, mode: Mode): string {
  switch (mode) {
    case "sense2word":
    case "example2sense_tr":
      return question.lemma;
    case "word2sense":
    case "example2sense_jp":
    default:
      return question.sense;
  }
}

/**
 * Get the question prompt based on mode and question data
 * @param question The question object
 * @param mode Quiz mode
 * @returns The question prompt to display
 */
export function getQuestionPrompt(question: Question, mode: Mode): string {
  switch (mode) {
    case "word2sense":
      return question.lemma;
    case "sense2word":
      return question.sense;
    case "example2sense_jp":
      return question.examples?.[0]?.jp || "例文がありません";
    case "example2sense_tr":
      return question.examples?.[0]?.translation || "現代語訳がありません";
    default:
      return "";
  }
}

/**
 * Generate multiple choice distractors for a question
 * @param question Current question
 * @param allQuestions Pool of all available questions
 * @param mode Quiz mode
 * @param count Number of distractors to generate
 * @returns Array of distractor strings
 */
export function generateDistractors(
  question: Question,
  allQuestions: Question[],
  mode: Mode,
  count: number = 3
): string[] {
  const correctAnswer = getCorrectAnswer(question, mode);

  // Get all possible answers from the question pool
  const possibleAnswers = allQuestions
    .map(q => getCorrectAnswer(q, mode))
    .filter(answer => answer !== correctAnswer);

  // Remove duplicates
  const uniqueAnswers = [...new Set(possibleAnswers)];

  // Shuffle and take requested count
  const shuffled = uniqueAnswers.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Create multiple choice options including the correct answer
 * @param question Current question
 * @param allQuestions Pool of all available questions
 * @param mode Quiz mode
 * @param optionCount Total number of options (including correct answer)
 * @returns Shuffled array of options
 */
export function createMultipleChoiceOptions(
  question: Question,
  allQuestions: Question[],
  mode: Mode,
  optionCount: number = 4
): string[] {
  const correctAnswer = getCorrectAnswer(question, mode);
  const distractorCount = optionCount - 1;
  const distractors = generateDistractors(question, allQuestions, mode, distractorCount);

  // Combine correct answer with distractors
  const allOptions = [...distractors, correctAnswer];

  // Shuffle the options
  return allOptions.sort(() => Math.random() - 0.5);
}

/**
 * Validate question data integrity
 * @param question Question to validate
 * @returns Object with validation results
 */
export function validateQuestion(question: Question): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!question.id) errors.push('Missing question ID');
  if (!question.lemma?.trim()) errors.push('Missing lemma');
  if (!question.sense?.trim()) errors.push('Missing sense');
  if (typeof question.wordNumber !== 'number' || question.wordNumber < 1) {
    errors.push('Invalid word number');
  }
  if (!question.meaningId?.trim()) errors.push('Missing meaning ID');
  if (!Array.isArray(question.examples)) errors.push('Examples must be an array');

  // Validate examples if present
  if (question.examples && question.examples.length > 0) {
    question.examples.forEach((example, index) => {
      if (!example.jp?.trim()) {
        errors.push(`Example ${index + 1} missing Japanese text`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate statistics for a question pool
 * @param questions Array of questions
 * @returns Statistics object
 */
export function calculateQuestionStats(questions: Question[]): {
  totalQuestions: number;
  totalWords: number;
  wordsWithExamples: number;
  averageExamplesPerWord: number;
  wordNumberRange: { min: number; max: number } | null;
  modesSupported: Mode[];
} {
  const totalQuestions = questions.length;
  const wordNumbers = new Set<number>();
  let totalExamples = 0;
  let wordsWithExamples = 0;

  for (const question of questions) {
    wordNumbers.add(question.wordNumber);
    if (question.examples && question.examples.length > 0) {
      wordsWithExamples++;
      totalExamples += question.examples.length;
    }
  }

  const totalWords = wordNumbers.size;
  const wordNumberArray = Array.from(wordNumbers).sort((a, b) => a - b);

  // Determine supported modes
  const modesSupported: Mode[] = ["word2sense", "sense2word"];
  if (questions.some(q => q.examples && q.examples.length > 0)) {
    const hasJapaneseExamples = questions.some(q =>
      q.examples && q.examples.some(ex => ex.jp)
    );
    const hasTranslations = questions.some(q =>
      q.examples && q.examples.some(ex => ex.translation)
    );

    if (hasJapaneseExamples) modesSupported.push("example2sense_jp");
    if (hasTranslations) modesSupported.push("example2sense_tr");
  }

  return {
    totalQuestions,
    totalWords,
    wordsWithExamples,
    averageExamplesPerWord: totalWords > 0 ? totalExamples / totalWords : 0,
    wordNumberRange: wordNumberArray.length > 0
      ? { min: wordNumberArray[0], max: wordNumberArray[wordNumberArray.length - 1] }
      : null,
    modesSupported
  };
}