import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  parseJSONL,
  transformWordsToQuestions,
  filterQuestionsByRange,
  filterQuestionsByMode,
  getCorrectAnswer,
  getQuestionPrompt,
  generateDistractors,
  createMultipleChoiceOptions,
  validateQuestion,
  calculateQuestionStats,
  type Word,
  type Question,
  type Mode
} from './data'

// Test data
const mockWord: Word = {
  lemma: "あはれ",
  meanings: [
    {
      sense: "しみじみとした情趣",
      examples: [
        {
          jp: "春の夜のあはれなること",
          translation: "春の夜のしみじみとした情趣"
        }
      ]
    },
    {
      sense: "悲しみ",
      examples: [
        {
          jp: "母のあはれを思ふ",
          translation: "母の悲しみを思う"
        }
      ]
    }
  ]
};

const mockQuestion: Question = {
  id: "あはれ|しみじみとした情趣",
  wordNumber: 1,
  meaningId: "1-1",
  lemma: "あはれ",
  sense: "しみじみとした情趣",
  examples: [
    {
      jp: "春の夜のあはれなること",
      translation: "春の夜のしみじみとした情趣"
    }
  ]
};

const mockQuestions: Question[] = [
  mockQuestion,
  {
    id: "あはれ|悲しみ",
    wordNumber: 1,
    meaningId: "1-2",
    lemma: "あはれ",
    sense: "悲しみ",
    examples: [
      {
        jp: "母のあはれを思ふ",
        translation: "母の悲しみを思う"
      }
    ]
  },
  {
    id: "をかし|面白い",
    wordNumber: 2,
    meaningId: "2-1",
    lemma: "をかし",
    sense: "面白い",
    examples: []
  },
  {
    id: "つれづれ|退屈",
    wordNumber: 3,
    meaningId: "3-1",
    lemma: "つれづれ",
    sense: "退屈",
    examples: [
      {
        jp: "つれづれなるままに",
        translation: "退屈なので"
      }
    ]
  }
];

