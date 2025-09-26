import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock data for testing
const mockWordData = [
  {
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
  },
  {
    lemma: "をかし",
    meanings: [
      {
        sense: "面白い",
        examples: [
          {
            jp: "をかしき物語",
            translation: "面白い物語"
          }
        ]
      }
    ]
  },
  {
    lemma: "つれづれ",
    meanings: [
      {
        sense: "退屈",
        examples: [
          {
            jp: "つれづれなるままに",
            translation: "退屈なので"
          }
        ]
      }
    ]
  }
]

const mockJSONL = mockWordData.map(word => JSON.stringify(word)).join('\n')

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true)
})

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Setup successful fetch mock
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockJSONL)
    } as Response)

    // Setup localStorage mock
    localStorageMock.getItem.mockReturnValue('{}')
    localStorageMock.setItem.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  describe('Data Loading', () => {
    it('should load and display quiz data successfully', async () => {
      render(<App />)

      // Should show loading state initially
      expect(screen.getByText('語彙データを読み込み中...')).toBeInTheDocument()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })

      // Should show quiz interface
      expect(screen.getByText('クイズ設定')).toBeInTheDocument()
      expect(screen.getByText('問題 1 /')).toBeInTheDocument()
    })

    it('should handle data loading errors gracefully', async () => {
      // Mock fetch to fail
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Fallback failed'))

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('読み込みエラー')).toBeInTheDocument()
      })

      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })

    it('should fallback to secondary data source', async () => {
      // Mock primary source to fail, secondary to succeed
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockJSONL)
        } as Response)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })

      // Verify both URLs were attempted
      expect(fetch).toHaveBeenNthCalledWith(1, '/kobun_q.jsonl')
      expect(fetch).toHaveBeenNthCalledWith(2, '/kobun_words.jsonl')
    })
  })

  describe('Quiz Mode Selection', () => {
    beforeEach(async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })
    })

    it('should switch between different quiz modes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const modeSelect = screen.getByDisplayValue('古語 → 意味')

      // Switch to sense2word mode
      await user.selectOptions(modeSelect, 'sense2word')
      expect(screen.getByDisplayValue('意味 → 古語')).toBeInTheDocument()

      // Switch to example mode
      await user.selectOptions(modeSelect, 'example2sense_jp')
      expect(screen.getByDisplayValue('例文 → 意味')).toBeInTheDocument()
    })

    it('should filter questions appropriately for example modes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Switch to example mode
      const modeSelect = screen.getByDisplayValue('古語 → 意味')
      await user.selectOptions(modeSelect, 'example2sense_jp')

      // Should show questions with examples only
      await waitFor(() => {
        expect(screen.getByText(/総問題数:/)).toBeInTheDocument()
      })

      // All mock data has examples, so should show all questions
      expect(screen.getByText('4問')).toBeInTheDocument() // Total questions with examples
    })
  })

  describe('Quiz Flow - Word2Sense Mode', () => {
    beforeEach(async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })
    })

    it('should complete a full quiz session with correct answers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Should show first question
      expect(screen.getByText('問題 1 /')).toBeInTheDocument()

      // Find the question word (should be one of our mock words)
      const questionElements = screen.getAllByText(/あはれ|をかし|つれづれ/)
      expect(questionElements.length).toBeGreaterThan(0)

      // Find and click a choice button
      const choiceButtons = screen.getAllByRole('button').filter(button =>
        button.textContent &&
        (button.textContent.includes('しみじみとした情趣') ||
         button.textContent.includes('悲しみ') ||
         button.textContent.includes('面白い') ||
         button.textContent.includes('退屈'))
      )

      expect(choiceButtons.length).toBe(4) // Should have 4 choice buttons

      // Click the first choice
      await user.click(choiceButtons[0])

      // Should show feedback
      await waitFor(() => {
        const feedback = screen.queryByText(/正解|不正解/)
        expect(feedback).toBeInTheDocument()
      })
    })

    it('should handle incorrect answers appropriately', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Mock Math.random to ensure we get predictable wrong answer
      const originalRandom = Math.random
      let randomCallCount = 0
      Math.random = vi.fn(() => {
        randomCallCount++
        return 0.1 // This should select a distractor
      })

      try {
        // Get all choice buttons
        const choiceButtons = screen.getAllByRole('button').filter(button =>
          button.textContent &&
          (button.textContent.includes('しみじみとした情趣') ||
           button.textContent.includes('悲しみ') ||
           button.textContent.includes('面白い') ||
           button.textContent.includes('退屈'))
        )

        if (choiceButtons.length > 0) {
          await user.click(choiceButtons[1]) // Click second choice

          // Should show feedback (either correct or incorrect)
          await waitFor(() => {
            const feedback = screen.queryByText(/正解|不正解/)
            expect(feedback).toBeInTheDocument()
          })

          // If incorrect, should show next button
          const incorrectFeedback = screen.queryByText(/不正解/)
          if (incorrectFeedback) {
            expect(screen.getByText('次の問題へ →')).toBeInTheDocument()
          }
        }
      } finally {
        Math.random = originalRandom
      }
    })

    it('should advance automatically for correct answers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Mock to ensure correct answer selection
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.9) // High value to get correct answer

      try {
        const choiceButtons = screen.getAllByRole('button').filter(button =>
          button.textContent &&
          (button.textContent.includes('しみじみとした情趣') ||
           button.textContent.includes('悲しみ') ||
           button.textContent.includes('面白い') ||
           button.textContent.includes('退屈'))
        )

        if (choiceButtons.length > 0) {
          const initialQuestionNumber = screen.getByText(/問題 \d+ \//).textContent

          await user.click(choiceButtons[0])

          // Wait for correct feedback
          await waitFor(() => {
            expect(screen.queryByText('✅ 正解！')).toBeInTheDocument()
          })

          // Advance time to trigger auto-advance
          vi.advanceTimersByTime(1100)

          // Should advance to next question or show completion
          await waitFor(() => {
            const currentQuestionNumber = screen.queryByText(/問題 \d+ \//)?.textContent
            const completionMessage = screen.queryByText('クイズ完了！')

            expect(
              currentQuestionNumber !== initialQuestionNumber || completionMessage
            ).toBe(true)
          })
        }
      } finally {
        Math.random = originalRandom
      }
    })
  })

  describe('SRS Integration', () => {
    beforeEach(async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })
    })

    it('should save SRS statistics after answering questions', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      const choiceButtons = screen.getAllByRole('button').filter(button =>
        button.textContent &&
        (button.textContent.includes('しみじみとした情趣') ||
         button.textContent.includes('悲しみ') ||
         button.textContent.includes('面白い') ||
         button.textContent.includes('退屈'))
      )

      if (choiceButtons.length > 0) {
        await user.click(choiceButtons[0])

        // Wait for the answer to be processed
        await waitFor(() => {
          expect(screen.queryByText(/正解|不正解/)).toBeInTheDocument()
        })

        // Should have called localStorage.setItem to save stats
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'kobun.srs.v1',
          expect.stringContaining('ef')
        )
      }
    })

    it('should load existing SRS statistics on app start', async () => {
      // Mock existing SRS data
      const existingStats = {
        'あはれ|しみじみとした情趣': {
          ef: 2.3,
          reps: 2,
          interval: 6,
          dueAt: Date.now() - 1000,
          last: Date.now() - 1000 * 60 * 60 * 24 * 6
        }
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingStats))

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })

      // Should load stats from localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kobun.srs.v1')

      // Should show due count > 0 since we have an overdue item
      await waitFor(() => {
        expect(screen.getByText(/復習予定:/)).toBeInTheDocument()
      })
    })

    it('should reset SRS statistics when requested', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      const resetButton = screen.getByText('学習記録をリセット')
      await user.click(resetButton)

      // Should call window.confirm
      expect(window.confirm).toHaveBeenCalled()

      // Should clear localStorage (called via setState effect)
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('kobun.srs.v1', '{}')
      })
    })
  })

  describe('Settings and Configuration', () => {
    beforeEach(async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })
    })

    it('should update quiz settings correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Change range
      const rangeInput = screen.getByDisplayValue('1-50')
      await user.clear(rangeInput)
      await user.type(rangeInput, '1-20')

      // Change number of questions
      const questionSelect = screen.getByDisplayValue('10問')
      await user.selectOptions(questionSelect, '5')

      expect(rangeInput).toHaveValue('1-20')
      expect(screen.getByDisplayValue('5問')).toBeInTheDocument()
    })

    it('should start new quiz session when settings change', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      const startButton = screen.getByText('新しいクイズセット')

      // Get initial question
      const initialQuestion = screen.getByText(/問題 \d+ \//).textContent

      // Click start new session
      await user.click(startButton)

      // Should reset to question 1
      await waitFor(() => {
        expect(screen.getByText('問題 1 /')).toBeInTheDocument()
      })
    })

    it('should handle invalid range input gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      const rangeInput = screen.getByDisplayValue('1-50')
      await user.clear(rangeInput)
      await user.type(rangeInput, 'invalid-range')

      // Should not crash and should continue showing questions
      expect(screen.getByText(/問題 \d+ \//)).toBeInTheDocument()
    })
  })

  describe('Quiz Completion', () => {
    beforeEach(async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })

      // Set to 1 question for quick completion
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const questionSelect = screen.getByDisplayValue('10問')
      await user.selectOptions(questionSelect, '5')
    })

    it('should show completion screen after finishing all questions', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Answer questions until completion
      for (let i = 0; i < 5; i++) {
        const choiceButtons = screen.getAllByRole('button').filter(button =>
          button.textContent &&
          (button.textContent.includes('しみじみとした情趣') ||
           button.textContent.includes('悲しみ') ||
           button.textContent.includes('面白い') ||
           button.textContent.includes('退屈'))
        )

        if (choiceButtons.length > 0) {
          await user.click(choiceButtons[0])

          // Wait for feedback
          await waitFor(() => {
            expect(screen.queryByText(/正解|不正解/)).toBeInTheDocument()
          })

          // If incorrect, click next button
          const nextButton = screen.queryByText('次の問題へ →')
          if (nextButton) {
            await user.click(nextButton)
          } else {
            // Auto-advance for correct answers
            vi.advanceTimersByTime(1100)
          }

          // Check if quiz is completed
          const completionMessage = screen.queryByText('クイズ完了！')
          if (completionMessage) {
            break
          }
        }
      }

      // Should show completion screen
      await waitFor(() => {
        expect(screen.getByText('クイズ完了！')).toBeInTheDocument()
      })

      // Should show score
      expect(screen.getByText(/正答率/)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw errors
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not crash on load
      expect(() => render(<App />)).not.toThrow()

      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })
    })

    it('should handle invalid JSONL data', async () => {
      // Mock fetch to return invalid JSONL
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid json\n{valid: "json"}')
      } as Response)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('語彙データを読み込み中...')).not.toBeInTheDocument()
      })

      // Should still show interface, just with fewer questions
      expect(screen.getByText('クイズ設定')).toBeInTheDocument()
    })
  })
})