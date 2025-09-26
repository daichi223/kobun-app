import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Question, Mode, QuizState } from '@/types/quiz';
import { ReviewStat, nextSRS } from '@/utils/srs';
import { shuffle } from '@/utils/shuffle';

export function useQuizLogic(
  modeReadyPool: Question[],
  mode: Mode,
  numQuestions: number,
  stats: Record<string, ReviewStat>,
  setStats: React.Dispatch<React.SetStateAction<Record<string, ReviewStat>>>
) {
  const [quizSet, setQuizSet] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  const statsRef = useRef<Record<string, ReviewStat>>({});

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const generateChoices = useCallback((currentQ: Question) => {
    const correctAnswer = (mode === "sense2word" || mode === "example2sense_tr") ? currentQ.lemma : currentQ.sense;

    const distractors = modeReadyPool
      .filter(q => ((mode === "sense2word" || mode === "example2sense_tr") ? q.lemma : q.sense) !== correctAnswer)
      .map(q => (mode === "sense2word" || mode === "example2sense_tr") ? q.lemma : q.sense);

    const uniqueDistractors = [...new Set(distractors)];

    if (uniqueDistractors.length < 3) {
      console.warn(`Not enough distractors (${uniqueDistractors.length}) for question:`, currentQ.lemma, currentQ.sense);
      const availableChoices = [...uniqueDistractors, correctAnswer];
      setChoices(shuffle(availableChoices));
      return;
    }

    const finalChoices = shuffle(uniqueDistractors).slice(0, 3);
    finalChoices.push(correctAnswer);
    setChoices(shuffle(finalChoices));
  }, [modeReadyPool, mode]);

  const startSession = useCallback(() => {
    console.log(`🔥 EMERGENCY DEBUG: Starting session - modeReadyPool.length = ${modeReadyPool.length}`);
    if (modeReadyPool.length === 0) {
      console.log(`🔥 EMERGENCY DEBUG: No questions available for session!`);
      setQuizSet([]);
      return;
    }

    const t = Date.now();
    const due: Question[] = [];
    const fresh: Question[] = [];
    const other: Question[] = [];

    for (const q of modeReadyPool) {
      const st = statsRef.current[q.id];

      if (!st) {
        fresh.push(q);
      } else if ((st.dueAt ?? 0) <= t) {
        due.push(q);
      } else {
        other.push(q);
      }
    }

    const ordered = [
      ...shuffle(due),
      ...shuffle(fresh),
      ...shuffle(other)
    ].slice(0, numQuestions);

    setQuizSet(ordered);
    setQIdx(0);
    setScore(0);
    setFinished(false);
    setIsAnswered(false);
    setFeedback("");
  }, [modeReadyPool, numQuestions]);

  const judge = useCallback((selected: string) => {
    if (isAnswered) return;

    const currentQ = quizSet[qIdx];
    const correctAnswer = (mode === "sense2word" || mode === "example2sense_tr") ? currentQ.lemma : currentQ.sense;
    let quality: number;

    if (selected === correctAnswer) {
      setFeedback("✅ 正解！");
      setScore(prev => prev + 1);
      quality = 4;

      const prevStat = stats[currentQ.id];
      const newStat = nextSRS(prevStat, quality);
      setStats(prev => ({ ...prev, [currentQ.id]: newStat }));

      setIsAnswered(true);

      const timer = setTimeout(() => {
        if (qIdx + 1 < quizSet.length) {
          setQIdx(prev => prev + 1);
          setIsAnswered(false);
          setFeedback("");
        } else {
          setFinished(true);
        }
        setAutoAdvanceTimer(null);
      }, 1000);

      setAutoAdvanceTimer(timer);
    } else {
      setFeedback(`❌ 不正解。正解は：${correctAnswer}`);
      quality = 1;

      const prevStat = stats[currentQ.id];
      const newStat = nextSRS(prevStat, quality);
      setStats(prev => ({ ...prev, [currentQ.id]: newStat }));

      setIsAnswered(true);
    }
  }, [isAnswered, quizSet, qIdx, mode, stats, setStats]);

  const nextQuestion = useCallback(() => {
    if (qIdx + 1 < quizSet.length) {
      setQIdx(prev => prev + 1);
      setIsAnswered(false);
      setFeedback("");
    } else {
      setFinished(true);
    }
  }, [qIdx, quizSet.length]);

  useEffect(() => {
    if (quizSet[qIdx]) {
      generateChoices(quizSet[qIdx]);
    }
  }, [qIdx, quizSet, generateChoices]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  return {
    quizSet,
    qIdx,
    choices,
    feedback,
    isAnswered,
    score,
    finished,
    startSession,
    judge,
    nextQuestion,
    currentQuestion: quizSet[qIdx]
  };
}