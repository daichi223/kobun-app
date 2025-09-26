import { test, expect, Page } from '@playwright/test'

/**
 * End-to-End Tests for Ancient Japanese Vocabulary Learning App
 *
 * These tests simulate real user interactions to verify the complete
 * learning flow from start to finish across different quiz modes.
 */

// Test data helper
const TEST_DATA = {
  modes: [
    { value: 'word2sense', label: '古語 → 意味' },
    { value: 'sense2word', label: '意味 → 古語' },
    { value: 'example2sense_jp', label: '例文 → 意味' },
    { value: 'example2sense_tr', label: '例文（訳）→ 古語' }
  ],
  ranges: ['1-10', '1-50', '10-30'],
  questionCounts: [5, 10, 15, 20]
}

// Helper functions
class KobunApp {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.waitForDataLoad()
  }

  async waitForDataLoad() {
    // Wait for loading to complete
    await expect(this.page.getByText('語彙データを読み込み中...')).toBeHidden({ timeout: 30000 })

    // Ensure quiz interface is visible
    await expect(this.page.getByText('クイズ設定')).toBeVisible()
  }

  async selectMode(modeValue: string) {
    const modeSelect = this.page.getByLabel('出題形式')
    await modeSelect.selectOption(modeValue)

    // Wait a moment for the change to take effect
    await this.page.waitForTimeout(500)
  }

  async setRange(range: string) {
    const rangeInput = this.page.getByLabel('範囲')
    await rangeInput.fill(range)
    await this.page.waitForTimeout(500)
  }

  async setQuestionCount(count: number) {
    const questionSelect = this.page.getByLabel('問題数')
    await questionSelect.selectOption(`${count}`)
    await this.page.waitForTimeout(500)
  }

  async startNewSession() {
    await this.page.getByText('新しいクイズセット').click()
    await this.page.waitForTimeout(1000)
  }

  async getCurrentQuestion() {
    const questionText = await this.page.getByText(/問題 \d+ \//).textContent()
    return questionText
  }

  async getChoiceButtons() {
    // Wait for choices to load
    await this.page.waitForSelector('[role="button"]')

    // Get all buttons that look like quiz choices (avoid UI buttons)
    const allButtons = await this.page.getByRole('button').all()
    const choiceButtons = []

    for (const button of allButtons) {
      const text = await button.textContent()
      const className = await button.getAttribute('class')

      // Filter for choice buttons (they have specific styling classes)
      if (className?.includes('justify-start') && text && text.length > 2) {
        choiceButtons.push(button)
      }
    }

    return choiceButtons
  }

  async selectChoice(index: number) {
    const choices = await this.getChoiceButtons()
    expect(choices.length).toBeGreaterThan(index)
    await choices[index].click()
  }

  async waitForFeedback() {
    await expect(
      this.page.locator('text=/正解|不正解/')
    ).toBeVisible({ timeout: 5000 })
  }

  async clickNextButton() {
    const nextButton = this.page.getByText('次の問題へ →')
    if (await nextButton.isVisible()) {
      await nextButton.click()
    }
  }

  async waitForQuizCompletion() {
    await expect(this.page.getByText('クイズ完了！')).toBeVisible({ timeout: 30000 })
  }

  async getScore() {
    const scoreElement = await this.page.locator('text=/\d+\/\d+/').first()
    return await scoreElement.textContent()
  }

  async resetProgress() {
    await this.page.getByText('学習記録をリセット').click()

    // Handle confirmation dialog
    this.page.on('dialog', dialog => dialog.accept())
  }

  async getStatistics() {
    const dueCount = await this.page.getByText(/復習予定:/).locator('+ span').textContent()
    const newCount = await this.page.getByText(/未学習:/).locator('+ span').textContent()
    const totalCount = await this.page.getByText(/総問題数:/).locator('+ span').textContent()

    return {
      due: parseInt(dueCount || '0'),
      new: parseInt(newCount || '0'),
      total: parseInt(totalCount || '0')
    }
  }
}

