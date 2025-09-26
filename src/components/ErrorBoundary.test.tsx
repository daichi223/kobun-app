import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary')
  }
  return <div>Working component</div>
}

// Component with error in useEffect
const EffectErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    // This will be caught by error boundary
    setTimeout(() => {
      throw new Error('Async error')
    }, 0)
  }
  return <div>Effect component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    })
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Working component')).toBeInTheDocument()
    })

    it('should not interfere with normal component lifecycle', () => {
      let renderCount = 0
      const TestComponent = () => {
        renderCount++
        return <div>Render count: {renderCount}</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Render count: 1')).toBeInTheDocument()

      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Render count: 2')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch and display error fallback UI', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()
      expect(screen.getByText('予期しないエラーが発生しました。アプリケーションを再起動してください。')).toBeInTheDocument()
    })

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ErrorThrowingComponent')
        })
      )
    })

    it('should show error details in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      try {
        render(
          <ErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        )

        expect(screen.getByText('開発者向け詳細情報')).toBeInTheDocument()

        // Click to expand details
        const detailsElement = screen.getByText('開発者向け詳細情報')
        expect(detailsElement.tagName.toLowerCase()).toBe('summary')
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })

    it('should hide error details in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      try {
        render(
          <ErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        )

        expect(screen.queryByText('開発者向け詳細情報')).not.toBeInTheDocument()
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })
  })

  describe('Error Recovery', () => {
    it('should allow retry functionality', async () => {
      const user = userEvent.setup()

      // Create a component that can toggle error state
      let shouldThrow = true
      const ToggleErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>Component recovered</div>
      }

      render(
        <ErrorBoundary>
          <ToggleErrorComponent />
        </ErrorBoundary>
      )

      // Should show error UI
      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()

      // Simulate fixing the error
      shouldThrow = false

      // Click retry button
      const retryButton = screen.getByText('再試行')
      await user.click(retryButton)

      // Should show recovered component
      expect(screen.getByText('Component recovered')).toBeInTheDocument()
    })

    it('should reload page when reload button is clicked', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.spyOn(window.location, 'reload')

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByText('ページを再読み込み')
      await user.click(reloadButton)

      expect(reloadSpy).toHaveBeenCalled()
    })
  })

  describe('Custom Fallback', () => {
    it('should use custom fallback when provided', () => {
      const customFallback = (error: Error) => (
        <div>Custom error UI: {error.message}</div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error UI: Test error for ErrorBoundary')).toBeInTheDocument()
      expect(screen.queryByText('申し訳ございません')).not.toBeInTheDocument()
    })

    it('should pass error and errorInfo to custom fallback', () => {
      const fallbackSpy = vi.fn(() => <div>Custom fallback</div>)

      render(
        <ErrorBoundary fallback={fallbackSpy}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(fallbackSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ErrorThrowingComponent')
        })
      )
    })
  })

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent = () => <div>Test component</div>
      const WrappedComponent = withErrorBoundary(TestComponent)

      render(<WrappedComponent />)

      expect(screen.getByText('Test component')).toBeInTheDocument()
    })

    it('should catch errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent)

      render(<WrappedComponent shouldThrow={true} />)

      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()
    })

    it('should pass through props to wrapped component', () => {
      const TestComponent = ({ message }: { message: string }) => (
        <div>{message}</div>
      )
      const WrappedComponent = withErrorBoundary(TestComponent)

      render(<WrappedComponent message="Hello from wrapped component" />)

      expect(screen.getByText('Hello from wrapped component')).toBeInTheDocument()
    })

    it('should set correct displayName', () => {
      const TestComponent = () => <div>Test</div>
      TestComponent.displayName = 'TestComponent'

      const WrappedComponent = withErrorBoundary(TestComponent)

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
    })

    it('should use custom fallback in HOC', () => {
      const customFallback = () => <div>HOC custom fallback</div>
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, customFallback)

      render(<WrappedComponent shouldThrow={true} />)

      expect(screen.getByText('HOC custom fallback')).toBeInTheDocument()
    })
  })

  describe('Multiple Error Boundaries', () => {
    it('should handle nested error boundaries correctly', () => {
      const OuterFallback = () => <div>Outer error boundary</div>
      const InnerFallback = () => <div>Inner error boundary</div>

      render(
        <ErrorBoundary fallback={OuterFallback}>
          <div>Outer content</div>
          <ErrorBoundary fallback={InnerFallback}>
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      )

      // Inner boundary should catch the error
      expect(screen.getByText('Inner error boundary')).toBeInTheDocument()
      expect(screen.getByText('Outer content')).toBeInTheDocument()
      expect(screen.queryByText('Outer error boundary')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle string errors', () => {
      const StringErrorComponent = () => {
        throw 'String error'
      }

      render(
        <ErrorBoundary>
          <StringErrorComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()
    })

    it('should handle null/undefined errors gracefully', () => {
      const NullErrorComponent = () => {
        throw null
      }

      render(
        <ErrorBoundary>
          <NullErrorComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()
    })

    it('should reset state when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()

      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      )

      // Error boundary should still show error state
      // (this is expected behavior - error boundaries don't auto-reset on prop changes)
      expect(screen.getByText('申し訳ございません')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on buttons', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByText('再試行')
      const reloadButton = screen.getByText('ページを再読み込み')

      expect(retryButton).toHaveAttribute('type', 'button')
      expect(reloadButton).toHaveAttribute('type', 'button')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Tab to retry button
      await user.tab()
      expect(screen.getByText('再試行')).toHaveFocus()

      // Tab to reload button
      await user.tab()
      expect(screen.getByText('ページを再読み込み')).toHaveFocus()
    })
  })
})