# 古文単語学習アプリ | Classical Japanese Vocabulary Learning App

<div align="center">

![Logo](https://img.shields.io/badge/古文単語学習-Classical_Japanese-blue?style=for-the-badge&logo=graduation-cap)

**間隔反復学習で古典文学の語彙をマスターしよう**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 🎯 機能概要

このアプリは高校生・大学受験生向けの古文語彙学習ツールです。科学的な間隔反復学習（SRS）システムを使用して、効率的な暗記と長期記憶の定着を支援します。

### ✨ 主要機能

- **🧠 間隔反復学習（SRS）**: SM-2アルゴリズムによる科学的な復習スケジュール
- **🎮 4つの学習モード**:
  - 古語 → 意味
  - 意味 → 古語
  - 例文 → 意味
  - 例文（訳）→ 古語
- **🎨 Apple風デザイン**: 洗練されたUI/UXデザイン
- **♿ アクセシビリティ**: キーボードナビゲーション・スクリーンリーダー対応
- **📱 レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **📊 学習統計**: 進捗追跡と視覚的フィードバック

## 🚀 クイックスタート

### GitHub Codespaces（推奨）

1. このリポジトリをフォーク
2. **Code** ボタン → **Codespaces** → **Create codespace on main**
3. 自動的に環境が構築され、アプリが起動します

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/USERNAME/kobun-app.git
cd kobun-app

# 依存関係をインストール
npm install --legacy-peer-deps

# 開発サーバーを起動
npm run dev
```

アプリは `http://localhost:5173` で利用できます。

## 🎮 使い方

### 基本操作
1. **出題形式**を選択（古語→意味など）
2. **学習範囲**を指定（例: 1-50）
3. **問題数**を設定（5/10/15/20問）
4. **新しいクイズセット**をクリックして開始

### キーボードショートカット
- **1-4キー**: 選択肢の直接選択
- **↑↓矢印キー**: 選択肢のナビゲーション
- **Enter/Space**: 決定
- **Escape**: キャンセル

### 学習システム
- **正解**: 次の復習までの間隔が延長
- **不正解**: 即座に復習対象として再登場
- **進捗統計**: 復習予定・未学習・正答率を表示

## 🏗️ 技術スタック

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Testing**: Vitest + Playwright
- **Development**: GitHub Codespaces

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── ui/              # UIコンポーネント
│   ├── QuizSettings.tsx # クイズ設定
│   ├── QuizCard.tsx     # クイズカード
│   └── QuizQuestion.tsx # 質問表示
├── hooks/
│   ├── useQuizData.ts   # データ管理
│   ├── useQuizLogic.ts  # クイズロジック
│   └── useKeyboardNavigation.ts
├── types/
│   └── quiz.ts          # 型定義
├── utils/
│   ├── srs.ts          # SRSアルゴリズム
│   ├── shuffle.ts      # シャッフル機能
│   └── validation.ts   # バリデーション
└── App.tsx             # メインアプリ
```

## 📊 データ形式

語彙データは `public/kobun_q.jsonl` に格納されています（JSONL形式）：

```json
{
  "qid": "1-1",
  "lemma": "おどろく",
  "sense": "〔 気づい 〕",
  "word_idx": 1,
  "examples": [{
    "jp": "秋来ぬと目にはさやかに見えねども風の音にぞおどろかれぬる（古今和歌集）",
    "translation": "（訳）秋がやって来たと、目にははっきり見えないけれど、風の音に（もう秋なのだと）自然と〔 気づい 〕たことだ。"
  }]
}
```

## 🧪 開発・テスト

```bash
# テスト実行
npm run test

# E2Eテスト
npm run test:e2e

# ビルド
npm run build

# プレビュー
npm run preview
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- **古典語彙データ**: 教育用古文語彙データセット
- **SM-2アルゴリズム**: Piotr Wozniak博士の間隔反復研究
- **デザインシステム**: Apple Human Interface Guidelines

---

<div align="center">

**🤖 Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>

</div>
