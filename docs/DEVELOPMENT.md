# 開発・デプロイメントガイド

この文書では、古文単語学習アプリケーションの開発環境のセットアップから本番環境でのデプロイメントまでの手順について詳しく説明します。

## 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [開発ワークフロー](#開発ワークフロー)
- [テスト](#テスト)
- [ビルドとデプロイメント](#ビルドとデプロイメント)
- [環境設定](#環境設定)
- [トラブルシューティング](#トラブルシューティング)

## 開発環境のセットアップ

### 前提条件

以下のソフトウェアが必要です：

- **Node.js**: v18.0.0以上（推奨: v20.x LTS）
- **npm**: v8.0.0以上（または yarn v1.22.0以上）
- **Git**: v2.30.0以上
- **モダンブラウザ**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Node.jsのインストール

#### Option 1: 公式サイトから

```bash
# https://nodejs.org/から最新のLTSをダウンロードしてインストール
node --version  # v20.x.x を確認
npm --version   # v10.x.x を確認
```

#### Option 2: Node Version Manager (nvm)

```bash
# nvmのインストール（Linux/macOS）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.jsのインストール
nvm install --lts
nvm use --lts
```

### プロジェクトのクローンとセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd kobun-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 開発環境の確認

```bash
# 動作確認
curl http://localhost:5173  # 開発サーバーへのアクセス

# ビルド確認
npm run build
npm run preview
```

## プロジェクト構造

```
kobun-app/
├── public/                    # 静的ファイル
│   ├── kobun_q.jsonl         # 語彙データ（メイン）
│   ├── kobun_words.jsonl     # 語彙データ（フォールバック）
│   └── favicon.ico           # ファビコン
├── src/                       # ソースコード
│   ├── components/           # Reactコンポーネント
│   │   └── ui/              # 再利用可能なUIコンポーネント
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       └── select.tsx
│   ├── utils/               # ユーティリティ関数
│   │   ├── srs.ts          # SRSアルゴリズム
│   │   ├── srs.test.ts     # SRSテスト
│   │   └── shuffle.test.ts # シャッフルテスト
│   ├── App.tsx             # メインアプリケーション
│   ├── main.tsx            # エントリーポイント
│   └── vite-env.d.ts       # Vite型定義
├── docs/                    # ドキュメンテーション
├── tests/                   # テストファイル
├── dist/                    # ビルド出力（生成される）
├── node_modules/            # npm依存関係（生成される）
├── package.json             # プロジェクト設定
├── vite.config.ts          # Vite設定
├── tsconfig.json           # TypeScript設定
├── tailwind.config.js      # Tailwind CSS設定
├── postcss.config.js       # PostCSS設定
└── eslint.config.js        # ESLint設定
```

### 重要なファイル

#### `package.json`
```json
{
  "scripts": {
    "dev": "vite",              // 開発サーバー起動
    "build": "tsc -b && vite build",  // 本番ビルド
    "lint": "eslint .",         // コードリンティング
    "preview": "vite preview",  // ビルド結果プレビュー
    "test": "vitest",          // テスト実行
    "test:coverage": "vitest run --coverage"  // カバレッジ付きテスト
  }
}
```

#### `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @エイリアス設定
    },
  },
});
```

## 開発ワークフロー

### 1. 機能開発の流れ

```bash
# 1. 新しいブランチを作成
git checkout -b feature/新機能名

# 2. 開発環境を起動
npm run dev

# 3. コードを編集
# src/内のファイルを編集

# 4. リアルタイムでプレビュー確認
# http://localhost:5173 でブラウザ確認

# 5. テストを実行
npm test

# 6. リンティング
npm run lint

# 7. コミット
git add .
git commit -m "feat: 新機能の追加"

# 8. プッシュ
git push origin feature/新機能名
```

### 2. コード品質の維持

#### TypeScript設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,           // 厳格な型チェック
    "noEmit": true,          // 出力なし（Viteが処理）
    "jsx": "react-jsx"       // React 17+ JSX変換
  }
}
```

#### ESLint設定
```javascript
// eslint.config.js
export default defineConfig([
  // TypeScript + React対応の設定
]);
```

### 3. ホットリロード開発

Viteのホットモジュールリプレースメント（HMR）により、コード変更時に即座に画面が更新されます：

