import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 safe-area-inset-top safe-area-inset-bottom">
        {/* Animated Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.h1
              className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              古文単語学習
            </motion.h1>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            間隔反復学習で古典文学の語彙をマスターしよう
          </motion.p>
        </motion.div>

        {/* Animated Controls Panel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
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
        </motion.div>

        {/* Animated Quiz Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx} // Re-animate on question change
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              ease: "easeOut"
            }}
          >
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
          </motion.div>
        </AnimatePresence>

        {/* Floating Progress Indicator */}
        <AnimatePresence>
          {quizSet.length > 0 && !finished && (
            <motion.div
              className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {qIdx + 1} / {quizSet.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}