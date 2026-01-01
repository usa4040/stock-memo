# Stock Memo 設計書

このディレクトリには、Stock Memo アプリケーションの設計ドキュメントが含まれています。

## 📚 ドキュメント一覧

### アーキテクチャ設計

| ドキュメント | 説明 |
|---|---|
| [アーキテクチャ概要](./architecture/overview.md) | システム全体の構成、設計思想、技術スタック |
| [ドメインモデル](./architecture/domain-model.md) | エンティティ、値オブジェクト、リポジトリの詳細 |
| [レイヤー責務](./architecture/layers.md) | 各層の責務と依存関係ルール |

### データベース設計

| ドキュメント | 説明 |
|---|---|
| [データベーススキーマ](./database/schema.md) | ER図、テーブル定義、インデックス戦略 |

### API設計

| ドキュメント | 説明 |
|---|---|
| [APIエンドポイント仕様](./api/endpoints.md) | RESTful API仕様、リクエスト/レスポンス例 |

### 機能設計

| ドキュメント | 説明 |
|---|---|
| [認証機能](./features/authentication.md) | NextAuth.jsによる認証・認可フロー |
| [メモ管理](./features/memo-management.md) | メモのCRUD、タグ、ピン留め、公開設定 |
| [銘柄管理](./features/stock-management.md) | 銘柄データの検索・表示 |
| [ウォッチリスト](./features/watchlist.md) | 銘柄のウォッチ機能 |

### アーキテクチャ決定記録 (ADR)

| ドキュメント | 説明 |
|---|---|
| [ADR-001: クリーンアーキテクチャ](./decisions/001-clean-architecture.md) | クリーンアーキテクチャ採用の背景と決定 |

### テスト

| ドキュメント | 説明 |
|---|---|
| [テスト戦略](./testing/strategy.md) | テストピラミッド、レイヤー別テスト方針、統合テスト |

---

## 🗂️ ディレクトリ構成

```
docs/
├── README.md                    # このファイル
├── architecture/                # アーキテクチャ設計
│   ├── overview.md
│   ├── domain-model.md
│   └── layers.md
├── database/                    # データベース設計
│   └── schema.md
├── api/                         # API設計
│   └── endpoints.md
├── features/                    # 機能設計
│   ├── authentication.md
│   ├── memo-management.md
│   ├── stock-management.md
│   └── watchlist.md
├── testing/                     # テスト設計
│   └── strategy.md
└── decisions/                   # ADR
    └── 001-clean-architecture.md
```

---

## 📝 ドキュメント更新ガイドライン

1. **コードと同期**: 実装変更時は関連するドキュメントも更新してください
2. **Mermaid図**: ER図やフロー図はMermaid記法で記述しています
3. **ADR追加**: 重要な設計判断を行った場合は `decisions/` に ADR を追加してください

---

*最終更新: 2026-01-02*