- **React Fast Refresh**: コンポーネントの状態を保持したまま更新
- **CSS Hot Update**: スタイル変更の即座反映
- **TypeScript インクリメンタルビルド**: 高速な型チェック

## テスト

### テストフレームワーク構成

- **Vitest**: 高速なテスト実行環境
- **Testing Library**: Reactコンポーネントテスト
- **Mock**: localStorage, Date.now()などのモック

### テスト実行

```bash
# 全テストの実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジレポートの生成
npm run test:coverage

# 特定のテストファイル実行
npx vitest src/utils/srs.test.ts
```

### テスト例

```typescript
// src/utils/srs.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { nextSRS, defaultStat } from './srs';

describe('SRS Algorithm', () => {
  it('should initialize correctly for new items', () => {
    const result = nextSRS(undefined, 4);
    expect(result.reps).toBe(1);
    expect(result.interval).toBe(1);
  });
});
```

### カバレッジ目標

- **全体カバレッジ**: 80%以上
- **関数カバレッジ**: 90%以上
- **クリティカル部分**: 100%（SRSアルゴリズム等）

## ビルドとデプロイメント

### ローカルビルド

```bash
# TypeScriptコンパイル + Viteビルド
npm run build

# ビルド結果の確認
ls -la dist/

# ローカルでビルド結果をプレビュー
npm run preview
```

### ビルド出力

```
dist/
├── index.html              # エントリーHTML
├── assets/
│   ├── index-[hash].js     # バンドルされたJavaScript
│   ├── index-[hash].css    # バンドルされたCSS
│   └── [asset-hash].*      # その他のアセット
└── kobun_q.jsonl          # 語彙データ（コピー）
```

### 静的ファイルホスティング

#### Vercel

```bash
# Vercelにデプロイ
npx vercel

# 本番デプロイ
npx vercel --prod
```

`vercel.json`設定例:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ]
}
```

#### Netlify

```bash
# Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

`netlify.toml`設定例:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

#### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 環境設定

### 開発環境変数

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG_MODE=true
VITE_SRS_VERSION=v1
```

### 本番環境最適化

#### Vite設定

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false,           // ソースマップ無効
    minify: 'terser',          // 最小化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']  // ベンダーチャンクの分離
        }
      }
    }
  },
  server: {
    port: 5173,                // 開発サーバーポート
    open: true                 // 自動ブラウザ起動
  }
});
```

### パフォーマンス最適化

#### 1. バンドルサイズの最適化

```bash
# バンドルサイズの分析
npm install --save-dev vite-bundle-analyzer
npx vite-bundle-analyzer
```

#### 2. 画像最適化

```bash
# WebP変換等の画像最適化
npm install --save-dev vite-plugin-imagemin
```

#### 3. PWA対応

```bash
# PWA機能追加
npm install --save-dev vite-plugin-pwa
```

## トラブルシューティング

### 一般的な問題

#### 1. ポート競合

```bash
# ポート変更
npm run dev -- --port 3000

# または vite.config.ts で設定
export default defineConfig({
  server: { port: 3000 }
});
```

#### 2. モジュール解決エラー

```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
npm run dev -- --force
```

#### 3. TypeScriptエラー

```bash
# 型チェック
npx tsc --noEmit

# eslint修正
npm run lint -- --fix
```

#### 4. ビルドエラー

```bash
# 詳細ログでビルド
npm run build -- --mode development

# メモリ不足時
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### デバッグツール

#### React Developer Tools

```bash
# ブラウザ拡張機能をインストール
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

#### Vite DevTools

```bash
# 開発時の詳細ログ
DEBUG=vite:* npm run dev
```

### パフォーマンス計測

#### Bundle分析

```bash
# ビルド時間計測
time npm run build

# バンドルサイズ確認
ls -lh dist/assets/
```

#### ランタイム計測

```javascript
// Performance API使用例
console.time('Component Render');
// レンダリング処理
console.timeEnd('Component Render');

// メモリ使用量
console.log('Memory:', performance.memory?.usedJSHeapSize);
```

この開発ガイドに従って、効率的で高品質なアプリケーション開発を進めることができます。問題が発生した場合は、トラブルシューティングセクションを参照してください。