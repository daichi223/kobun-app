# Testing Setup Instructions

## Quick Start

To get the full testing suite running, install the missing dependencies:

```bash
# Install core testing dependencies
npm install -D vitest@latest jsdom@latest @vitest/ui@latest @vitest/coverage-v8@latest

# Install React testing utilities
npm install -D @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest

# Install E2E testing framework
npm install -D @playwright/test@latest

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all unit and integration tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Coverage Reports

After running `npm run test:coverage`, open `/coverage/index.html` to view detailed coverage reports.

## Test Files Created

### Unit Tests
- `/src/utils/srs.test.ts` - SRS algorithm comprehensive testing
- `/src/utils/shuffle.test.ts` - Shuffle utility testing with statistical validation
- `/src/utils/data.test.ts` - Data processing and validation testing
- `/src/components/ui/button.test.tsx` - Button component testing

### Integration Tests
- `/src/App.test.tsx` - Full app integration testing covering all quiz modes

### E2E Tests
- `/tests/e2e/learning-session.spec.ts` - Complete user journey testing

### Utility Files
- `/src/utils/srs.ts` - Enhanced SRS utility with proper TypeScript types
- `/src/utils/shuffle.ts` - Enhanced shuffle utilities with seeded random
- `/src/utils/data.ts` - Data processing utilities

### Configuration
- `/vitest.config.ts` - Vitest configuration with coverage
- `/playwright.config.ts` - Playwright E2E testing configuration
- `/package.json` - Updated with test scripts

### Documentation
- `/TESTING_STRATEGY.md` - Comprehensive testing strategy document
- `/TESTING_SETUP.md` - This setup guide

## Next Steps

1. Install dependencies and run initial tests
2. Add remaining UI component tests (Card, Progress, Select, Input)
3. Implement visual regression testing
4. Set up CI/CD pipeline with GitHub Actions
5. Add performance testing for large datasets

## Test Coverage Goals

- Overall: 80%+
- Critical paths (SRS, data processing): 95%+
- All utility functions: 100%

## Architecture Summary

The testing strategy follows the testing pyramid:
- **70% Unit Tests**: Fast, isolated tests for utilities and components
- **20% Integration Tests**: App-level testing with mocked dependencies
- **10% E2E Tests**: Full user journey validation with Playwright

All tests are configured with TypeScript support, proper mocking, and comprehensive coverage reporting.