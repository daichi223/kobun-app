# デプロイメントガイド

この文書では、古文単語学習アプリを各種ホスティングプラットフォームにデプロイする手順について説明します。

## 目次

- [デプロイ前の準備](#デプロイ前の準備)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [GitHub Pages](#github-pages)
- [Firebase Hosting](#firebase-hosting)
- [独自サーバー](#独自サーバー)
- [環境変数の設定](#環境変数の設定)
- [パフォーマンス最適化](#パフォーマンス最適化)

## デプロイ前の準備

### 1. プロダクションビルドの確認

```bash
# 依存関係のインストール
npm install

# プロダクションビルド
npm run build

# ローカルでビルド結果をテスト
npm run preview
```

### 2. データファイルの準備

以下のファイルが`public/`ディレクトリに配置されていることを確認：

```
public/
├── kobun_q.jsonl          # メインデータファイル（推奨）
├── kobun_words.jsonl      # フォールバックデータファイル
└── favicon.ico            # ファビコン（オプション）
```

### 3. ビルド出力の確認

```bash
# ビルド出力を確認
ls -la dist/

# 期待される構成:
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── [other-assets]
# ├── kobun_q.jsonl
# └── kobun_words.jsonl
```

## Vercel

### CLI経由でのデプロイ

```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトのデプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

### GitHub連携での自動デプロイ

1. [Vercel](https://vercel.com)にサインアップ
2. GitHubリポジトリをインポート
3. 以下の設定を確認：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Vercel設定ファイル

`vercel.json`:
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
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

## Netlify

### CLI経由でのデプロイ

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# ビルド
npm run build

# デプロイ
netlify deploy --prod --dir=dist
```

### Git連携での自動デプロイ

1. [Netlify](https://netlify.com)にサインアップ
2. GitHubリポジトリを接続
3. ビルド設定：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Netlify設定ファイル

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# SPA用のリダイレクト設定（将来的なルーティング対応）
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## GitHub Pages

### GitHub Actions workflow

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### リポジトリ設定

1. GitHubリポジトリの「Settings」→「Pages」
2. Source: 「GitHub Actions」を選択
3. 上記workflowファイルをコミット＆プッシュ

### Base URL設定（サブディレクトリ配置の場合）

`vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/kobun-app/', // リポジトリ名に合わせて調整
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Firebase Hosting

### Firebase CLI経由でのデプロイ

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseプロジェクトの初期化
firebase init

# ビルド
npm run build

# デプロイ
firebase deploy
```

### Firebase設定ファイル

`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 独自サーバー

### Nginx設定例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/kobun-app;
    index index.html;

    # Gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # キャッシュヘッダー
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # JSONLファイルの適切な配信
    location ~* \.jsonl$ {
        add_header Content-Type "application/json; charset=utf-8";
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### Apache設定例

`.htaccess`:
```apache
# SPAのルーティング対応
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# キャッシュ設定
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Gzip圧縮
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## 環境変数の設定

### 開発環境とプロダクション環境の分離

`.env.local` (開発環境):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG_MODE=true
```

`.env.production` (本番環境):
```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_DEBUG_MODE=false
```

### プラットフォーム別の環境変数設定

#### Vercel
```bash
vercel env add VITE_API_BASE_URL
# プロンプトに従って値を入力
```

#### Netlify
Netlify管理画面 → Site settings → Environment variables

#### GitHub Pages
GitHub Actions内で設定:
```yaml
env:
  VITE_API_BASE_URL: https://api.github.io
```

## パフォーマンス最適化

### ビルド最適化

`vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['src/utils/srs', 'src/utils/shuffle']
        }
      }
    }
  }
});
```

### CDN最適化

静的アセットのCDN配信:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

### Service Worker（PWA対応）

```bash
npm install --save-dev vite-plugin-pwa
```

`vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jsonl}']
      },
      manifest: {
        name: '古文単語学習アプリ',
        short_name: '古文学習',
        description: '間隔反復学習による古典日本語語彙学習',
        theme_color: '#007AFF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

## トラブルシューティング

### よくある問題

#### 1. データファイルが見つからない
- `public/`ディレクトリにJSONLファイルが配置されているか確認
- ビルド後の`dist/`ディレクトリにファイルがコピーされているか確認

#### 2. パスの問題
- `base` URL設定を確認
- 相対パスと絶対パスの使い分けを確認

#### 3. MIME Type エラー
- サーバーでJSONLファイルの適切なContent-Type設定
- `.jsonl` ファイルの拡張子を `.json` に変更することを検討

### デプロイ後の確認事項

1. **基本動作確認**:
   - アプリが正常に起動するか
   - 語彙データが読み込まれるか
   - 学習機能が動作するか

2. **パフォーマンス確認**:
   - Lighthouse スコアチェック
   - 初回読み込み時間の測定
   - モバイル端末での動作確認

3. **SEO確認**:
   - メタタグの設定
   - Open Graph タグの設定
   - サイトマップの生成（必要に応じて）

このガイドに従ってデプロイすることで、安定したプロダクション環境を構築できます。