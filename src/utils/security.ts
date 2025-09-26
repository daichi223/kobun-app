/**
 * Security utilities for input sanitization and validation
 *
 * This module provides security measures to protect against:
 * - XSS attacks
 * - Injection attacks
 * - Malicious input
 * - Data corruption
 * - Privacy leaks
 */

/**
 * HTML escape map for XSS prevention
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text.replace(/[&<>"'`=\/]/g, (s) => HTML_ESCAPE_MAP[s]);
}

/**
 * Sanitize user input by removing potentially dangerous content
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Validate that a string contains only safe characters
 */
export function isValidInput(input: string, allowedPattern?: RegExp): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  // Default allowed pattern: alphanumeric, spaces, and common punctuation
  const defaultPattern = /^[a-zA-Z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-_.(),!?。、：；「」『』]+$/;
  const pattern = allowedPattern || defaultPattern;

  return pattern.test(input) && input.length <= 1000;
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T = any>(json: string, defaultValue: T | null = null): T | null {
  if (typeof json !== 'string' || json.trim() === '') {
    return defaultValue;
  }

  try {
    // Check for potential JSON bomb (deeply nested objects)
    if (json.length > 100000) {
      console.warn('JSON string too large, rejecting for security');
      return defaultValue;
    }

    // Count nesting depth to prevent stack overflow
    const maxDepth = 100;
    let depth = 0;
    let maxDepthFound = 0;

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      if (char === '{' || char === '[') {
        depth++;
        maxDepthFound = Math.max(maxDepthFound, depth);
      } else if (char === '}' || char === ']') {
        depth--;
      }

      if (maxDepthFound > maxDepth) {
        console.warn('JSON nesting too deep, rejecting for security');
        return defaultValue;
      }
    }

    const parsed = JSON.parse(json);

    // Additional validation for parsed object
    if (parsed && typeof parsed === 'object') {
      // Check for prototype pollution attempts
      if (parsed.hasOwnProperty('__proto__') ||
          parsed.hasOwnProperty('constructor') ||
          parsed.hasOwnProperty('prototype')) {
        console.warn('Potential prototype pollution detected, rejecting');
        return defaultValue;
      }
    }

    return parsed;
  } catch (error) {
    console.warn('JSON parsing failed:', error);
    return defaultValue;
  }
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(length: number = 16): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Validate localStorage data integrity
 */
export function validateLocalStorageData(key: string, expectedStructure?: any): boolean {
  try {
    const data = localStorage.getItem(key);
    if (!data) return false;

    const parsed = safeJsonParse(data);
    if (!parsed) return false;

    // If expected structure provided, validate it
    if (expectedStructure) {
      return validateStructure(parsed, expectedStructure);
    }

    return true;
  } catch (error) {
    console.warn(`localStorage validation failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Validate object structure against expected schema
 */
function validateStructure(obj: any, expected: any): boolean {
  if (typeof obj !== typeof expected) return false;

  if (Array.isArray(expected)) {
    if (!Array.isArray(obj)) return false;
    if (expected.length > 0) {
      return obj.every(item => validateStructure(item, expected[0]));
    }
    return true;
  }

  if (typeof expected === 'object' && expected !== null) {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const key in expected) {
      if (!obj.hasOwnProperty(key)) return false;
      if (!validateStructure(obj[key], expected[key])) return false;
    }

    return true;
  }

  return true;
}

/**
 * Secure localStorage wrapper with validation
 */
export const secureStorage = {
  setItem: (key: string, value: any): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      const jsonValue = JSON.stringify(value);

      if (jsonValue.length > 5 * 1024 * 1024) { // 5MB limit
        console.warn('Data too large for localStorage');
        return false;
      }

      localStorage.setItem(sanitizedKey, jsonValue);
      return true;
    } catch (error) {
      console.warn('Secure storage setItem failed:', error);
      return false;
    }
  },

  getItem: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      const data = localStorage.getItem(sanitizedKey);
      return safeJsonParse(data, defaultValue);
    } catch (error) {
      console.warn('Secure storage getItem failed:', error);
      return defaultValue;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.warn('Secure storage removeItem failed:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Secure storage clear failed:', error);
      return false;
    }
  }
};

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 100, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < this.windowMs);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }
}

/**
 * Content Security Policy utilities
 */
export const csp = {
  /**
   * Generate a nonce for inline scripts/styles
   */
  generateNonce: (): string => {
    return generateSecureId(32);
  },

  /**
   * Validate that a URL is safe for loading resources
   */
  isAllowedUrl: (url: string): boolean => {
    if (typeof url !== 'string') return false;

    try {
      const parsed = new URL(url);

      // Allow same origin
      if (parsed.origin === window.location.origin) return true;

      // Allow specific trusted domains
      const allowedDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com'
      ];

      return allowedDomains.includes(parsed.hostname);
    } catch {
      return false;
    }
  }
};

/**
 * Privacy-preserving analytics data sanitization
 */
export function sanitizeAnalyticsData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  // Remove potentially sensitive information
  const sensitiveKeys = [
    'ip', 'ipAddress', 'email', 'username', 'userId',
    'password', 'token', 'session', 'cookie'
  ];

  sensitiveKeys.forEach(key => {
    delete sanitized[key];
  });

  // Sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeAnalyticsData(sanitized[key]);
    } else if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key], 500);
    }
  });

  return sanitized;
}

export default {
  escapeHtml,
  sanitizeInput,
  isValidInput,
  safeJsonParse,
  generateSecureId,
  validateLocalStorageData,
  secureStorage,
  RateLimiter,
  csp,
  sanitizeAnalyticsData
};