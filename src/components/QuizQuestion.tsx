import React from 'react';
import { Button } from '@/components/ui/button';
import { Question, Mode } from '@/types/quiz';

interface QuizQuestionProps {
  question: Question;
  mode: Mode;
  choices: string[];
  isAnswered: boolean;
  feedback: string;
  onAnswerSelect: (answer: string) => void;
}

export function QuizQuestion({
  question,
  mode,
  choices,
  isAnswered,
  feedback,
  onAnswerSelect,
}: QuizQuestionProps) {
  const isCorrectFeedback = feedback.startsWith("✅");
  const isIncorrectFeedback = feedback.startsWith("❌");

  return (
    <div className="animate-slide-in">
      {/* Examples at top (for all modes) */}
      {question.examples && question.examples.length > 0 && (
        <div className="mb-8 bg-surface-50 border border-surface-200 rounded-xl p-6">
          <div className="text-base font-medium text-secondary-700 mb-4">参考例文</div>
          <div className="space-y-4">
            {question.examples.slice(0, 2).map((ex, i) => {
              const isUsedInQuestion = (mode === "example2sense_jp" || mode === "example2sense_tr") && i === 0;

              return (
                <div key={i} className="space-y-2">
                  {mode === "sense2word" ? (
                    ex.translation && !isUsedInQuestion && (
                      <p className="text-lg text-secondary-800 leading-relaxed">
                        {ex.translation}
                      </p>
                    )
                  ) : (
                    ex.jp && !isUsedInQuestion && (
                      <p className="text-lg italic font-japanese text-secondary-800 leading-relaxed">
                        {ex.jp}
                      </p>
                    )
                  )}

                  {isAnswered && (
                    <div className="text-sm text-secondary-600 space-y-1">
                      {mode === "sense2word" && ex.jp && (
                        <p>古文：{ex.jp}</p>
                      )}
                      {mode !== "sense2word" && ex.translation && (
                        <p>現代語訳：{ex.translation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {!isAnswered && (
              <p className="text-xs text-secondary-400">
                {mode === "sense2word" ? "回答すると古文が表示されます" : "回答すると現代語訳が表示されます"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="mb-8">
        {mode === "word2sense" && (
          <div className="text-center">
            <div className="text-4xl font-bold font-japanese-display text-secondary-900 mb-2">
              {question.lemma}
            </div>
            <div className="text-sm text-secondary-500">正しい意味を選択してください</div>
          </div>
        )}

        {mode === "sense2word" && (
          <div className="text-center">
            <div className="text-xl font-medium text-secondary-800 mb-3 leading-relaxed">
              {question.sense}
            </div>
            <div className="text-sm text-secondary-500">正しい古語を選択してください</div>
          </div>
        )}

        {mode === "example2sense_jp" && (
          <div className="text-center">
            <div className="text-xl italic font-japanese text-secondary-800 mb-3 leading-relaxed">
              {question.examples?.[0]?.jp ?? "例文がありません"}
            </div>
            <div className="text-sm text-secondary-500 mb-2">
              古語: <span className="font-japanese-display font-medium">{question.lemma}</span>
            </div>
            <div className="text-sm text-secondary-500">正しい意味を選択してください</div>
          </div>
        )}

        {mode === "example2sense_tr" && (
          <div className="text-center">
            <div className="text-xl text-secondary-800 mb-3 leading-relaxed">
              {question.examples?.[0]?.translation ?? "現代語訳がありません"}
            </div>
            <div className="text-sm text-secondary-500">正しい古語を選択してください</div>
          </div>
        )}
      </div>

      {/* Answer Choices */}
      <div className="grid gap-4">
        {choices.map((choice, index) => {
          let buttonVariant: "default" | "success" | "danger" | "secondary" = "secondary";
          let buttonClasses = "relative overflow-hidden";
          let iconElement = null;

          if (isAnswered) {
            const isCorrect = ((mode === "sense2word" || mode === "example2sense_tr") ? question.lemma : question.sense) === choice;
            if (isCorrect) {
              buttonVariant = "success";
              iconElement = <span className="text-green-600 font-bold">✓</span>;
              buttonClasses += " bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200";
            } else if (isIncorrectFeedback && feedback.includes(choice)) {
              buttonVariant = "danger";
              iconElement = <span className="text-red-600 font-bold">✗</span>;
              buttonClasses += " bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200";
            } else {
              buttonClasses += " opacity-60";
            }
          } else {
            buttonClasses += " bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300";
          }

          const choiceLabel = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <Button
              key={choice}
              variant={buttonVariant}
              onClick={() => onAnswerSelect(choice)}
              disabled={isAnswered}
              size="lg"
              className={`text-left justify-start py-6 h-auto min-h-[60px] ${
                (mode === "sense2word" || mode === "example2sense_tr") ? "font-japanese-display" : ""
              } transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${buttonClasses}`}
            >
              <div className="flex items-center w-full">
                {/* Choice Label */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${
                  isAnswered
                    ? ((mode === "sense2word" || mode === "example2sense_tr") ? question.lemma : question.sense) === choice
                      ? "bg-green-500 text-white"
                      : isIncorrectFeedback && feedback.includes(choice)
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                    : "bg-blue-500 text-white"
                }`}>
                  {isAnswered ? (
                    ((mode === "sense2word" || mode === "example2sense_tr") ? question.lemma : question.sense) === choice ? "✓" :
                    isIncorrectFeedback && feedback.includes(choice) ? "✗" : choiceLabel
                  ) : choiceLabel}
                </div>

                {/* Choice Text */}
                <div className="flex-1 text-lg leading-relaxed">
                  {choice}
                </div>

                {/* Status Icon */}
                {iconElement && (
                  <div className="ml-4">
                    {iconElement}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className="mt-6 animate-fade-in">
          <div className={`p-4 rounded-xl border ${
            isCorrectFeedback
              ? "bg-success-50 border-success-200 text-success-800"
              : "bg-danger-50 border-danger-200 text-danger-800"
          }`}>
            <div className="flex items-center">
              {feedback.includes("正解") ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">
                {feedback.replace("✅ ", "").replace("❌ ", "")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}