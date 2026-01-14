# 株メモ 📈

株式投資アイデアを記録・整理するためのメモアプリケーションです。

## 技術スタック

- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth)
- **Testing**: Jest + Playwright
- **CI/CD**: GitHub Actions
- **Language**: TypeScript

## アーキテクチャ

クリーンアーキテクチャに基づいた設計を採用しています。

```
┌─────────────────────────────────────────────────────────────┐
│  app/                 プレゼンテーション層 (Next.js)         │
│  ├── api/            API Routes                             │
│  └── pages/          Pages                                  │
├─────────────────────────────────────────────────────────────┤
│  application/        アプリケーション層                     │
│  └── use-cases/      ユースケース                           │
├─────────────────────────────────────────────────────────────┤
│  domain/             ドメイン層                             │
│  ├── entities/       エンティティ (Memo, Stock, Watchlist)  │
│  ├── repositories/   リポジトリインターフェース             │
│  └── value-objects/  値オブジェクト                         │
├─────────────────────────────────────────────────────────────┤
│  infrastructure/     インフラ層                             │
│  └── repositories/   Prisma実装                             │
└─────────────────────────────────────────────────────────────┘
```

## セットアップ

### 1. 前提条件

- Node.js 20+
- Docker & Docker Compose（データベース用）

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、必要な値を設定してください：

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL接続URL |
| `NEXTAUTH_SECRET` | NextAuth.jsシークレット（`openssl rand -base64 32`で生成） |
| `NEXTAUTH_URL` | アプリケーションURL |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット |

### 3. 依存関係のインストール

```bash
npm install
```

### 4. データベースの起動

```bash
docker-compose up -d
```

### 5. データベースのマイグレーション

```bash
npm run db:migrate
```

### 6. 銘柄データのシード（オプション）

```bash
npm run db:seed
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリにアクセスできます。

## 利用可能なスクリプト

### 開発

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバーを起動（Turbopack） |
| `npm run build` | プロダクションビルドを作成 |
| `npm run start` | プロダクションサーバーを起動 |
| `npm run lint` | ESLintでコードをチェック |

### テスト

| コマンド | 説明 |
|----------|------|
| `npm test` | ユニットテストを実行 |
| `npm run test:watch` | ウォッチモードでテスト実行 |
| `npm run test:coverage` | カバレッジレポート付きでテスト実行 |
| `npm run test:integration` | 統合テストを実行 |
| `npm run test:all` | DB起動→統合テスト→DB停止を一括実行 |
| `npm run test:e2e` | E2Eテスト（Playwright）を実行 |
| `npm run test:e2e:ui` | PlaywrightのUIモードでテスト |

### データベース

| コマンド | 説明 |
|----------|------|
| `npm run db:migrate` | Prismaマイグレーションを実行 |
| `npm run db:push` | スキーマをDBに反映（マイグレーションなし） |
| `npm run db:seed` | 銘柄データをインポート |
| `npm run db:studio` | Prisma Studioを起動 |
| `npm run db:generate` | Prisma Clientを生成 |
| `npm run db:reset` | DBをリセット |

## プロジェクト構造

```
stock-memo/
├── app/                    # Next.js App Router（プレゼンテーション層）
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js 認証
│   │   ├── dashboard/     # ダッシュボードAPI
│   │   ├── memos/         # メモ CRUD API
│   │   ├── stocks/        # 銘柄 API
│   │   └── watchlist/     # ウォッチリストAPI
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # ダッシュボードページ
│   ├── memos/             # メモページ
│   ├── stocks/            # 銘柄ページ
│   └── watchlist/         # ウォッチリストページ
├── application/           # アプリケーション層
│   └── use-cases/         # ユースケース（15個）
├── domain/                # ドメイン層
│   ├── entities/          # エンティティ（Memo, Stock, WatchlistItem）
│   ├── repositories/      # リポジトリインターフェース
│   └── value-objects/     # 値オブジェクト
├── infrastructure/        # インフラ層
│   └── repositories/      # Prismaリポジトリ実装
├── components/            # React コンポーネント
├── lib/                   # ユーティリティ
│   ├── auth.ts           # NextAuth設定
│   └── prisma.ts         # Prisma クライアント
├── prisma/               # Prisma 設定
│   └── schema.prisma     # データベーススキーマ
├── __tests__/            # テストファイル
├── e2e/                  # E2Eテスト（Playwright）
├── docs/                 # ドキュメント
├── scripts/              # スクリプト
├── data/                 # CSVデータ
└── .github/workflows/    # GitHub Actions CI/CD
```

## 主な機能

- 🔐 **Google認証**: Googleアカウントでログイン
- 📝 **メモ管理**: 銘柄ごとにメモを作成・編集・削除
- 🔍 **検索機能**: キーワードでメモを全文検索
- 🏷️ **タグ機能**: メモにタグを付けて整理・フィルタリング
- 📌 **ピン留め**: 重要なメモを上部に固定
- 🔒 **公開設定**: メモを非公開または公開に設定
- 👀 **ウォッチリスト**: 気になる銘柄をウォッチ
- 📊 **ダッシュボード**: 統計情報・最近のメモ・タグ使用状況を表示

## API エンドポイント

### 銘柄 API

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/stocks` | 銘柄一覧（検索・ページネーション対応） |
| GET | `/api/stocks/[code]` | 銘柄詳細 |

### メモ API（認証必須）

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/memos` | メモ一覧（タグフィルタ・キーワード検索対応） |
| POST | `/api/memos` | メモ作成 |
| GET | `/api/memos/[id]` | メモ詳細 |
| PATCH | `/api/memos/[id]` | メモ更新 |
| DELETE | `/api/memos/[id]` | メモ削除 |

### ダッシュボード API（認証必須）

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/dashboard` | ダッシュボードデータ取得 |

### ウォッチリスト API（認証必須）

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/watchlist` | ウォッチリスト取得 |
| POST | `/api/watchlist` | ウォッチリストに追加 |
| GET | `/api/watchlist/[stockCode]` | ウォッチ状態確認 |
| DELETE | `/api/watchlist/[stockCode]` | ウォッチリストから削除 |

## CI/CD

GitHub Actionsで以下を自動実行：

1. **Lint**: ESLintによるコードチェック
2. **Test**: Jestによるユニットテスト  
3. **Build**: プロダクションビルド確認

## ライセンス

MIT
