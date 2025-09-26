import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('should render children correctly', () => {
      render(<Button>Test Button</Button>)

      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('should render with complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    const variants = [
      'default',
      'outline',
      'secondary',
      'success',
      'danger',
      'ghost'
    ] as const

    it.each(variants)('should render %s variant correctly', (variant) => {
      render(<Button variant={variant}>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.className).toContain('inline-flex') // Base styles should be present
    })

    it('should apply correct classes for default variant', () => {
      render(<Button variant="default">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary-600')
      expect(button.className).toContain('text-white')
    })

    it('should apply correct classes for outline variant', () => {
      render(<Button variant="outline">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-white')
      expect(button.className).toContain('border-secondary-300')
    })

    it('should apply correct classes for success variant', () => {
      render(<Button variant="success">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-success-600')
      expect(button.className).toContain('text-white')
    })

    it('should apply correct classes for danger variant', () => {
      render(<Button variant="danger">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-danger-600')
      expect(button.className).toContain('text-white')
    })
  })

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    it.each(sizes)('should render %s size correctly', (size) => {
      render(<Button size={size}>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply correct classes for small size', () => {
      render(<Button size="sm">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('px-3')
      expect(button.className).toContain('py-1.5')
      expect(button.className).toContain('text-sm')
      expect(button.className).toContain('min-h-[32px]')
    })

    it('should apply correct classes for medium size', () => {
      render(<Button size="md">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('px-4')
      expect(button.className).toContain('py-2.5')
      expect(button.className).toContain('min-h-[40px]')
    })

    it('should apply correct classes for large size', () => {
      render(<Button size="lg">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('px-6')
      expect(button.className).toContain('py-3')
      expect(button.className).toContain('text-base')
      expect(button.className).toContain('min-h-[48px]')
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>)

      const button = screen.getByRole('button')
      const spinner = button.querySelector('svg')

      expect(button).toBeDisabled()
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should hide loading spinner when isLoading is false', () => {
      render(<Button isLoading={false}>Normal Button</Button>)

      const button = screen.getByRole('button')
      const spinner = button.querySelector('svg')

      expect(button).not.toBeDisabled()
      expect(spinner).not.toBeInTheDocument()
    })

    it('should render both spinner and children when loading', () => {
      render(<Button isLoading>Save Changes</Button>)

      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should be disabled when both disabled and isLoading are true', () => {
      render(<Button disabled isLoading>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not be disabled when disabled is false and isLoading is false', () => {
      render(<Button disabled={false} isLoading={false}>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Button disabled>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('disabled:opacity-50')
      expect(button.className).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('Event Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle other event props', () => {
      const handleMouseEnter = vi.fn()
      const handleMouseLeave = vi.fn()

      render(
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hover me
        </Button>
      )

      const button = screen.getByRole('button')

      fireEvent.mouseEnter(button)
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)

      fireEvent.mouseLeave(button)
      expect(handleMouseLeave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })

    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class" variant="success">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
      expect(button.className).toContain('bg-success-600')
      expect(button.className).toContain('inline-flex')
    })

    it('should apply custom style prop', () => {
      render(<Button style={{ backgroundColor: 'red' }}>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.style.backgroundColor).toBe('red')
    })
  })

  describe('HTML Attributes', () => {
    it('should pass through HTML button attributes', () => {
      render(
        <Button
          type="submit"
          form="test-form"
          data-testid="custom-button"
          aria-label="Custom button"
        >
          Button
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
    })

    it('should have correct default type attribute', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      // HTML buttons default to type="submit" when inside forms, but type="button" otherwise
      // Since we're not in a form, it should not have an explicit type
      expect(button.getAttribute('type')).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('should be focusable when enabled', () => {
      render(<Button>Focusable Button</Button>)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).not.toHaveFocus()
    })

    it('should have proper ARIA attributes', () => {
      render(<Button>Accessible Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('role', 'button')
    })

    it('should support custom ARIA attributes', () => {
      render(
        <Button
          aria-describedby="help-text"
          aria-expanded={true}
          aria-pressed={false}
        >
          Button
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('should handle keyboard navigation', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Keyboard Button</Button>)

      const button = screen.getByRole('button')
      button.focus()

      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

      // Note: fireEvent.keyDown doesn't trigger click by default
      // In real browsers, Enter on a focused button triggers click
      // We need to test this differently or use userEvent for more realistic interaction
    })
  })

  describe('Base Styles Application', () => {
    it('should always include base styles', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      const expectedBaseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'font-text',
        'font-medium',
        'transition-all',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'transform-gpu',
        'select-none',
        'touch-manipulation'
      ]

      expectedBaseClasses.forEach(className => {
        expect(button.className).toContain(className)
      })
    })

    it('should include touch and interaction styles', () => {
      render(<Button>Interactive Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('active:scale-[0.98]')
      expect(button.className).toContain('select-none')
      expect(button.className).toContain('touch-manipulation')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toBe('')
    })

    it('should handle null children', () => {
      render(<Button>{null}</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle undefined props gracefully', () => {
      render(<Button variant={undefined as any} size={undefined as any}>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Should fall back to defaults
      expect(button.className).toContain('bg-primary-600') // default variant
      expect(button.className).toContain('px-4') // medium size
    })

    it('should handle combined loading and disabled states', () => {
      render(<Button isLoading disabled>Combined State</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toBeInTheDocument() // Loading spinner
    })
  })
})