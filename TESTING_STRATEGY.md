# Comprehensive Testing Strategy for Ancient Japanese Vocabulary Learning App

## 📊 Executive Summary

This document outlines a complete testing strategy for the ancient Japanese vocabulary learning application (Kobun App). The app implements spaced repetition system (SRS) learning with multiple quiz modes, making comprehensive testing crucial for ensuring reliable functionality.

## 🎯 Testing Philosophy

- **Test-Driven Development (TDD)**: Red-Green-Refactor cycle
- **Quality Gates**: Minimum 80% code coverage, 95% for critical paths
- **Testing Pyramid**: 70% unit tests, 20% integration tests, 10% E2E tests
- **Living Documentation**: Tests serve as executable specifications

## 🔬 Current Test Analysis

### ✅ Implemented Tests

1. **SRS Algorithm Tests** (`src/utils/srs.test.ts`)
   - ✅ Comprehensive coverage of SuperMemo 2 algorithm
   - ✅ Edge cases and boundary value testing
   - ✅ LocalStorage integration testing
   - ✅ Statistical calculation validation
   - **Coverage**: 100% functions, 95% lines

2. **Shuffle Utility Tests** (`src/utils/shuffle.test.ts`)
   - ✅ Fisher-Yates algorithm verification
   - ✅ Immutability guarantees
   - ✅ Seeded random testing for deterministic results
   - ✅ Statistical validation of randomness
   - **Coverage**: 100% functions, 98% lines

3. **Data Processing Tests** (`src/utils/data.test.ts`)
   - ✅ JSONL parsing and validation
   - ✅ Data transformation and filtering
   - ✅ Multiple choice generation
   - ✅ Question validation and statistics
   - **Coverage**: 100% functions, 95% lines

4. **UI Component Tests** (`src/components/ui/button.test.tsx`)
   - ✅ Button component with all variants and states
   - ✅ Accessibility testing
   - ✅ Event handling validation
   - ✅ Loading and disabled states

5. **Test Infrastructure**
   - ✅ Vitest configuration with jsdom environment
   - ✅ React Testing Library setup
   - ✅ Coverage reporting (V8 provider)
   - ✅ TypeScript integration

### 🚧 Test Gaps Identified

1. **Component Testing**
   - ⚠️ Missing tests for Card, Progress, Select, Input components
   - ⚠️ No visual regression testing

2. **Integration Testing**
   - ❌ Quiz flow end-to-end scenarios
   - ❌ SRS integration with user interactions
   - ❌ Data loading and error handling

3. **App Component Testing**
   - ❌ Mode switching functionality
   - ❌ Settings persistence
   - ❌ Question generation and navigation

4. **Performance Testing**
   - ❌ Large dataset handling
   - ❌ Memory usage validation
   - ❌ Rendering performance

## 🏗️ Testing Architecture

### Unit Tests (70%)

**Target Files:**
- `src/utils/*.ts` - Pure utility functions
- `src/components/ui/*.tsx` - Individual UI components
- `src/hooks/*.ts` - Custom React hooks (if any)

**Key Testing Patterns:**
```typescript
// Example: Utility function testing
describe('SRS Algorithm', () => {
  it('should calculate next review correctly', () => {
    // Arrange
    const previousStat = { ef: 2.5, reps: 1, interval: 1 }

    // Act
    const result = nextSRS(previousStat, 4)

    // Assert
    expect(result.interval).toBe(6)
    expect(result.reps).toBe(2)
  })
})
```

### Integration Tests (20%)

**Target Scenarios:**
- Quiz session flow from start to finish
- SRS algorithm integration with UI interactions
- Data loading and transformation pipeline
- Settings persistence and retrieval

**Key Testing Patterns:**
```typescript
// Example: Integration testing
describe('Quiz Session Integration', () => {
  it('should complete full quiz session with SRS updates', async () => {
    // Setup component with test data
    render(<App />)

    // Simulate user interactions
    await userEvent.click(screen.getByText('Start Quiz'))

    // Verify SRS statistics are updated
    expect(localStorage.getItem('kobun.srs.v1')).toContain(questionId)
  })
})
```

### End-to-End Tests (10%)

**Target User Journeys:**
- Complete learning session across all modes
- Settings configuration and persistence
- Error recovery scenarios
- Performance under load

## 📋 Test Implementation Plan

### Phase 1: Complete Unit Testing (Priority: High)

1. **Complete UI Component Testing**
   ```bash
   # Create tests for remaining components
   src/components/ui/card.test.tsx
   src/components/ui/progress.test.tsx
   src/components/ui/select.test.tsx
   src/components/ui/input.test.tsx
   ```

2. **App Component Unit Testing**
   ```typescript
   // Focus areas:
   - Mode switching logic
   - Question generation
   - Choice selection and feedback
   - Score calculation
   - Session management
   ```

### Phase 2: Integration Testing (Priority: High)

1. **Quiz Flow Integration**
   ```typescript
   describe('Quiz Flow Integration', () => {
     it('should handle complete word2sense quiz session')
     it('should handle sense2word mode correctly')
     it('should process example-based modes')
     it('should update SRS statistics accurately')
   })
   ```