test.describe('Learning Session E2E Tests', () => {
  let app: KobunApp

  test.beforeEach(async ({ page }) => {
    app = new KobunApp(page)
    await app.goto()
  })

  test('should complete a full word2sense learning session', async () => {
    // Set up quiz parameters
    await app.selectMode('word2sense')
    await app.setQuestionCount(5)
    await app.startNewSession()

    // Complete the quiz
    for (let i = 0; i < 5; i++) {
      // Verify we're on the correct question number
      const currentQuestion = await app.getCurrentQuestion()
      expect(currentQuestion).toContain(`問題 ${i + 1}`)

      // Select a choice
      await app.selectChoice(0)

      // Wait for feedback
      await app.waitForFeedback()

      // Click next if needed (for incorrect answers)
      await app.clickNextButton()

      // Wait a moment for auto-advance or manual advance
      await app.page.waitForTimeout(2000)

      // Check if quiz is completed
      const isCompleted = await app.page.getByText('クイズ完了！').isVisible()
      if (isCompleted) break
    }

    // Verify completion
    await app.waitForQuizCompletion()

    // Verify score is displayed
    const score = await app.getScore()
    expect(score).toMatch(/\d+\/\d+/)

    // Verify we can start a new session
    await expect(app.page.getByText('新しいクイズを始める')).toBeVisible()
  })

  test('should handle all quiz modes correctly', async () => {
    for (const mode of TEST_DATA.modes) {
      await app.selectMode(mode.value)
      await app.setQuestionCount(3) // Short quiz for testing

      // Verify mode is selected
      await expect(app.page.getByDisplayValue(mode.label)).toBeVisible()

      // Start quiz
      await app.startNewSession()

      // Verify quiz starts
      await expect(app.page.getByText('問題 1 /')).toBeVisible()

      // Answer one question
      await app.selectChoice(0)
      await app.waitForFeedback()

      // Move to next question or complete
      await app.clickNextButton()
      await app.page.waitForTimeout(1500)
    }
  })

  test('should persist SRS statistics across sessions', async () => {
    // Complete a short session
    await app.setQuestionCount(3)
    await app.startNewSession()

    // Get initial statistics
    const initialStats = await app.getStatistics()

    // Answer a few questions
    for (let i = 0; i < 2; i++) {
      await app.selectChoice(0)
      await app.waitForFeedback()
      await app.clickNextButton()
      await app.page.waitForTimeout(1500)

      // Check if completed
      const isCompleted = await app.page.getByText('クイズ完了！').isVisible()
      if (isCompleted) break
    }

    // Start a new session
    await app.startNewSession()

    // Verify statistics have changed (some questions should now have SRS data)
    const newStats = await app.getStatistics()

    // Either due count increased or new count decreased
    expect(newStats.due + newStats.new).toBeLessThanOrEqual(initialStats.new)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline
    await page.route('/kobun_q.jsonl', route => route.abort())
    await page.route('/kobun_words.jsonl', route => route.abort())

    await page.goto('/')

    // Should show error message
    await expect(page.getByText('読み込みエラー')).toBeVisible({ timeout: 10000 })

    // Error message should be helpful
    await expect(page.getByText(/kobun_q.jsonl または kobun_words.jsonl が見つかりません/)).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await app.goto()

    // Verify mobile layout
    await expect(app.page.getByText('古文単語学習')).toBeVisible()
    await expect(app.page.getByText('クイズ設定')).toBeVisible()

    // Test touch interactions
    await app.setQuestionCount(2)
    await app.startNewSession()

    // Tap on choice
    const choices = await app.getChoiceButtons()
    if (choices.length > 0) {
      await choices[0].tap()
      await app.waitForFeedback()
    }
  })

  test('should handle settings changes correctly', async () => {
    // Change range
    await app.setRange('1-20')

    // Change question count
    await app.setQuestionCount(7)

    // Verify settings are applied
    await expect(app.page.getByDisplayValue('1-20')).toBeVisible()
    await expect(app.page.getByDisplayValue('7問')).toBeVisible()

    // Start session with new settings
    await app.startNewSession()

    // Should start with question 1
    await expect(app.page.getByText('問題 1 / 7')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await app.setQuestionCount(2)
    await app.startNewSession()

    // Focus on first choice
    const choices = await app.getChoiceButtons()
    if (choices.length > 0) {
      await choices[0].focus()

      // Press Enter to select
      await page.keyboard.press('Enter')

      await app.waitForFeedback()
    }

    // Test Tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to navigate through interface
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should reset learning progress correctly', async () => {
    // Complete some questions to create SRS data
    await app.setQuestionCount(3)
    await app.startNewSession()

    for (let i = 0; i < 2; i++) {
      await app.selectChoice(0)
      await app.waitForFeedback()
      await app.clickNextButton()
      await app.page.waitForTimeout(1500)
    }

    // Get statistics before reset
    const beforeReset = await app.getStatistics()

    // Reset progress
    await app.resetProgress()
    await app.page.waitForTimeout(1000)

    // Start new session
    await app.startNewSession()

    // All questions should be new again
    const afterReset = await app.getStatistics()
    expect(afterReset.new).toBeGreaterThan(beforeReset.new)
    expect(afterReset.due).toBe(0)
  })

  test('should handle data loading performance', async ({ page }) => {
    // Monitor network requests
    const responses: any[] = []
    page.on('response', response => {
      if (response.url().includes('.jsonl')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        })
      }
    })

    await app.goto()

    // Verify data loaded in reasonable time
    expect(responses.length).toBeGreaterThan(0)

    // Should complete loading within timeout
    await expect(app.page.getByText('問題 1 /')).toBeVisible({ timeout: 10000 })
  })
})