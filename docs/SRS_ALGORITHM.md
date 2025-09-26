# SRS（間隔反復学習）アルゴリズム仕様書

この文書では、古文単語学習アプリケーションで実装されているSRS（Spaced Repetition System）アルゴリズムについて詳細に説明します。

## 目次

- [概要](#概要)
- [アルゴリズムの基礎](#アルゴリズムの基礎)
- [実装詳細](#実装詳細)
- [計算式と例](#計算式と例)
- [データ構造](#データ構造)
- [学習フロー](#学習フロー)
- [調整とカスタマイズ](#調整とカスタマイズ)
- [パフォーマンス考慮事項](#パフォーマンス考慮事項)

## 概要

### SRS（間隔反復学習）とは

間隔反復学習（Spaced Repetition System）は、記憶の忘却曲線に基づいて最適な復習タイミングを自動計算する学習手法です。正解した問題は復習間隔を長くし、不正解の問題は短い間隔で再度出題することで、効率的な長期記憶の定着を図ります。

### 実装方式

本アプリケーションでは、SuperMemo 2（SM-2）アルゴリズムを簡素化したバージョンを採用しています：

- **品質評価**: 4段階（1=Again, 3=Hard, 4=Good, 5=Easy）
- **難易度係数**: 1.3-2.5の範囲で動的調整
- **固定間隔**: 初回1日、2回目6日、以降は係数ベースで計算

## アルゴリズムの基礎

### SuperMemo 2（SM-2）について

SM-2は1988年にPiotr Wozniakによって開発された間隔反復アルゴリズムです。本実装では以下の特徴を持ちます：

1. **簡素化**: 3段階目以降のみ難易度係数を適用
2. **固定初期間隔**: 1日→6日の固定パターン
3. **品質評価の単純化**: 実質的に正解/不正解の2段階

### 忘却曲線への対応

- **即座の復習**: 不正解時は翌日再出題
- **段階的延長**: 正解回数に応じて間隔を延長
- **個別調整**: 各問題の習熟度に応じた個別スケジューリング

## 実装詳細

### 核心関数: `nextSRS`

```typescript
function nextSRS(prev: ReviewStat | undefined, quality: number): ReviewStat {
  // quality: 1(Again) / 3(Hard) / 4(Good) / 5(Easy)
  let s = { ...(prev ?? defaultStat) };
  const q = Math.max(0, Math.min(5, quality));

  if (q < 3) {
    // 不正解時: リセット
    s.reps = 0;
    s.interval = 1;
  } else {
    // 正解時: 進行
    s.reps += 1;
    if (s.reps === 1) s.interval = 1;
    else if (s.reps === 2) s.interval = 6;
    else s.interval = Math.round(s.interval * s.ef);
  }

  // 難易度係数の更新
  s.ef = s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  s.ef = Math.max(1.3, Math.min(2.5, s.ef));

  // 次回復習日の計算
  const ms = s.interval * 24 * 60 * 60 * 1000;
  s.last = now();
  s.dueAt = s.last + ms;

  return s;
}
```

### データ構造: `ReviewStat`

```typescript
type ReviewStat = {
  ef: number;        // 難易度係数（Easiness Factor）1.3-2.5
  reps: number;      // 連続正解回数
  interval: number;  // 復習間隔（日数）
  dueAt: number;     // 次回復習予定時刻（ミリ秒）
  last: number;      // 前回復習時刻（ミリ秒）
};

const defaultStat: ReviewStat = {
  ef: 2.5,           // 初期難易度係数
  reps: 0,           // 初期正解回数
  interval: 0,       // 初期間隔
  dueAt: 0,          // 初期予定時刻
  last: 0            // 初期実行時刻
};
```

## 計算式と例

### 難易度係数（EF）の更新

```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
```

ここで：
- `EF'` = 新しい難易度係数
- `EF` = 現在の難易度係数
- `q` = 品質評価（1-5）

### 品質別のEF変化

| 品質 | 評価 | EF変化 | 効果 |
|------|------|---------|------|
| 1 | Again | -0.8 | 大幅減少 |
| 3 | Hard | -0.14 | 軽微減少 |
| 4 | Good | +0.1 | 軽微増加 |
| 5 | Easy | +0.1 | 軽微増加（上限制限） |

### 復習間隔の計算

```
interval = {
  1,                    reps = 1
  6,                    reps = 2
  round(interval * ef), reps >= 3
}
```

### 具体例

#### シナリオ1: 順調な学習

```
初回学習（Good回答）:
- reps: 0 → 1
- interval: 0 → 1
- ef: 2.5 → 2.6
- 次回: 1日後

2回目学習（Good回答）:
- reps: 1 → 2
- interval: 1 → 6
- ef: 2.6 → 2.7
- 次回: 6日後

3回目学習（Good回答）:
- reps: 2 → 3
- interval: 6 → 16 (6 * 2.7)
- ef: 2.7 → 2.8
- 次回: 16日後
```

#### シナリオ2: 困難な学習

```
初回学習（Again回答）:
- reps: 0 → 0
- interval: 0 → 1
- ef: 2.5 → 1.7
- 次回: 1日後

2回目学習（Hard回答）:
- reps: 0 → 1
- interval: 1 → 1
- ef: 1.7 → 1.56
- 次回: 1日後

3回目学習（Good回答）:
- reps: 1 → 2
- interval: 1 → 6
- ef: 1.56 → 1.66
- 次回: 6日後
```

## データ構造

### localStorage保存形式

```typescript
// キー: "kobun.srs.v1"
// 値: JSON文字列
{
  "おどろく|〔 気づい 〕": {
    "ef": 2.3,
    "reps": 2,
    "interval": 6,
    "dueAt": 1709251200000,
    "last": 1708732800000
  },
  "ののしる|〔 大騒ぎする 〕": {
    "ef": 1.8,
    "reps": 1,
    "interval": 1,
    "dueAt": 1708819200000,
    "last": 1708732800000
  }
}
```

### 問題IDの構成

```
問題ID = lemma + "|" + sense
例: "おどろく|〔 気づい 〕"
```

## 学習フロー

### 1. セッション開始

```typescript
const startSession = () => {
  const t = now();
  const due: Question[] = [];       // 復習予定
  const fresh: Question[] = [];     // 未学習
  const other: Question[] = [];     // その他

  for (const q of questions) {
    const st = stats[q.id];
    if (!st) fresh.push(q);
    else if ((st.dueAt ?? 0) <= t) due.push(q);
    else other.push(q);
  }

  // 優先度: 復習予定 > 未学習 > その他
  const ordered = [...shuffle(due), ...shuffle(fresh), ...shuffle(other)]
    .slice(0, numQuestions);
}
```

### 2. 回答処理

```typescript
const judge = (selected: string) => {
  const isCorrect = (selected === correctAnswer);
  const quality = isCorrect ? 4 : 1;  // Good or Again

  const prevStat = stats[currentQ.id];
  const newStat = nextSRS(prevStat, quality);
  setStats(prev => ({ ...prev, [currentQ.id]: newStat }));
}
```

### 3. 進捗計算

```typescript
const calculateProgress = (questions: Question[], stats: Record<string, ReviewStat>) => {
  const t = now();
  let dueCount = 0;
  let newCount = 0;

  for (const q of questions) {
    const st = stats[q.id];
    if (!st) newCount++;
    else if ((st.dueAt ?? 0) <= t) dueCount++;
  }

  return { dueCount, newCount, totalCount: questions.length };
}
```

## 調整とカスタマイズ

### パラメータ調整

現在の実装で調整可能なパラメータ：

```typescript
// 品質レベルマッピング
const QUALITY_MAPPING = {
  AGAIN: 1,
  HARD: 3,
  GOOD: 4,
  EASY: 5
};

// 固定間隔（カスタマイズ可能）
const INITIAL_INTERVALS = {
  FIRST_REP: 1,   // 1日
  SECOND_REP: 6   // 6日
};

// 難易度係数の範囲
const EF_BOUNDS = {
  MIN: 1.3,
  MAX: 2.5,
  DEFAULT: 2.5
};
```

### カスタマイズオプション

#### 1. 間隔調整

```typescript
// より保守的な間隔設定
const CONSERVATIVE_INTERVALS = {
  FIRST_REP: 1,
  SECOND_REP: 3   // 6日→3日に短縮
};

// より積極的な間隔設定
const AGGRESSIVE_INTERVALS = {
  FIRST_REP: 2,
  SECOND_REP: 10  // 6日→10日に延長
};
```

#### 2. 品質評価の細分化

```typescript
// 5段階評価への拡張
const EXTENDED_QUALITY = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
  VERY_EASY: 5
};
```

## パフォーマンス考慮事項

### メモリ効率

1. **オブジェクト再利用**: statsRefを使用してリアルタイム参照を保持
2. **部分更新**: 変更された統計のみlocalStorageに保存
3. **遅延評価**: 必要時のみ統計を計算

### 計算効率

1. **事前フィルタリング**: 範囲外の問題を早期除外
2. **キャッシュ**: 計算済みの進捗情報を保持
3. **バッチ処理**: localStorage書き込みの最小化

### スケーラビリティ

1. **線形計算量**: O(n)での進捗計算
2. **定数時間アクセス**: ハッシュマップベースの統計参照
3. **軽量データ**: 最小限の統計情報のみ保存

## デバッグとモニタリング

### 統計確認

```javascript
// ブラウザのDevToolsで確認可能
localStorage.getItem('kobun.srs.v1');

// 統計のリセット
localStorage.removeItem('kobun.srs.v1');

// 特定の問題の統計確認
const stats = JSON.parse(localStorage.getItem('kobun.srs.v1') || '{}');
console.log(stats['おどろく|〔 気づい 〕']);
```

### パフォーマンス計測

```typescript
// 計算時間の測定
console.time('SRS Calculation');
const newStat = nextSRS(prevStat, quality);
console.timeEnd('SRS Calculation');

// メモリ使用量の確認
console.log('Stats size:', JSON.stringify(stats).length, 'bytes');
```

このSRSアルゴリズムにより、学習者は個々の習熟度に応じた最適なペースで古典語彙を習得できます。アルゴリズムは学習の進捗に応じて自動的に調整され、長期的な記憶定着を促進します。