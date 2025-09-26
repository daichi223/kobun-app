import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Mode, DataStatus } from '@/types/quiz';

interface QuizSettingsProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  rangeText: string;
  setRangeText: (range: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  dueCount: number;
  newCount: number;
  modeReadyPoolLength: number;
  dataStatus: DataStatus;
  allLength: number;
  rangedLength: number;
  onStartSession: () => void;
  onResetSRS: () => void;
}

export function QuizSettings({
  mode,
  setMode,
  rangeText,
  setRangeText,
  numQuestions,
  setNumQuestions,
  dueCount,
  newCount,
  modeReadyPoolLength,
  dataStatus,
  allLength,
  rangedLength,
  onStartSession,
  onResetSRS,
}: QuizSettingsProps) {
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setRangeText(value);
    }
  };

  return (
    <Card className="mb-8 glass-card hover-lift animate-slide-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800">🎯 クイズ設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Select
            label="出題形式"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="min-w-[180px]"
          >
            <option value="word2sense">古語 → 意味</option>
            <option value="sense2word">意味 → 古語</option>
            <option value="example2sense_jp">例文 → 意味</option>
            <option value="example2sense_tr">例文（訳）→ 古語</option>
          </Select>

          <Input
            label="範囲"
            value={rangeText}
            onChange={handleRangeChange}
            placeholder="1-50"
            maxLength={20}
            className="min-w-[100px]"
          />

          <Select
            label="問題数"
            value={String(numQuestions)}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="min-w-[100px]"
          >
            <option value="5">5問</option>
            <option value="10">10問</option>
            <option value="15">15問</option>
            <option value="20">20問</option>
          </Select>

          <div className="flex flex-col justify-end">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-sm border border-blue-100">
              <div className="text-gray-700 mb-3 font-semibold">📊 学習状況</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 flex items-center">
                    ⏰ 復習予定:
                  </span>
                  <span className="font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-lg">
                    {dueCount}問
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 flex items-center">
                    ✨ 未学習:
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                    {newCount}問
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    📚 総問題数:
                  </span>
                  <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                    {modeReadyPoolLength}問
                  </span>
                </div>
                {/* Emergency Debug Info */}
                {import.meta.env.DEV && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-bold text-red-700 mb-1">🔥 DEBUG:</div>
                    <div>Status: {dataStatus}</div>
                    <div>All: {allLength}</div>
                    <div>Ranged: {rangedLength}</div>
                    <div>Mode Pool: {modeReadyPoolLength}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onStartSession}
            variant="outline"
            className="min-w-[120px] border-2 border-primary-500 text-primary-700 bg-white hover:bg-primary-50"
          >
            新しいクイズセット
          </Button>
          <Button
            variant="outline"
            onClick={onResetSRS}
            className="min-w-[120px] border-2 border-secondary-400 text-secondary-700 bg-white hover:bg-secondary-50"
          >
            学習記録をリセット
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}