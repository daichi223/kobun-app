import { useCallback, useRef, useEffect } from 'react';
import type { ReviewStat } from '../utils/srs';

/**
 * Analytics hook for tracking user learning behavior and app usage
 *
 * This hook provides privacy-respecting analytics that help understand:
 * - Learning patterns and progress
 * - Quiz completion rates
 * - Error rates and difficult words
 * - User engagement metrics
 * - Performance bottlenecks
 *
 * All data is anonymized and stored locally by default.
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  data?: Record<string, any>;
}

export interface LearningSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  mode: string;
  range: string;
  questionsAnswered: number;
  correctAnswers: number;
  totalQuestions: number;
  completedSession: boolean;
  averageResponseTime?: number;
  difficultWords: string[];
}

interface AnalyticsConfig {
  enableTracking?: boolean;
  enableLocalStorage?: boolean;
  sessionTimeout?: number; // minutes
  maxStoredSessions?: number;
}

const ANALYTICS_KEY = 'kobun.analytics.v1';
const SESSION_KEY = 'kobun.session.v1';

export function useAnalytics(config: AnalyticsConfig = {}) {
  const {
    enableTracking = true,
    enableLocalStorage = true,
    sessionTimeout = 30,
    maxStoredSessions = 100
  } = config;

  const sessionIdRef = useRef<string>('');
  const currentSessionRef = useRef<LearningSession | null>(null);
  const responseTimesRef = useRef<number[]>([]);
  const lastActivityRef = useRef<number>(Date.now());

  // Generate or retrieve session ID
  useEffect(() => {
    if (!enableTracking) return;

    const existingSession = enableLocalStorage ? localStorage.getItem(SESSION_KEY) : null;
    const now = Date.now();

    if (existingSession) {
      try {
        const { sessionId, lastActivity } = JSON.parse(existingSession);
        const minutesSinceActivity = (now - lastActivity) / (1000 * 60);

        if (minutesSinceActivity < sessionTimeout) {
          sessionIdRef.current = sessionId;
          lastActivityRef.current = lastActivity;
        } else {
          // Session expired, create new one
          sessionIdRef.current = generateSessionId();
        }
      } catch {
        sessionIdRef.current = generateSessionId();
      }
    } else {
      sessionIdRef.current = generateSessionId();
    }

    // Update last activity
    updateLastActivity();

    // Set up activity tracking
    const activityEvents = ['click', 'keydown', 'mousemove', 'touchstart'];
    const handleActivity = () => updateLastActivity();

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enableTracking, enableLocalStorage, sessionTimeout]);

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    if (enableLocalStorage) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        sessionId: sessionIdRef.current,
        lastActivity: now
      }));
    }
  }, [enableLocalStorage]);

  // Track generic events
  const track = useCallback((eventName: string, data?: Record<string, any>) => {
    if (!enableTracking) return;

    const event: AnalyticsEvent = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: sessionIdRef.current,
      data: data ? { ...data } : undefined // Clone to prevent mutations
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', eventName, data);
    }

    // Store event locally
    if (enableLocalStorage) {
      try {
        const existingEvents = localStorage.getItem(ANALYTICS_KEY);
        const events: AnalyticsEvent[] = existingEvents ? JSON.parse(existingEvents) : [];

        events.push(event);

        // Limit stored events
        if (events.length > maxStoredSessions * 10) {
          events.splice(0, events.length - maxStoredSessions * 10);
        }

        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
      } catch (error) {
        console.warn('Failed to store analytics event:', error);
      }
    }

    updateLastActivity();
  }, [enableTracking, enableLocalStorage, maxStoredSessions, updateLastActivity]);

  // Start a learning session
  const startLearningSession = useCallback((mode: string, range: string, totalQuestions: number) => {
    if (!enableTracking) return;

    const session: LearningSession = {
      sessionId: sessionIdRef.current,
      startTime: Date.now(),
      mode,
      range,
      questionsAnswered: 0,
      correctAnswers: 0,
      totalQuestions,
      completedSession: false,
      difficultWords: []
    };

    currentSessionRef.current = session;
    responseTimesRef.current = [];

    track('learning_session_started', {
      mode,
      range,
      totalQuestions
    });
  }, [enableTracking, track]);

  // Track quiz answer
  const trackQuizAnswer = useCallback((
    word: string,
    sense: string,
    isCorrect: boolean,
    responseTime: number,
    mode: string
  ) => {
    if (!enableTracking || !currentSessionRef.current) return;

    const session = currentSessionRef.current;
    session.questionsAnswered++;

    if (isCorrect) {
      session.correctAnswers++;
    } else {
      session.difficultWords.push(word);
    }

    responseTimesRef.current.push(responseTime);
    session.averageResponseTime = responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length;

    track('quiz_answer', {
      word,
      sense,
      isCorrect,
      responseTime,
      mode,
      sessionProgress: session.questionsAnswered / session.totalQuestions
    });

    updateLastActivity();
  }, [enableTracking, track, updateLastActivity]);

  // Complete learning session
  const completeLearningSession = useCallback((completed: boolean = true) => {
    if (!enableTracking || !currentSessionRef.current) return;

    const session = currentSessionRef.current;
    session.endTime = Date.now();
    session.completedSession = completed;

    const sessionDuration = session.endTime - session.startTime;
    const accuracy = session.questionsAnswered > 0 ? session.correctAnswers / session.questionsAnswered : 0;

    track('learning_session_completed', {
      sessionId: session.sessionId,
      duration: sessionDuration,
      questionsAnswered: session.questionsAnswered,
      totalQuestions: session.totalQuestions,
      accuracy,
      completedSession: completed,
      averageResponseTime: session.averageResponseTime,
      difficultWordsCount: session.difficultWords.length,
      mode: session.mode,
      range: session.range
    });

    // Store session data
    if (enableLocalStorage) {
      try {
        const existingSessions = localStorage.getItem(`${ANALYTICS_KEY}.sessions`);
        const sessions: LearningSession[] = existingSessions ? JSON.parse(existingSessions) : [];

        sessions.push(session);

        // Limit stored sessions
        if (sessions.length > maxStoredSessions) {
          sessions.splice(0, sessions.length - maxStoredSessions);
        }

        localStorage.setItem(`${ANALYTICS_KEY}.sessions`, JSON.stringify(sessions));
      } catch (error) {
        console.warn('Failed to store session data:', error);
      }
    }

    currentSessionRef.current = null;
  }, [enableTracking, track, enableLocalStorage, maxStoredSessions]);

  // Track SRS statistics updates
  const trackSRSUpdate = useCallback((
    questionId: string,
    previousStat: ReviewStat | undefined,
    newStat: ReviewStat,
    quality: number
  ) => {
    if (!enableTracking) return;

    const wasNew = !previousStat;
    const intervalChange = previousStat ? newStat.interval - previousStat.interval : newStat.interval;
    const efChange = previousStat ? newStat.ef - previousStat.ef : 0;

    track('srs_update', {
      questionId,
      quality,
      wasNew,
      newInterval: newStat.interval,
      newEF: newStat.ef,
      newReps: newStat.reps,
      intervalChange,
      efChange
    });
  }, [enableTracking, track]);

  // Track app errors
  const trackError = useCallback((error: Error, context?: string) => {
    if (!enableTracking) return;

    track('app_error', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Truncate for storage
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, [enableTracking, track]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    if (!enableLocalStorage) return null;

    try {
      const events = localStorage.getItem(ANALYTICS_KEY);
      const sessions = localStorage.getItem(`${ANALYTICS_KEY}.sessions`);

      const parsedEvents: AnalyticsEvent[] = events ? JSON.parse(events) : [];
      const parsedSessions: LearningSession[] = sessions ? JSON.parse(sessions) : [];

      const totalSessions = parsedSessions.length;
      const completedSessions = parsedSessions.filter(s => s.completedSession).length;
      const averageAccuracy = parsedSessions.length > 0
        ? parsedSessions.reduce((sum, s) => sum + (s.correctAnswers / Math.max(s.questionsAnswered, 1)), 0) / parsedSessions.length
        : 0;

      const totalQuestions = parsedSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
      const totalCorrect = parsedSessions.reduce((sum, s) => sum + s.correctAnswers, 0);

      return {
        totalEvents: parsedEvents.length,
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
        totalQuestions,
        totalCorrect,
        overallAccuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
        averageSessionAccuracy: averageAccuracy,
        recentSessions: parsedSessions.slice(-10)
      };
    } catch (error) {
      console.warn('Failed to get analytics summary:', error);
      return null;
    }
  }, [enableLocalStorage]);

  // Clear analytics data
  const clearAnalyticsData = useCallback(() => {
    if (!enableLocalStorage) return;

    localStorage.removeItem(ANALYTICS_KEY);
    localStorage.removeItem(`${ANALYTICS_KEY}.sessions`);
    localStorage.removeItem(SESSION_KEY);
  }, [enableLocalStorage]);

  return {
    track,
    startLearningSession,
    trackQuizAnswer,
    completeLearningSession,
    trackSRSUpdate,
    trackError,
    getAnalyticsSummary,
    clearAnalyticsData,
    getCurrentSession: () => currentSessionRef.current,
    getSessionId: () => sessionIdRef.current
  };
}

export default useAnalytics;