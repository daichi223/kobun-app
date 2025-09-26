import { useCallback, useEffect, useRef } from 'react';

/**
 * Keyboard navigation hook for better accessibility
 *
 * This hook provides comprehensive keyboard navigation support for the quiz application:
 * - Number keys (1-4) for answer selection
 * - Arrow keys for navigation
 * - Enter/Space for confirmation
 * - Escape for cancellation
 * - Tab navigation support
 * - Screen reader announcements
 */

export interface KeyboardNavigationConfig {
  enableNumberKeys?: boolean;
  enableArrowKeys?: boolean;
  enableShortcuts?: boolean;
  onAnswerSelect?: (index: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function useKeyboardNavigation(config: KeyboardNavigationConfig = {}) {
  const {
    enableNumberKeys = true,
    enableArrowKeys = true,
    enableShortcuts = true,
    onAnswerSelect,
    onNext,
    onPrevious,
    onSubmit,
    onCancel,
    disabled = false
  } = config;

  const selectedIndexRef = useRef<number>(-1);
  const isActiveRef = useRef<boolean>(true);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled || !isActiveRef.current) return;

    // Prevent default for keys we handle
    const handledKeys = ['1', '2', '3', '4', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape'];
    if (handledKeys.includes(event.key) || (event.key >= '1' && event.key <= '4')) {
      event.preventDefault();
    }

    switch (event.key) {
      // Number keys for answer selection
      case '1':
      case '2':
      case '3':
      case '4':
        if (enableNumberKeys && onAnswerSelect) {
          const index = parseInt(event.key) - 1;
          selectedIndexRef.current = index;
          onAnswerSelect(index);
          announceToScreenReader(`選択肢 ${event.key} を選択しました`);
        }
        break;

      // Arrow key navigation
      case 'ArrowUp':
        if (enableArrowKeys && selectedIndexRef.current > 0) {
          selectedIndexRef.current--;
          announceToScreenReader(`選択肢 ${selectedIndexRef.current + 1}`, true);
        }
        break;

      case 'ArrowDown':
        if (enableArrowKeys && selectedIndexRef.current < 3) {
          selectedIndexRef.current++;
          announceToScreenReader(`選択肢 ${selectedIndexRef.current + 1}`, true);
        }
        break;

      case 'ArrowLeft':
        if (enableArrowKeys && onPrevious) {
          onPrevious();
        }
        break;

      case 'ArrowRight':
        if (enableArrowKeys && onNext) {
          onNext();
        }
        break;

      // Action keys
      case 'Enter':
      case ' ':
        if (selectedIndexRef.current >= 0 && onAnswerSelect) {
          onAnswerSelect(selectedIndexRef.current);
        } else if (onSubmit) {
          onSubmit();
        }
        break;

      case 'Escape':
        if (onCancel) {
          onCancel();
        }
        selectedIndexRef.current = -1;
        break;

      // Shortcuts
      default:
        if (enableShortcuts && event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'n': // Ctrl/Cmd + N for new quiz
              if (onNext) {
                onNext();
              }
              break;
            case 'r': // Ctrl/Cmd + R for reset (prevent default browser refresh)
              event.preventDefault();
              if (onCancel) {
                onCancel();
              }
              break;
          }
        }
        break;
    }
  }, [
    disabled,
    enableNumberKeys,
    enableArrowKeys,
    enableShortcuts,
    onAnswerSelect,
    onNext,
    onPrevious,
    onSubmit,
    onCancel
  ]);

  // Set up keyboard listeners
  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  // Control navigation state
  const setActive = useCallback((active: boolean) => {
    isActiveRef.current = active;
  }, []);

  const resetSelection = useCallback(() => {
    selectedIndexRef.current = -1;
  }, []);

  const setSelectedIndex = useCallback((index: number) => {
    selectedIndexRef.current = index;
  }, []);

  return {
    selectedIndex: selectedIndexRef.current,
    setActive,
    resetSelection,
    setSelectedIndex
  };
}

/**
 * Screen reader announcement utility
 */
function announceToScreenReader(message: string, polite: boolean = false) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', polite ? 'polite' : 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);

  // Set text after a brief delay to ensure screen readers pick it up
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Focus management hook for better keyboard navigation
 */
export function useFocusManagement() {
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusedElementRef.current = activeElement;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusedElementRef.current && document.contains(focusedElementRef.current)) {
      focusedElementRef.current.focus();
    }
  }, []);

  const focusFirst = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const focusLast = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    trapFocus
  };
}

/**
 * Screen reader utilities hook
 */
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority === 'polite');
  }, []);

  const announcePageChange = useCallback((title: string) => {
    announce(`ページが変更されました: ${title}`, 'assertive');
  }, [announce]);

  const announceQuizStart = useCallback((mode: string, totalQuestions: number) => {
    announce(`クイズを開始します。モード: ${mode}、問題数: ${totalQuestions}問`, 'assertive');
  }, [announce]);

  const announceQuizEnd = useCallback((score: number, total: number) => {
    const accuracy = Math.round((score / total) * 100);
    announce(`クイズが終了しました。正答率: ${accuracy}%、${score}問正解中${total}問中`, 'assertive');
  }, [announce]);

  const announceAnswer = useCallback((isCorrect: boolean, correctAnswer?: string) => {
    if (isCorrect) {
      announce('正解です！', 'assertive');
    } else {
      announce(`不正解です。正解は ${correctAnswer} でした`, 'assertive');
    }
  }, [announce]);

  return {
    announce,
    announcePageChange,
    announceQuizStart,
    announceQuizEnd,
    announceAnswer
  };
}

export default useKeyboardNavigation;