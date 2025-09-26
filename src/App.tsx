import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { QuizSettings } from "@/components/QuizSettings";
import { QuizCard } from "@/components/QuizCard";
import { useQuizData } from "@/hooks/useQuizData";
import { useQuizLogic } from "@/hooks/useQuizLogic";
import { validateRange, safeJsonParse, validateSRSStats } from "@/utils/validation";
import { SRS_KEY } from "@/utils/srs";
import { Mode, ReviewStat } from "@/types/quiz";

export default function App() {
  // Data Loading
  const { all, dataStatus, dataError } = useQuizData();

  // Settings State
  const [mode, setMode] = useState<Mode>("word2sense");
  const [rangeText, setRangeText] = useState("1-50");
  const [numQuestions, setNumQuestions] = useState(10);

  // SRS Store
  const [stats, setStats] = useState<Record<string, ReviewStat>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SRS_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        const validatedStats = validateSRSStats(parsed);
        setStats(validatedStats);
      }
    } catch (error) {
      console.warn('Failed to load learning statistics, using defaults:', error);
      setStats({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SRS_KEY, JSON.stringify(stats));
  }, [stats]);

  const resetSRS = useCallback(() => {
    if (window.confirm("学習記録をすべてリセットしますか？")) {
      setStats({});
    }
  }, []);

  // Filtered Data Pools
  const ranged = useMemo(() => {
    console.log(`🔥 EMERGENCY DEBUG: Filtering range - all.length = ${all.length}, rangeText = "${rangeText}"`);
    console.log(`🔥 EMERGENCY DEBUG: First 5 questions word numbers:`, all.slice(0, 5).map(q => q.wordNumber));

    if (all.length === 0) {
      console.log("🔥 EMERGENCY DEBUG: No questions loaded yet");
      return [];
    }

    const validRange = validateRange(rangeText);
    console.log(`🔥 EMERGENCY DEBUG: Validated range:`, validRange);
    if (!validRange) {
      console.log("🔥 EMERGENCY DEBUG: Invalid range, returning all questions");
      return all;
    }

    console.log(`🔥 EMERGENCY DEBUG: Valid range: ${validRange.start} - ${validRange.end}`);

    const filtered = all.filter((q) => {
      const inRange = q.wordNumber >= validRange.start && q.wordNumber <= validRange.end;
      return inRange;
    });

    console.log(`🔥 EMERGENCY DEBUG: Filtered questions: ${filtered.length} out of ${all.length}`);
    console.log(`🔥 EMERGENCY DEBUG: Sample filtered questions:`, filtered.slice(0, 3));
    console.log(`🔥 EMERGENCY DEBUG: Word number distribution in filtered:`, filtered.slice(0, 10).map(q => q.wordNumber));

    return filtered;
  }, [all, rangeText]);

  const modeReadyPool = useMemo(() => {
    console.log(`🔥 EMERGENCY DEBUG: Mode filtering - mode = "${mode}", ranged.length = ${ranged.length}`);

    if (mode === "example2sense_jp" || mode === "example2sense_tr") {
      const withExamples = ranged.filter((q) => q.examples && q.examples.length > 0);
      console.log(`🔥 EMERGENCY DEBUG: Questions with examples: ${withExamples.length} out of ${ranged.length}`);
      return withExamples;
    }
    console.log(`🔥 EMERGENCY DEBUG: All ranged questions available for mode: ${ranged.length}`);
    return ranged;
  }, [ranged, mode]);

  // Quiz Logic
  const {
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
    currentQuestion
  } = useQuizLogic(modeReadyPool, mode, numQuestions, stats, setStats);

  // Session Key for Auto-restart
  const sessionKey = `${mode}|${rangeText}|${numQuestions}|${modeReadyPool.length}|${dataStatus}`;
  const lastSessionKeyRef = useRef<string>("");

  useEffect(() => {
    console.log(`🔥 EMERGENCY DEBUG: Session effect - dataStatus: ${dataStatus}, sessionKey: ${sessionKey}`);
    console.log(`🔥 EMERGENCY DEBUG: modeReadyPool.length: ${modeReadyPool.length}`);

    if (dataStatus !== "ready") {
      console.log("🔥 EMERGENCY DEBUG: Data not ready yet, skipping session start");
      return;
    }

    if (lastSessionKeyRef.current === sessionKey) {
      console.log("🔥 EMERGENCY DEBUG: Session key unchanged, skipping");
      return;
    }

    console.log("🔥 EMERGENCY DEBUG: Starting new session with key:", sessionKey);
    lastSessionKeyRef.current = sessionKey;
    startSession();
  }, [sessionKey, dataStatus, startSession]);

  // Progress Statistics
  const { dueCount, newCount } = useMemo(() => {
    const t = Date.now();
    let due = 0;
    let fresh = 0;

    for (const q of modeReadyPool) {
      const st = stats[q.id];

      if (!st) {
        fresh++;
      } else if ((st.dueAt ?? 0) <= t) {
        due++;
      }
    }

    return { dueCount: due, newCount: fresh };
  }, [modeReadyPool, stats]);

  // Emergency diagnostic function - available in browser console
  (window as any).debugApp = () => {
    console.log("🔥 APP DEBUG SNAPSHOT:");
    console.log("dataStatus:", dataStatus);
    console.log("all.length:", all.length);
    console.log("rangeText:", rangeText);
    console.log("mode:", mode);
    console.log("ranged.length:", ranged.length);
    console.log("modeReadyPool.length:", modeReadyPool.length);
    console.log("quizSet.length:", quizSet.length);
    console.log("First 3 all questions:", all.slice(0, 3));
    console.log("First 3 ranged questions:", ranged.slice(0, 3));
    console.log("First 3 modeReadyPool questions:", modeReadyPool.slice(0, 3));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 safe-area-inset-top safe-area-inset-bottom">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="mb-4">
            <h1 className="text-6xl font-bold gradient-text mb-4">
              古文単語学習
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-gradient"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            間隔反復学習で古典文学の語彙をマスターしよう
          </p>
        </div>

        {/* Controls Panel */}
        <QuizSettings
          mode={mode}
          setMode={setMode}
          rangeText={rangeText}
          setRangeText={setRangeText}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          dueCount={dueCount}
          newCount={newCount}
          modeReadyPoolLength={modeReadyPool.length}
          dataStatus={dataStatus}
          allLength={all.length}
          rangedLength={ranged.length}
          onStartSession={startSession}
          onResetSRS={resetSRS}
        />

        {/* Quiz Card */}
        <QuizCard
          finished={finished}
          currentQuestion={currentQuestion}
          qIdx={qIdx}
          quizSetLength={quizSet.length}
          choices={choices}
          feedback={feedback}
          isAnswered={isAnswered}
          score={score}
          mode={mode}
          dataStatus={dataStatus}
          dataError={dataError}
          allLength={all.length}
          modeReadyPoolLength={modeReadyPool.length}
          dueCount={dueCount}
          newCount={newCount}
          onAnswerSelect={judge}
          onNextQuestion={nextQuestion}
          onStartSession={startSession}
        />
      </div>
    </div>
  );
}