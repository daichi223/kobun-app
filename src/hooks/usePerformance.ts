import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance monitoring hook for tracking app metrics
 *
 * This hook provides utilities to monitor and report on various
 * performance metrics including:
 * - Page load times
 * - User interaction latency
 * - Memory usage
 * - Component render times
 * - SRS algorithm performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  sampleRate?: number;
}

export function usePerformance(config: PerformanceConfig = {}) {
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    enableReporting = false,
    sampleRate = 1.0
  } = config;

  const metricsRef = useRef<PerformanceMetric[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Initialize performance observer
  useEffect(() => {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          // Filter out irrelevant entries
          if (entry.entryType === 'measure' ||
              entry.entryType === 'navigation' ||
              (entry.entryType === 'paint' && entry.name.includes('contentful'))) {

            const metric: PerformanceMetric = {
              name: entry.name,
              value: entry.duration || entry.startTime,
              timestamp: Date.now(),
              metadata: {
                entryType: entry.entryType,
                ...(entry.entryType === 'navigation' && {
                  domContentLoaded: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd,
                  loadComplete: (entry as PerformanceNavigationTiming).loadEventEnd
                })
              }
            };

            metricsRef.current.push(metric);

            if (enableLogging) {
              console.log(`📊 Performance: ${entry.name} = ${Math.round(metric.value)}ms`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      observerRef.current = observer;

      return () => {
        observer.disconnect();
      };
    } catch (error) {
      console.warn('Failed to initialize PerformanceObserver:', error);
    }
  }, [enableLogging]);

  // Measure function execution time
  const measure = useCallback((name: string, fn: () => void | Promise<void>) => {
    if (Math.random() > sampleRate) return;

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `measure-${name}`;

    performance.mark(startMark);

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
      });
    } else {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      return result;
    }
  }, [sampleRate]);

  // Mark specific events
  const mark = useCallback((name: string, metadata?: Record<string, any>) => {
    if (Math.random() > sampleRate) return;

    performance.mark(name);

    const metric: PerformanceMetric = {
      name,
      value: performance.now(),
      timestamp: Date.now(),
      metadata
    };

    metricsRef.current.push(metric);

    if (enableLogging) {
      console.log(`📍 Performance Mark: ${name}`, metadata);
    }
  }, [enableLogging, sampleRate]);

  // Measure time between two events
  const measureBetween = useCallback((startName: string, endName: string, measureName?: string) => {
    const name = measureName || `${startName}-to-${endName}`;

    try {
      performance.measure(name, startName, endName);
    } catch (error) {
      console.warn(`Failed to measure between ${startName} and ${endName}:`, error);
    }
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    performance.clearMarks();
    performance.clearMeasures();
  }, []);

  // Report metrics (placeholder for analytics service)
  const reportMetrics = useCallback((metrics?: PerformanceMetric[]) => {
    if (!enableReporting) return;

    const metricsToReport = metrics || metricsRef.current;

    // In a real app, this would send to your analytics service
    console.log('📈 Reporting metrics:', metricsToReport);

    // Example: Send to analytics service
    // analyticsService.track('performance_metrics', {
    //   metrics: metricsToReport,
    //   userAgent: navigator.userAgent,
    //   timestamp: Date.now()
    // });
  }, [enableReporting]);

  // Get performance summary
  const getSummary = useCallback(() => {
    const metrics = metricsRef.current;
    const summary = {
      totalMetrics: metrics.length,
      avgValue: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length : 0,
      slowestMetric: metrics.reduce((slowest, current) =>
        current.value > slowest.value ? current : slowest,
        metrics[0] || { name: 'none', value: 0, timestamp: 0 }
      ),
      recentMetrics: metrics.slice(-10) // Last 10 metrics
    };

    return summary;
  }, []);

  return {
    measure,
    mark,
    measureBetween,
    getMetrics,
    clearMetrics,
    reportMetrics,
    getSummary
  };
}

/**
 * Hook for monitoring React component render performance
 */
export function useRenderPerformance(componentName: string, deps: any[] = []) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const { mark, measure } = usePerformance();

  useEffect(() => {
    renderCountRef.current++;
    const renderTime = performance.now();

    if (lastRenderTimeRef.current > 0) {
      const timeBetweenRenders = renderTime - lastRenderTimeRef.current;

      mark(`${componentName}-render-${renderCountRef.current}`, {
        renderCount: renderCountRef.current,
        timeSinceLastRender: timeBetweenRenders,
        deps: deps.length
      });
    }

    lastRenderTimeRef.current = renderTime;
  });

  const measureRender = useCallback((renderFunction: () => void) => {
    return measure(`${componentName}-render-execution`, renderFunction);
  }, [componentName, measure]);

  return {
    renderCount: renderCountRef.current,
    measureRender
  };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitoring() {
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }, []);

  const logMemoryUsage = useCallback((label?: string) => {
    const memInfo = getMemoryInfo();
    if (memInfo) {
      console.log(`🧠 Memory ${label || 'Usage'}:`, {
        used: `${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memInfo.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)}MB`,
        usage: `${Math.round(memInfo.usedPercentage)}%`
      });
    }
  }, [getMemoryInfo]);

  return {
    getMemoryInfo,
    logMemoryUsage
  };
}

export default usePerformance;