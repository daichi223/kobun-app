# API / Component Documentation

この文書では、古文単語学習アプリケーションで使用されているReactコンポーネントのAPIと使用方法について説明します。

## 目次

- [UI Components](#ui-components)
  - [Button](#button)
  - [Card](#card)
  - [Input](#input)
  - [Select](#select)
  - [Progress](#progress)
- [Main Application Component](#main-application-component)
- [Types and Interfaces](#types-and-interfaces)

## UI Components

### Button

再利用可能なボタンコンポーネント。Apple Design System風のスタイリングを適用。

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}
```

#### Props詳細

- `variant` - ボタンのスタイルバリアント（デフォルト: `"default"`）
- `size` - ボタンのサイズ（デフォルト: `"md"`）
- `isLoading` - ローディング状態の表示（デフォルト: `false`）

#### 使用例

```tsx
import { Button } from "@/components/ui/button";

// 基本的な使用
<Button onClick={handleClick}>
  クリックしてください
</Button>

// バリアントとサイズを指定
<Button variant="outline" size="lg">
  アウトライン大ボタン
</Button>

// ローディング状態
<Button isLoading variant="success">
  処理中...
</Button>
```

#### スタイルバリアント

- `default` - プライマリカラーの塗りつぶしボタン
- `outline` - アウトライン付きボタン
- `secondary` - セカンダリカラーのボタン
- `success` - 成功を表す緑色のボタン
- `danger` - 危険を表す赤色のボタン
- `ghost` - 背景透明のボタン

### Card

カードレイアウト用のコンポーネント群。

#### 利用可能なコンポーネント

- `Card` - メインカードコンテナ
- `CardHeader` - カードヘッダー
- `CardTitle` - カードタイトル
- `CardContent` - カードコンテンツ

#### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 標準のHTML div属性を継承
}
```

#### 使用例

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
  </CardHeader>
  <CardContent>
    <p>カードの内容がここに入ります。</p>
  </CardContent>
</Card>
```

### Input

入力フィールドコンポーネント。ラベル、エラー表示、アイコン対応。

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

#### Props詳細

- `label` - 入力フィールドのラベル
- `error` - エラーメッセージ（指定時はエラー状態のスタイリング）
- `size` - 入力フィールドのサイズ（デフォルト: `"md"`）
- `leftIcon` - 左側に表示するアイコン
- `rightIcon` - 右側に表示するアイコン

#### 使用例

```tsx
import { Input } from "@/components/ui/input";

// 基本的な使用
<Input
  label="範囲"
  placeholder="1-50"
  value={rangeText}
  onChange={(e) => setRangeText(e.target.value)}
/>

// エラー状態
<Input
  label="入力値"
  error="正しい範囲を入力してください"
  value={errorValue}
/>
```

### Select

選択フィールドコンポーネント。ドロップダウン選択に使用。

#### Props

```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
}
```

#### 使用例

```tsx
import { Select } from "@/components/ui/select";

<Select
  label="出題形式"
  value={mode}
  onChange={(e) => setMode(e.target.value as Mode)}
>
  <option value="word2sense">古語 → 意味</option>
  <option value="sense2word">意味 → 古語</option>
</Select>
```

### Progress

進捗バーコンポーネント。学習進捗の可視化に使用。

#### Props

```typescript
interface ProgressProps {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}
```

#### Props詳細

- `value` - 現在の値（デフォルト: `0`）
- `max` - 最大値（デフォルト: `100`）
- `size` - プログレスバーのサイズ（デフォルト: `"md"`）
- `variant` - カラーバリアント（デフォルト: `"default"`）
- `showLabel` - パーセンテージラベルの表示（デフォルト: `false`）
- `animated` - アニメーション効果（デフォルト: `true`）

#### 使用例

```tsx
import { Progress } from "@/components/ui/progress";

<Progress
  value={((qIdx + 1) / quizSet.length) * 100}
  showLabel={true}
  animated={true}
/>
```

## Main Application Component

### App.tsx

メインアプリケーションコンポーネント。全ての学習機能を統合。

#### 主要な状態管理

```typescript
// データ状態
const [all, setAll] = useState<Question[]>([]);
const [dataStatus, setDataStatus] = useState<"loading" | "ready" | "error">("loading");

// SRS状態
const [stats, setStats] = useState<Record<string, ReviewStat>>({});

// 設定状態
const [mode, setMode] = useState<Mode>("word2sense");
const [rangeText, setRangeText] = useState("1-50");
const [numQuestions, setNumQuestions] = useState(10);

// クイズ状態
const [quizSet, setQuizSet] = useState<Question[]>([]);
const [qIdx, setQIdx] = useState(0);
const [score, setScore] = useState(0);
```

#### 主要な関数

##### `nextSRS(prev: ReviewStat | undefined, quality: number): ReviewStat`

SRSアルゴリズムに基づいて次回復習スケジュールを計算

- `prev` - 前回の学習統計
- `quality` - 回答品質（1: Again, 3: Hard, 4: Good, 5: Easy）
- 戻り値: 更新された学習統計

##### `startSession()`

新しい学習セッションを開始

- 復習予定・新規・その他の問題を優先度順に配列
- 指定された問題数分を選択してセッション開始

##### `judge(selected: string)`

回答判定とSRS更新

- 正解/不正解の判定
- SRS統計の更新
- 自動的な次問題への遷移（正解時）

## Types and Interfaces

### Core Types

```typescript
// 例文型
type Example = {
  jp: string;
  translation?: string;
  source?: string
};

// 意味型
type Meaning = {
  sense: string;
  aliases?: string[];
  examples?: Example[]
};

// 単語型
type Word = {
  lemma: string;
  meanings: Meaning[]
};

// 問題型
type Question = {
  id: string;         // "lemma|sense"
  wordNumber: number; // 単語番号（範囲フィルタ用）
  meaningId: string;  // "1-1", "1-2" など
  lemma: string;      // 古語
  sense: string;      // 意味
  examples: Example[]; // 例文配列
};

// 学習モード型
type Mode = "word2sense" | "sense2word" | "example2sense_jp" | "example2sense_tr";

// SRS統計型
type ReviewStat = {
  ef: number;        // 難易度係数 (easiness factor)
  reps: number;      // 連続正解数
  interval: number;  // 復習間隔（日数）
  dueAt: number;     // 次回復習時刻（ミリ秒）
  last: number;      // 前回復習時刻（ミリ秒）
};
```

### Constants

```typescript
// SRSデータのlocalStorageキー
const SRS_KEY = "kobun.srs.v1";

// デフォルトSRS統計
const defaultStat: ReviewStat = {
  ef: 2.5,
  reps: 0,
  interval: 0,
  dueAt: 0,
  last: 0
};
```

## Styling System

アプリケーションはTailwind CSSをベースとしたカスタムデザインシステムを使用：

### カラーパレット

- `primary` - メインブランドカラー（Apple SF Blue）
- `secondary` - テキスト・UI要素用グレー
- `success` - 成功状態（Apple SF Green）
- `danger` - エラー・危険状態（Apple SF Red）
- `warning` - 警告状態
- `surface` - 背景・サーフェス用

### Typography

- `font-display` - タイトル・見出し用（SF Pro Display）
- `font-text` - 本文用（SF Pro Text）
- `font-japanese` - 日本語用（Hiragino等）

### Animation

Apple風のスムーズなアニメーション：

- `apple-ease` - Apple標準のeasing関数
- `fade-in` - フェードイン
- `slide-in` - スライドイン
- `scale-in` - スケールイン

この設計により、一貫したユーザーエクスペリエンスとモダンな見た目を実現しています。