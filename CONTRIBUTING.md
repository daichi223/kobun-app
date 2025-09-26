# コントリビューションガイド

古文単語学習アプリプロジェクトへの貢献を歓迎します！このガイドでは、プロジェクトに効果的に貢献する方法について説明します。

## 目次

- [行動規範](#行動規範)
- [貢献方法](#貢献方法)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [コーディング規約](#コーディング規約)
- [プルリクエストのプロセス](#プルリクエストのプロセス)
- [イシューの報告](#イシューの報告)
- [コミットメッセージの規約](#コミットメッセージの規約)
- [リリースプロセス](#リリースプロセス)

## 行動規範

### 私たちの約束

私たちはオープンで歓迎的なコミュニティを育成することを約束します：

- **包括性**: 年齢、体型、障害、民族性、性自認、経験レベル、教育、社会経済的地位、国籍、外見、人種、宗教、性的アイデンティティと指向に関係なく、すべての人を歓迎します
- **敬意**: 異なる視点と経験を尊重します
- **建設性**: 建設的な批判を行い、優雅に受け入れます
- **コミュニティ重視**: コミュニティにとって最善のことに焦点を当てます

### 期待される行動

- 包括的で歓迎的な言語を使用する
- 異なる視点と経験を尊重する
- 建設的な批判を優雅に受け入れる
- コミュニティにとって最善のことに焦点を当てる
- 他のコミュニティメンバーに共感を示す

## 貢献方法

### 貢献の種類

以下のような形で貢献できます：

1. **バグ報告**: 問題を発見した場合はイシューを作成
2. **機能提案**: 新機能のアイデアを共有
3. **コード貢献**: バグ修正や新機能の実装
4. **ドキュメンテーション**: ドキュメントの改善や追加
5. **データ貢献**: 語彙データの改善や追加
6. **テスト**: テストケースの追加や改善
7. **UI/UXデザイン**: ユーザーインターフェースの改善
8. **翻訳**: 多言語対応への協力

### 初心者向けのタスク

プロジェクトに慣れるために、以下のタスクから始めることをお勧めします：

- ドキュメントの誤字脱字の修正
- コメントの追加や改善
- 簡単なバグ修正
- テストケースの追加
- UIの微調整

これらのタスクには `good first issue` ラベルが付けられています。

## 開発環境のセットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Git
- 現代的なテキストエディタ（VS Code推奨）

### セットアップ手順

```bash
# 1. リポジトリをフォーク
# GitHubでForkボタンをクリック

# 2. クローン
git clone https://github.com/[YOUR-USERNAME]/kobun-app.git
cd kobun-app

# 3. リモートを追加
git remote add upstream https://github.com/[ORIGINAL-OWNER]/kobun-app.git

# 4. 依存関係をインストール
npm install

# 5. 開発サーバーを起動
npm run dev

# 6. テストを実行
npm test
```

### 推奨エディタ設定

#### VS Code

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

推奨拡張機能:
- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense
- Auto Rename Tag

## コーディング規約

### TypeScript/JavaScript

#### 命名規則

```typescript
// 変数・関数: camelCase
const userName = 'john';
const calculateScore = () => {};

// 定数: UPPER_SNAKE_CASE
const SRS_KEY = 'kobun.srs.v1';
const DEFAULT_INTERVAL = 1;

// 型・インターフェース: PascalCase
interface ReviewStat {
  ef: number;
  reps: number;
}

type Mode = 'word2sense' | 'sense2word';

// コンポーネント: PascalCase
const Button = () => {};
const QuizCard = () => {};
```

#### 関数とコンポーネント

```typescript
// 関数: アロー関数を優先
const calculateNext = (prev: ReviewStat, quality: number): ReviewStat => {
  // 実装
};

// Reactコンポーネント: 関数宣言または名前付きアロー関数
const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// または
function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

#### インポート順序

```typescript
// 1. Node modules
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 内部ライブラリ/ユーティリティ
import { nextSRS } from '@/utils/srs';
import { shuffle } from '@/utils/shuffle';

// 3. コンポーネント
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. 型定義
import type { ReviewStat, Question } from '@/types';
```

### CSS/Tailwind

#### クラス名の順序

```tsx
// レイアウト → タイポグラフィ → カラー → その他
<button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>
```

#### カスタムクラス

```css
/* utilities.css */
@layer utilities {
  .font-japanese {
    font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', sans-serif;
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-in;
  }
}
```

### コメント規約

#### 関数コメント

```typescript
/**
 * SRSアルゴリズムに基づいて次回復習スケジュールを計算
 *
 * @param prev - 前回の学習統計（初回学習時はundefined）
 * @param quality - 回答品質 (1: Again, 3: Hard, 4: Good, 5: Easy)
 * @returns 更新された学習統計
 *
 * @example
 * const newStat = nextSRS(prevStat, 4); // Good評価
 * console.log(newStat.interval); // 次回復習までの日数
 */
const nextSRS = (prev: ReviewStat | undefined, quality: number): ReviewStat => {
  // 実装
};
```

#### インラインコメント

```typescript
// 品質値を0-5の範囲にクランプ
const q = Math.max(0, Math.min(5, quality));

// 不正解時はリセット、正解時は進行
if (q < 3) {
  s.reps = 0;      // 連続正解数をリセット
  s.interval = 1;  // 翌日再出題
} else {
  s.reps += 1;     // 正解数をインクリメント
  // 間隔の計算: 1日 → 6日 → EF倍
  if (s.reps === 1) s.interval = 1;
  else if (s.reps === 2) s.interval = 6;
  else s.interval = Math.round(s.interval * s.ef);
}
```

## プルリクエストのプロセス

### 1. 事前準備

```bash
# 最新のmainブランチを取得
git checkout main
git pull upstream main

# 新しいブランチを作成
git checkout -b feature/新機能名
# または
git checkout -b fix/修正内容
```

### 2. 開発

```bash
# 変更を実装
# ファイルを編集...

# テストを実行
npm test

# リンティング
npm run lint

# TypeScriptチェック
npx tsc --noEmit

# ビルド確認
npm run build
```

### 3. コミット

```bash
# ステージング
git add .

# コミット（コミットメッセージ規約に従う）
git commit -m "feat: 新機能の説明"

# プッシュ
git push origin feature/新機能名
```

### 4. プルリクエスト作成

GitHubでプルリクエストを作成し、以下の情報を含めてください：

#### プルリクエストテンプレート

```markdown
## 概要
このPRは何を行うものですか？

## 変更内容
- [ ] 機能追加
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] リファクタリング
- [ ] テスト追加

## テスト
- [ ] 既存のテストがすべて通過する
- [ ] 新しいテストを追加した（該当する場合）
- [ ] 手動テストを行った

## スクリーンショット
（UI変更がある場合）

## 関連Issue
Fixes #123

## チェックリスト
- [ ] コードがプロジェクトのスタイルガイドに従っている
- [ ] 自己レビューを行った
- [ ] コードに適切なコメントを追加した
- [ ] ドキュメントを更新した（該当する場合）
- [ ] 変更がbreaking changeでない（または適切にマークされている）
```

### 5. レビュープロセス

- メンテナーがコードレビューを実施
- フィードバックに基づいて必要な修正を実施
- すべてのチェックが通過後、マージされます

## イシューの報告

### バグ報告

バグを発見した場合は、以下のテンプレートを使用してください：

```markdown
## バグの説明
バグの明確で簡潔な説明

## 再現手順
1. '...'に移動
2. '....'をクリック
3. '....'まで下にスクロール
4. エラーを確認

## 期待される動作
何が起こるべきだったかの明確で簡潔な説明

## 実際の動作
何が実際に起こったかの説明

## スクリーンショット
問題を説明するのに役立つスクリーンショット

## 環境
- OS: [例: iOS]
- ブラウザ: [例: Chrome, Safari]
- バージョン: [例: 22]

## 追加コンテキスト
問題に関する他のコンテキストを追加
```

### 機能要望

新機能の提案には以下のテンプレートを使用してください：

```markdown
## 機能要望の説明
追加したい機能の明確で簡潔な説明

## 問題の説明
この機能要望に関連する問題の説明（あれば）

## 提案する解決策
希望する解決策の明確で簡潔な説明

## 代替案の検討
検討した代替ソリューションや機能の説明

## 追加コンテキスト
機能要望に関する他のコンテキストやスクリーンショット
```

## コミットメッセージの規約

[Conventional Commits](https://www.conventionalcommits.org/)形式を使用します：

### 基本フォーマット

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コード動作に影響しないフォーマット変更
- `refactor`: バグ修正も機能追加もしないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加や修正
- `chore`: ビルドプロセスや補助ツールの変更

### 例

```bash
# 新機能
git commit -m "feat: SRS難易度調整機能を追加"

# バグ修正
git commit -m "fix: 問題数選択時のエラーを修正"

# ドキュメント
git commit -m "docs: APIドキュメントを更新"

# スコープ付き
git commit -m "feat(ui): プログレスバーコンポーネントを追加"

# Breaking Change
git commit -m "feat!: 新しいデータフォーマットに移行

BREAKING CHANGE: 旧形式のJSONLファイルはサポートされなくなりました"
```

## リリースプロセス

### バージョニング

[Semantic Versioning (SemVer)](https://semver.org/)に従います：

- `MAJOR`: 互換性のない変更
- `MINOR`: 後方互換性のある機能追加
- `PATCH`: 後方互換性のあるバグ修正

### リリース手順

```bash
# 1. mainブランチを最新に
git checkout main
git pull origin main

# 2. バージョンアップ
npm version [patch|minor|major]

# 3. タグをプッシュ
git push origin main --tags

# 4. GitHub Releasesで公開
# GitHubのリリースページから作成
```

### リリースノート

各リリースには以下を含めてください：

- 新機能
- バグ修正
- 重要な変更
- 既知の問題
- アップグレードガイド（必要な場合）

## コミュニティ

### 質問とサポート

- **GitHub Discussions**: 一般的な質問や議論
- **GitHub Issues**: バグ報告や機能要望
- **Discord**: リアルタイムなコミュニケーション（設定される場合）

### 連絡先

- プロジェクトメンテナー: @[maintainer-username]
- セキュリティ関連: security@[project-domain].com

## 謝辞

このプロジェクトに貢献してくださるすべての方に感謝します。皆様の努力により、より良い学習ツールを提供できています。

---

ご質問がありましたら、いつでもお気軽にお声かけください。皆様の貢献をお待ちしています！