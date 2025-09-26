import { useEffect, useState } from 'react';
import { Question, DataStatus } from '@/types/quiz';
import { validateWordData, safeJsonParse } from '@/utils/validation';

export function useQuizData() {
  const [all, setAll] = useState<Question[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus>("loading");
  const [dataError, setDataError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        console.log("🔥 EMERGENCY DEBUG: Starting data load process...");
        setDataStatus("loading");
        setDataError("");

        console.log("🔥 EMERGENCY DEBUG: Attempting to fetch /kobun_q.jsonl");
        let res = await fetch("/kobun_q.jsonl");
        console.log("🔥 EMERGENCY DEBUG: Fetch response status:", res.status, res.ok);

        if (!res.ok) {
          console.log("🔥 EMERGENCY DEBUG: kobun_q.jsonl failed, trying kobun_words.jsonl");
          res = await fetch("/kobun_words.jsonl");
          console.log("🔥 EMERGENCY DEBUG: Fallback response status:", res.status, res.ok);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: /kobun_q.jsonl または /kobun_words.jsonl が見つかりません (public/ フォルダに配置してください)`);
          }
        }

        const txt = await res.text();
        console.log("🔥 EMERGENCY DEBUG: Raw text length:", txt.length);
        console.log("🔥 EMERGENCY DEBUG: First 200 chars:", txt.substring(0, 200));
        const questions: Question[] = [];
        let wordCounter = 0;

        const lines = txt.split("\n");
        console.log("🔥 EMERGENCY DEBUG: Total lines:", lines.length);
        lines.forEach((line, lineIndex) => {
          if (!line.trim()) return;

          const parsed = safeJsonParse(line);
          if (lineIndex < 5) {
            console.log("🔥 EMERGENCY DEBUG: Line", lineIndex, "parsed:", parsed);
          }

          if (!parsed) {
            console.warn(`Failed to parse line ${lineIndex + 1}:`, line.substring(0, 100));
            return;
          }

          // kobun_q.jsonl形式の直接処理
          if (parsed.qid && parsed.lemma && parsed.sense && typeof parsed.word_idx === 'number') {
            const question = {
              id: `${parsed.lemma}|${parsed.sense}`,
              wordNumber: parsed.word_idx,
              meaningId: parsed.qid,
              lemma: parsed.lemma,
              sense: parsed.sense,
              examples: parsed.examples || [],
            };
            questions.push(question);
            if (questions.length <= 5) {
              console.log("🔥 EMERGENCY DEBUG: Added question", questions.length, ":", question);
            }
          } else {
            // 旧形式（kobun_words.jsonl）の処理
            const word = validateWordData(parsed);
            if (!word) {
              console.warn(`Invalid word data at line ${lineIndex + 1}, skipping:`, line.substring(0, 100));
              return;
            }

            wordCounter += 1;

            word.meanings.forEach((m, meaningIndex) => {
              const meaningId = `${wordCounter}-${meaningIndex + 1}`;

              questions.push({
                id: `${word.lemma}|${m.sense}`,
                wordNumber: wordCounter,
                meaningId: meaningId,
                lemma: word.lemma,
                sense: m.sense,
                examples: m.examples || [],
              });
            });
          }
        });

        console.log(`🔥 EMERGENCY DEBUG: Total questions generated: ${questions.length}`);
        const range1to50Questions = questions.filter(q => q.wordNumber >= 1 && q.wordNumber <= 50);
        console.log(`🔥 EMERGENCY DEBUG: Questions in range 1-50:`, range1to50Questions.length);
        console.log(`🔥 EMERGENCY DEBUG: Sample range 1-50 questions:`, range1to50Questions.slice(0, 3));
        console.log(`🔥 EMERGENCY DEBUG: Sample all questions:`, questions.slice(0, 3));

        if (questions.length === 0) {
          throw new Error("No valid questions were parsed from the data file");
        }

        if (range1to50Questions.length === 0) {
          console.warn("🔥 EMERGENCY DEBUG: WARNING - No questions found in range 1-50!");
        }

        console.log("🔥 EMERGENCY DEBUG: Setting questions in state...");
        setAll(questions);
        console.log("🔥 EMERGENCY DEBUG: Questions set in state, length:", questions.length);

        setTimeout(() => {
          setDataStatus("ready");
          console.log("🔥 EMERGENCY DEBUG: Data status set to ready");
        }, 10);

      } catch (e: unknown) {
        console.error(e);
        setAll([]);
        setDataStatus("error");
        setDataError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return {
    all,
    dataStatus,
    dataError
  };
}