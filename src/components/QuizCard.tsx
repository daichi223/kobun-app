import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion } from './QuizQuestion';
import { Question, Mode, DataStatus } from '@/types/quiz';

interface QuizCardProps {
  // Quiz State
  finished: boolean;
  currentQuestion: Question | undefined;
  qIdx: number;
  quizSetLength: number;
  choices: string[];
  feedback: string;
  isAnswered: boolean;
  score: number;
  mode: Mode;

  // Data State
  dataStatus: DataStatus;
  dataError: string;
  allLength: number;
  modeReadyPoolLength: number;
  dueCount: number;
  newCount: number;

  // Actions
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  onStartSession: () => void;
}

export function QuizCard({
  finished,
  currentQuestion,
  qIdx,
  quizSetLength,
  choices,
  feedback,
  isAnswered,
  score,
  mode,
  dataStatus,
  dataError,
  allLength,
  modeReadyPoolLength,
  dueCount,
  newCount,
  onAnswerSelect,
  onNextQuestion,
  onStartSession,
}: QuizCardProps) {
  return (
    <Card className="glass-card hover-lift animate-scale-in shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {finished ? (
              <span className="text-success-600">クイズ完了！</span>
            ) : currentQuestion ? (
              <span>問題 {qIdx + 1} / {quizSetLength}</span>
            ) : (
              <span className="animate-pulse-subtle">クイズを準備中...</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            {!finished && currentQuestion && (
              <div className="text-sm text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                進捗 {Math.round(((qIdx + 1) / quizSetLength) * 100)}%
              </div>
            )}
            {!finished && currentQuestion && isAnswered && feedback.includes("不正解") && (
              <Button
                onClick={onNextQuestion}
                variant="outline"
                size="sm"
                className="min-w-[100px] border-2 border-primary-500 text-primary-700 bg-white hover:bg-primary-50"
              >
                次の問題へ →
              </Button>
            )}
          </div>
        </div>
        {!finished && currentQuestion && (
          <Progress
            value={((qIdx + 1) / quizSetLength) * 100}
            className="mt-3"
            showLabel={false}
            animated={true}
          />
        )}
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {dataStatus === "loading" && (
          <div className="text-center py-8">
            <div className="animate-pulse-subtle text-lg text-secondary-600 mb-2">
              語彙データを読み込み中...
            </div>
            <div className="text-sm text-secondary-500 space-y-1">
              <div>Reading /public/kobun_q.jsonl</div>
              <div className="text-xs text-secondary-400">
                Total loaded: {allLength} questions
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {dataStatus === "error" && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-danger-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-danger-800">読み込みエラー</h3>
            </div>
            <p className="text-danger-700 mb-3">{dataError}</p>
            <div className="text-sm text-danger-600 space-y-1">
              <div>• Ensure the file exists at <code className="bg-danger-100 px-1 rounded">public/kobun_q.jsonl</code></div>
              <div>• Check the file path in your browser directly</div>
              <div>• Verify the file format is correct</div>
            </div>
          </div>
        )}

        {/* No Questions Available */}
        {dataStatus === "ready" && modeReadyPoolLength === 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-warning-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-warning-800 mb-2">問題が見つかりません</h3>
            <p className="text-warning-700 mb-3">
              選択された範囲と出題形式に対応する問題が見つかりませんでした。
            </p>
            <p className="text-sm text-warning-600">
              範囲を調整するか、別の出題形式を選択してください。
            </p>
          </div>
        )}

        {/* Results Screen */}
        {finished && (
          <div className="text-center py-8 animate-slide-in">
            <div className="mb-6">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">クイズ完了！</h2>
              <div className="text-4xl font-bold text-primary-600 mb-4">
                {score}/{quizSetLength}
              </div>
              <div className="text-lg text-secondary-600 mb-6">
                正答率 {Math.round((score / quizSetLength) * 100)}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-surface-100 rounded-xl p-3">
                <div className="text-sm text-secondary-500">総問題数</div>
                <div className="text-xl font-bold text-secondary-700">{modeReadyPoolLength}</div>
              </div>
              <div className="bg-warning-50 rounded-xl p-3">
                <div className="text-sm text-warning-600">復習予定</div>
                <div className="text-xl font-bold text-warning-700">{dueCount}</div>
              </div>
              <div className="bg-primary-50 rounded-xl p-3">
                <div className="text-sm text-primary-600">未学習</div>
                <div className="text-xl font-bold text-primary-700">{newCount}</div>
              </div>
            </div>

            <Button
              onClick={onStartSession}
              size="lg"
              className="min-w-[160px]"
            >
              新しいクイズを始める
            </Button>
          </div>
        )}

        {/* Quiz Question */}
        {!finished && currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            mode={mode}
            choices={choices}
            isAnswered={isAnswered}
            feedback={feedback}
            onAnswerSelect={onAnswerSelect}
          />
        )}
      </CardContent>
    </Card>
  );
}