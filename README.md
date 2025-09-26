# 古文単語学習アプリ (Kobun Learning App)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

間隔反復学習（SRS: Spaced Repetition System）を使用した古典日本語語彙学習アプリケーション。古典文学の単語とその意味を効率的に暗記できるように設計されています。

## 📚 主な機能

- **間隔反復学習（SRS）**: SM-2アルゴリズムに基づく最適化された復習スケジューリング
- **複数の学習モード**:
  - 古語 → 意味
  - 意味 → 古語
  - 例文 → 意味
  - 例文（現代語訳）→ 古語
- **範囲指定学習**: 特定の単語範囲に限定した学習が可能
- **学習進捗管理**: 復習予定・未学習問題数の可視化
- **古典例文表示**: 古典文学からの実用例文と現代語訳
- **レスポンシブデザイン**: デスクトップ・タブレット・スマートフォン対応

## 🚀 クイックスタート

### 前提条件

- Node.js (v18.0.0 以上)
- npm または yarn

### インストールと起動

```bash
# リポジトリをクローン
git clone <repository-url>
cd kobun-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを使用できます。

### データファイルの準備

アプリケーションには語彙データが必要です：

1. `public/kobun_q.jsonl` または `public/kobun_words.jsonl` にJSONLフォーマットの語彙データを配置
2. データフォーマットの詳細は [docs/DATA_FORMAT.md](docs/DATA_FORMAT.md) を参照

## 📖 使用方法

### 基本的な学習フロー

1. **学習モード選択**: ドロップダウンから学習形式を選択
2. **範囲設定**: 学習したい単語の範囲を指定（例: "1-50"）
3. **問題数設定**: 1セッションあたりの問題数を選択（5-20問）
4. **学習開始**: "新しいクイズセット" ボタンをクリック
5. **問題解答**: 4択から正解を選択
6. **結果確認**: 正解・不正解に応じてSRSアルゴリズムが次回復習日を自動調整

### 学習モード詳細

- **古語 → 意味**: 古語が表示され、現代語の意味を選択
- **意味 → 古語**: 現代語の意味が表示され、対応する古語を選択
- **例文 → 意味**: 古典例文が表示され、文中の古語の意味を選択
- **例文（訳）→ 古語**: 現代語訳が表示され、対応する古語を選択

## 🏗️ プロジェクト構造

```
kobun-app/
├── public/
│   ├── kobun_q.jsonl          # 語彙データファイル（メイン）
│   └── kobun_words.jsonl      # 語彙データファイル（フォールバック）
├── src/
│   ├── components/
│   │   └── ui/                # 再利用可能なUIコンポーネント
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       └── select.tsx
│   ├── utils/
│   │   ├── srs.test.ts        # SRSアルゴリズムのテスト
│   │   └── shuffle.test.ts    # シャッフル機能のテスト
│   ├── App.tsx                # メインアプリケーションコンポーネント
│   └── main.tsx               # エントリーポイント
├── docs/                      # ドキュメンテーション
└── tests/                     # テストファイル
```

## 🧠 SRSアルゴリズム

このアプリケーションは簡素化されたSM-2（SuperMemo 2）アルゴリズムを使用：

- **品質評価**: 1（Again）, 3（Hard）, 4（Good）, 5（Easy）
- **間隔計算**: 初回1日、2回目6日、以降は難易度係数に基づいて計算
- **難易度係数**: 1.3-2.5の範囲で動的調整
- **復習タイミング**: 各アイテムの習熟度に基づいて個別に設定

詳細は [docs/SRS_ALGORITHM.md](docs/SRS_ALGORITHM.md) を参照してください。

## 🧪 テスト

```bash
# 全テストを実行
npm test

# テストをウォッチモードで実行
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

## 🏃‍♂️ ビルドとデプロイ

### 本番ビルド

```bash
# 本番用ビルドを作成
npm run build

# ビルド結果をプレビュー
npm run preview
```

### デプロイ

詳細なデプロイ手順は [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) を参照してください。

## 🛠️ 開発

### 開発環境セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動（HMR付き）
npm run dev

# リンターを実行
npm run lint

# TypeScriptタイプチェック
npx tsc --noEmit
```

### 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest + Testing Library
- **リンター**: ESLint + TypeScript ESLint

## 📋 データフォーマット

語彙データは JSONL (JSON Lines) 形式で提供：

```jsonl
{"qid": "1-1", "lemma": "おどろく", "group": 1, "sub": 1, "word_idx": 1, "meaning_idx": 1, "sense": "〔 気づい 〕", "examples": [{"jp": "秋来ぬと目にはさやかに見えねども風の音にぞおどろかれぬる（古今和歌集）", "translation": "（訳）秋がやって来たと、目にははっきり見えないけれど、風の音に（もう秋なのだと）自然と〔 気づい 〕たことだ。"}]}
```

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 📞 サポート

- **問題報告**: [GitHub Issues](../../issues)
- **機能要望**: [GitHub Discussions](../../discussions)
- **ドキュメンテーション**: [docs/](docs/) フォルダ

## 🔄 更新履歴

最新の変更については [CHANGELOG.md](CHANGELOG.md) をご覧ください。
