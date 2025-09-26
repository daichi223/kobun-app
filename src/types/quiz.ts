export type Example = {
  jp: string;
  translation?: string;
  source?: string
};

export type Meaning = {
  sense: string;
  aliases?: string[];
  examples?: Example[]
};

export type Question = {
  id: string;         // "lemma|sense"
  wordNumber: number; // Word number (1, 2, 3...) for range filtering
  meaningId: string;  // "1-1", "1-2", etc.
  lemma: string;
  sense: string;
  examples: Example[];
};

export type Mode = "word2sense" | "sense2word" | "example2sense_jp" | "example2sense_tr";

export type ReviewStat = {
  ef: number;        // 難易度係数（easiness factor）: 1.3-2.5の範囲で問題の難易度を表現
  reps: number;      // 連続正解数: リセットされるまでの正解回数
  interval: number;  // 復習間隔（日数）: 次回復習までの日数
  dueAt: number;     // 次回復習予定時刻（ミリ秒）: Date.now()形式のタイムスタンプ
  last: number;      // 前回復習時刻（ミリ秒）: 最後に学習した時刻
};

export type DataStatus = "loading" | "ready" | "error";

export type QuizState = {
  quizSet: Question[];
  qIdx: number;
  choices: string[];
  feedback: string;
  isAnswered: boolean;
  score: number;
  finished: boolean;
  autoAdvanceTimer: NodeJS.Timeout | null;
};