describe('Data Utility Tests', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Math, 'random').mockRestore();
  });

  describe('parseJSONL function', () => {
    it('should parse valid JSONL text', () => {
      const jsonlText = `{"id": 1, "name": "test1"}
{"id": 2, "name": "test2"}
{"id": 3, "name": "test3"}`;

      const result = parseJSONL(jsonlText);

      expect(result).toEqual([
        { id: 1, name: "test1" },
        { id: 2, name: "test2" },
        { id: 3, name: "test3" }
      ]);
    });

    it('should handle empty lines', () => {
      const jsonlText = `{"id": 1}

{"id": 2}

{"id": 3}`;

      const result = parseJSONL(jsonlText);

      expect(result).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]);
    });

    it('should handle invalid JSON lines gracefully', () => {
      const jsonlText = `{"id": 1}
invalid json line
{"id": 2}`;

      const result = parseJSONL(jsonlText);

      expect(result).toEqual([
        { id: 1 },
        { id: 2 }
      ]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to parse JSONL line 2:',
        expect.any(Error)
      );
    });

    it('should handle empty input', () => {
      expect(parseJSONL('')).toEqual([]);
      expect(parseJSONL('   \n\n   ')).toEqual([]);
    });

    it('should preserve object types', () => {
      interface TestObject {
        id: number;
        name: string;
        active: boolean;
      }

      const jsonlText = `{"id": 1, "name": "test", "active": true}`;
      const result = parseJSONL<TestObject>(jsonlText);

      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe("test");
      expect(result[0].active).toBe(true);
    });
  });

  describe('transformWordsToQuestions function', () => {
    it('should transform words to questions correctly', () => {
      const words: Word[] = [mockWord];
      const result = transformWordsToQuestions(words);

      expect(result).toHaveLength(2); // Two meanings
      expect(result[0]).toEqual({
        id: "あはれ|しみじみとした情趣",
        wordNumber: 1,
        meaningId: "1-1",
        lemma: "あはれ",
        sense: "しみじみとした情趣",
        examples: mockWord.meanings[0].examples
      });
      expect(result[1]).toEqual({
        id: "あはれ|悲しみ",
        wordNumber: 1,
        meaningId: "1-2",
        lemma: "あはれ",
        sense: "悲しみ",
        examples: mockWord.meanings[1].examples
      });
    });

    it('should handle multiple words correctly', () => {
      const words: Word[] = [
        mockWord,
        {
          lemma: "をかし",
          meanings: [
            { sense: "面白い", examples: [] }
          ]
        }
      ];

      const result = transformWordsToQuestions(words);

      expect(result).toHaveLength(3); // 2 + 1 meanings
      expect(result[2]).toEqual({
        id: "をかし|面白い",
        wordNumber: 2,
        meaningId: "2-1",
        lemma: "をかし",
        sense: "面白い",
        examples: []
      });
    });

    it('should handle empty input', () => {
      expect(transformWordsToQuestions([])).toEqual([]);
    });

    it('should handle words with no examples', () => {
      const words: Word[] = [{
        lemma: "test",
        meanings: [{ sense: "test sense" }]
      }];

      const result = transformWordsToQuestions(words);

      expect(result[0].examples).toEqual([]);
    });
  });

  describe('filterQuestionsByRange function', () => {
    it('should filter questions by valid range', () => {
      const result = filterQuestionsByRange(mockQuestions, "1-2");

      expect(result).toHaveLength(3);
      expect(result.every(q => q.wordNumber >= 1 && q.wordNumber <= 2)).toBe(true);
    });

    it('should handle single word ranges', () => {
      const result = filterQuestionsByRange(mockQuestions, "2-2");

      expect(result).toHaveLength(1);
      expect(result[0].wordNumber).toBe(2);
    });

    it('should return empty array for invalid ranges', () => {
      const result = filterQuestionsByRange(mockQuestions, "5-3");

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid range: start > end',
        { start: 5, end: 3 }
      );
    });

    it('should handle invalid range format', () => {
      const result = filterQuestionsByRange(mockQuestions, "invalid");

      expect(result).toBe(mockQuestions); // Returns original array
      expect(console.warn).toHaveBeenCalledWith('Invalid range format:', 'invalid');
    });

    it('should handle ranges with whitespace', () => {
      const result = filterQuestionsByRange(mockQuestions, "  1  -  2  ");

      expect(result).toHaveLength(3);
    });

    it('should handle out-of-bounds ranges', () => {
      const result = filterQuestionsByRange(mockQuestions, "10-20");

      expect(result).toEqual([]);
    });
  });

  describe('filterQuestionsByMode function', () => {
    it('should return all questions for word2sense mode', () => {
      const result = filterQuestionsByMode(mockQuestions, "word2sense");

      expect(result).toEqual(mockQuestions);
    });

    it('should return all questions for sense2word mode', () => {
      const result = filterQuestionsByMode(mockQuestions, "sense2word");

      expect(result).toEqual(mockQuestions);
    });

    it('should filter questions with Japanese examples for example2sense_jp mode', () => {
      const result = filterQuestionsByMode(mockQuestions, "example2sense_jp");

      // Should exclude "をかし" which has no examples
      expect(result).toHaveLength(3);
      expect(result.every(q => q.examples && q.examples.length > 0)).toBe(true);
    });

    it('should filter questions with translations for example2sense_tr mode', () => {
      const result = filterQuestionsByMode(mockQuestions, "example2sense_tr");

      // Should exclude "をかし" which has no examples
      expect(result).toHaveLength(3);
      expect(result.every(q =>
        q.examples &&
        q.examples.length > 0 &&
        q.examples.some(ex => ex.translation)
      )).toBe(true);
    });

    it('should handle questions without examples properly', () => {
      const questionsWithoutExamples: Question[] = [{
        id: "test|test",
        wordNumber: 1,
        meaningId: "1-1",
        lemma: "test",
        sense: "test",
        examples: []
      }];

      const jpResult = filterQuestionsByMode(questionsWithoutExamples, "example2sense_jp");
      const trResult = filterQuestionsByMode(questionsWithoutExamples, "example2sense_tr");

      expect(jpResult).toEqual([]);
      expect(trResult).toEqual([]);
    });
  });

  describe('getCorrectAnswer function', () => {
    const modes: Mode[] = ["word2sense", "sense2word", "example2sense_jp", "example2sense_tr"];

    it.each([
      ["word2sense", mockQuestion.sense],
      ["sense2word", mockQuestion.lemma],
      ["example2sense_jp", mockQuestion.sense],
      ["example2sense_tr", mockQuestion.lemma]
    ] as const)('should return correct answer for %s mode', (mode, expected) => {
      expect(getCorrectAnswer(mockQuestion, mode)).toBe(expected);
    });
  });

  describe('getQuestionPrompt function', () => {
    it('should return lemma for word2sense mode', () => {
      expect(getQuestionPrompt(mockQuestion, "word2sense")).toBe(mockQuestion.lemma);
    });

    it('should return sense for sense2word mode', () => {
      expect(getQuestionPrompt(mockQuestion, "sense2word")).toBe(mockQuestion.sense);
    });

    it('should return Japanese example for example2sense_jp mode', () => {
      const result = getQuestionPrompt(mockQuestion, "example2sense_jp");
      expect(result).toBe("春の夜のあはれなること");
    });

    it('should return translation for example2sense_tr mode', () => {
      const result = getQuestionPrompt(mockQuestion, "example2sense_tr");
      expect(result).toBe("春の夜のしみじみとした情趣");
    });

    it('should handle missing examples gracefully', () => {
      const questionWithoutExamples: Question = {
        ...mockQuestion,
        examples: []
      };

      expect(getQuestionPrompt(questionWithoutExamples, "example2sense_jp"))
        .toBe("例文がありません");
      expect(getQuestionPrompt(questionWithoutExamples, "example2sense_tr"))
        .toBe("現代語訳がありません");
    });

    it('should handle missing translation gracefully', () => {
      const questionWithoutTranslation: Question = {
        ...mockQuestion,
        examples: [{ jp: "test", translation: undefined }]
      };

      expect(getQuestionPrompt(questionWithoutTranslation, "example2sense_tr"))
        .toBe("現代語訳がありません");
    });
  });

  describe('generateDistractors function', () => {
    it('should generate correct number of distractors', () => {
      const result = generateDistractors(mockQuestions[0], mockQuestions, "word2sense", 2);

      expect(result).toHaveLength(2);
      expect(result).not.toContain(mockQuestions[0].sense);
    });

    it('should not include the correct answer', () => {
      const result = generateDistractors(mockQuestions[0], mockQuestions, "word2sense", 3);

      expect(result).not.toContain("しみじみとした情趣");
    });

    it('should handle insufficient distractors gracefully', () => {
      const smallPool: Question[] = [mockQuestions[0]]; // Only one question
      const result = generateDistractors(mockQuestions[0], smallPool, "word2sense", 3);

      expect(result).toHaveLength(0); // No other questions to use as distractors
    });

    it('should remove duplicates', () => {
      const questionsWithDuplicates: Question[] = [
        ...mockQuestions,
        // Add duplicate sense
        {
          id: "duplicate|悲しみ",
          wordNumber: 4,
          meaningId: "4-1",
          lemma: "duplicate",
          sense: "悲しみ", // Same as mockQuestions[1]
          examples: []
        }
      ];

      const result = generateDistractors(
        mockQuestions[0],
        questionsWithDuplicates,
        "word2sense",
        10
      );

      const uniqueAnswers = new Set(result);
      expect(uniqueAnswers.size).toBe(result.length);
    });

    it('should work with different modes', () => {
      const resultWordMode = generateDistractors(mockQuestions[0], mockQuestions, "sense2word", 2);
      const resultSenseMode = generateDistractors(mockQuestions[0], mockQuestions, "word2sense", 2);

      // For sense2word, distractors should be lemmas (not including "あはれ")
      expect(resultWordMode).not.toContain("あはれ");

      // For word2sense, distractors should be senses (not including current sense)
      expect(resultSenseMode).not.toContain("しみじみとした情趣");
    });
  });

  describe('createMultipleChoiceOptions function', () => {
    beforeEach(() => {
      // Mock Math.random for predictable results
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        return callCount * 0.1; // Deterministic sequence
      });
    });

    it('should create correct number of options', () => {
      const result = createMultipleChoiceOptions(mockQuestions[0], mockQuestions, "word2sense", 4);

      expect(result).toHaveLength(4);
    });

    it('should include the correct answer', () => {
      const result = createMultipleChoiceOptions(mockQuestions[0], mockQuestions, "word2sense", 4);

      expect(result).toContain("しみじみとした情趣");
    });

    it('should handle fewer available options than requested', () => {
      const smallPool: Question[] = [mockQuestions[0], mockQuestions[1]]; // 2 questions
      const result = createMultipleChoiceOptions(mockQuestions[0], smallPool, "word2sense", 4);

      // Should only have 2 options (1 correct + 1 distractor)
      expect(result).toHaveLength(2);
      expect(result).toContain("しみじみとした情趣"); // Correct answer
    });

    it('should work with different modes', () => {
      const wordModeResult = createMultipleChoiceOptions(mockQuestions[0], mockQuestions, "sense2word", 3);
      const senseModeResult = createMultipleChoiceOptions(mockQuestions[0], mockQuestions, "word2sense", 3);

      expect(wordModeResult).toContain("あはれ"); // Correct lemma
      expect(senseModeResult).toContain("しみじみとした情趣"); // Correct sense
    });
  });

  describe('validateQuestion function', () => {
    it('should validate correct question', () => {
      const result = validateQuestion(mockQuestion);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const invalidQuestion: Question = {
        id: "",
        wordNumber: 0,
        meaningId: "",
        lemma: "",
        sense: "",
        examples: []
      };

      const result = validateQuestion(invalidQuestion);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing question ID');
      expect(result.errors).toContain('Missing lemma');
      expect(result.errors).toContain('Missing sense');
      expect(result.errors).toContain('Invalid word number');
      expect(result.errors).toContain('Missing meaning ID');
    });

    it('should validate examples array', () => {
      const invalidQuestion: Question = {
        ...mockQuestion,
        examples: null as any
      };

      const result = validateQuestion(invalidQuestion);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Examples must be an array');
    });

    it('should validate example content', () => {
      const questionWithInvalidExamples: Question = {
        ...mockQuestion,
        examples: [
          { jp: "", translation: "test" },
          { jp: "valid", translation: "test" }
        ]
      };

      const result = validateQuestion(questionWithInvalidExamples);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Example 1 missing Japanese text');
      expect(result.errors).not.toContain('Example 2 missing Japanese text');
    });

    it('should handle whitespace-only values', () => {
      const questionWithWhitespace: Question = {
        ...mockQuestion,
        lemma: "   ",
        sense: "\t\n"
      };

      const result = validateQuestion(questionWithWhitespace);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing lemma');
      expect(result.errors).toContain('Missing sense');
    });
  });

  describe('calculateQuestionStats function', () => {
    it('should calculate basic statistics correctly', () => {
      const result = calculateQuestionStats(mockQuestions);

      expect(result.totalQuestions).toBe(4);
      expect(result.totalWords).toBe(3); // Unique word numbers: 1, 2, 3
      expect(result.wordsWithExamples).toBe(3); // All except "をかし"
      expect(result.wordNumberRange).toEqual({ min: 1, max: 3 });
    });

    it('should calculate average examples correctly', () => {
      const result = calculateQuestionStats(mockQuestions);

      // Total examples: 1+1+0+1 = 3, Total words: 3
      expect(result.averageExamplesPerWord).toBe(1);
    });

    it('should determine supported modes correctly', () => {
      const result = calculateQuestionStats(mockQuestions);

      expect(result.modesSupported).toContain("word2sense");
      expect(result.modesSupported).toContain("sense2word");
      expect(result.modesSupported).toContain("example2sense_jp");
      expect(result.modesSupported).toContain("example2sense_tr");
    });

    it('should handle questions without examples', () => {
      const questionsNoExamples: Question[] = [{
        ...mockQuestion,
        examples: []
      }];

      const result = calculateQuestionStats(questionsNoExamples);

      expect(result.wordsWithExamples).toBe(0);
      expect(result.averageExamplesPerWord).toBe(0);
      expect(result.modesSupported).toEqual(["word2sense", "sense2word"]);
    });

    it('should handle empty input', () => {
      const result = calculateQuestionStats([]);

      expect(result.totalQuestions).toBe(0);
      expect(result.totalWords).toBe(0);
      expect(result.wordsWithExamples).toBe(0);
      expect(result.averageExamplesPerWord).toBe(0);
      expect(result.wordNumberRange).toBeNull();
      expect(result.modesSupported).toEqual(["word2sense", "sense2word"]);
    });

    it('should detect partial mode support', () => {
      const questionsPartialSupport: Question[] = [{
        ...mockQuestion,
        examples: [{ jp: "test" }] // Missing translation
      }];

      const result = calculateQuestionStats(questionsPartialSupport);

      expect(result.modesSupported).toContain("example2sense_jp");
      expect(result.modesSupported).not.toContain("example2sense_tr");
    });

    it('should handle duplicate word numbers correctly', () => {
      const questionsWithDuplicates: Question[] = [
        { ...mockQuestion, wordNumber: 1 },
        { ...mockQuestion, id: "different", wordNumber: 1 }, // Same word number
        { ...mockQuestion, id: "another", wordNumber: 2 }
      ];

      const result = calculateQuestionStats(questionsWithDuplicates);

      expect(result.totalQuestions).toBe(3);
      expect(result.totalWords).toBe(2); // Only word numbers 1 and 2
    });
  });
});