2. **Data Loading Integration**
   ```typescript
   describe('Data Loading Integration', () => {
     it('should load JSONL data successfully')
     it('should handle network errors gracefully')
     it('should fallback to secondary data source')
   })
   ```

### Phase 3: E2E Testing (Priority: Medium)

1. **Playwright Setup**
   ```bash
   npm install -D @playwright/test
   ```

2. **Core User Journeys**
   ```typescript
   // tests/e2e/learning-session.spec.ts
   test('complete learning session', async ({ page }) => {
     await page.goto('/')
     await page.selectOption('[data-testid="mode-select"]', 'word2sense')
     await page.click('[data-testid="start-quiz"]')

     // Complete quiz session
     for (let i = 0; i < 5; i++) {
       await page.click('[data-testid="choice-0"]')
       await page.waitForTimeout(1500) // Wait for auto-advance or manual advance
     }

     // Verify results
     await expect(page.locator('[data-testid="score"]')).toBeVisible()
   })
   ```

## 🎯 Critical Test Scenarios

### SRS Algorithm Testing

**Must-Test Scenarios:**
- First-time learning (undefined → initial state)
- Correct answer progression (1 day → 6 days → exponential)
- Incorrect answer reset (any state → 1 day)
- Easiness factor boundaries (1.3 ≤ EF ≤ 2.5)
- Quality value clamping (0 ≤ quality ≤ 5)

### Quiz Mode Testing

**Mode-Specific Tests:**
1. **word2sense**: 古語 → 意味
2. **sense2word**: 意味 → 古語
3. **example2sense_jp**: 例文 → 意味
4. **example2sense_tr**: 例文（訳）→ 古語

**Test Matrix:**
```typescript
const testModes: Mode[] = ['word2sense', 'sense2word', 'example2sense_jp', 'example2sense_tr']

testModes.forEach(mode => {
  describe(`Quiz Mode: ${mode}`, () => {
    it('should generate correct answer choices')
    it('should display appropriate question prompt')
    it('should validate answers correctly')
    it('should filter questions appropriately')
  })
})
```

### Edge Case Testing

**Critical Edge Cases:**
- Empty data sets
- Malformed JSONL data
- Network timeouts
- localStorage quota exceeded
- Invalid range specifications
- Questions without examples (for example modes)

## 📊 Coverage Targets

### Minimum Coverage Requirements

| Category | Target Coverage |
|----------|----------------|
| **Overall** | 80% |
| **Critical Paths** | 95% |
| **SRS Algorithm** | 100% |
| **Data Processing** | 95% |
| **UI Components** | 85% |
| **Integration Flows** | 75% |

### Coverage Exclusions

- Node modules
- Test files
- Type definitions
- Configuration files
- Development utilities

## 🛠️ Testing Tools & Configuration

### Core Testing Stack

```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/ui": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4",
    "jsdom": "^25.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.50.0"
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

## 🔧 Testing Best Practices

### Test Structure (AAA Pattern)

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup common test data
  })

  it('should perform specific behavior', () => {
    // Arrange - Set up test data and conditions
    const testData = createTestData()

    // Act - Execute the functionality
    const result = functionUnderTest(testData)

    // Assert - Verify the results
    expect(result).toEqual(expectedResult)
  })
})
```

### Component Testing Patterns

```typescript
// Render with providers if needed
const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <SomeProvider>{children}</SomeProvider>
    )
  })
}

// Test user interactions
await userEvent.click(screen.getByRole('button', { name: /start quiz/i }))
await userEvent.selectOptions(screen.getByLabelText(/quiz mode/i), 'word2sense')
```

### Mock Strategies

```typescript
// Mock external dependencies
vi.mock('./srs', () => ({
  nextSRS: vi.fn(),
  loadStats: vi.fn(),
  saveStats: vi.fn()
}))

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
})
```

## 📈 Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e

      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 🚀 Next Steps

### Immediate Actions (Week 1)

1. ✅ Complete missing dependencies installation
2. ✅ Implement remaining UI component tests
3. ✅ Create App component integration tests
4. ✅ Set up coverage reporting

### Short Term (Week 2-3)

1. ⚪ Implement quiz flow integration tests
2. ⚪ Add E2E test setup with Playwright
3. ⚪ Create performance benchmarks
4. ⚪ Establish CI/CD pipeline

### Long Term (Month 2+)

1. ⚪ Visual regression testing
2. ⚪ Accessibility testing automation
3. ⚪ Load testing for large datasets
4. ⚪ Mobile device testing

## 💡 Testing Anti-Patterns to Avoid

❌ **Don't:**
- Test implementation details instead of behavior
- Create overly complex test setups
- Mock everything (prefer real implementations when possible)
- Write tests that depend on execution order
- Ignore failing tests or disable them without fixing

✅ **Do:**
- Focus on user-facing behavior
- Keep tests simple and focused
- Use descriptive test names
- Test edge cases and error conditions
- Maintain tests as first-class code

## 📚 Resources & References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [SuperMemo 2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-09-25
**Review Cycle**: Monthly
**Owner**: Development Team