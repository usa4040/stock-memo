# Stock Memo 📈

株式投資アイデアを記録・整理するためのメモアプリケーションです。

## 技術スタック

- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Language**: TypeScript

## セットアップ

### 1. 前提条件

- Node.js 18+
- Docker & Docker Compose（データベース用）

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、必要な値を設定してください。

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

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルドを作成 |
| `npm run start` | プロダクションサーバーを起動 |
| `npm run lint` | ESLintでコードをチェック |
| `npm run db:migrate` | Prismaマイグレーションを実行 |
| `npm run db:push` | スキーマをDBに反映（マイグレーションなし） |
| `npm run db:seed` | 銘柄データをインポート |
| `npm run db:studio` | Prisma Studioを起動 |
| `npm run db:generate` | Prisma Clientを生成 |
| `npm run db:reset` | DBをリセット |

## プロジェクト構造

```
stock-memo/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js 認証
│   │   ├── memos/         # メモ CRUD API
│   │   └── stocks/        # 銘柄 API
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # React コンポーネント
├── lib/                   # ユーティリティ
│   └── prisma.ts         # Prisma クライアント
├── prisma/               # Prisma 設定
│   └── schema.prisma     # データベーススキーマ
├── scripts/              # スクリプト
├── types/                # 型定義
└── data/                 # CSVデータ
```

## 主な機能

- 🔐 **認証**: メールアドレスで簡単ログイン
- 📝 **メモ管理**: 銘柄ごとにメモを作成・編集・削除
- 🏷️ **タグ機能**: メモにタグを付けて整理
- 📌 **ピン留め**: 重要なメモを上部に固定
- 🔒 **公開設定**: メモを非公開または公開に設定

## API エンドポイント

### 銘柄 API

- `GET /api/stocks` - 銘柄一覧（検索・ページネーション対応）
- `GET /api/stocks/[code]` - 銘柄詳細

### メモ API（認証必須）

- `GET /api/memos` - メモ一覧
- `POST /api/memos` - メモ作成
- `GET /api/memos/[id]` - メモ詳細
- `PATCH /api/memos/[id]` - メモ更新
- `DELETE /api/memos/[id]` - メモ削除

## ライセンス

MIT
