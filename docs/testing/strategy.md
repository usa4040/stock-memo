# テスト戦略

## 概要

Stock Memoは**クリーンアーキテクチャ**に基づき、各レイヤーに適したテスト方式を採用しています。

---

## テストピラミッド

```
          ┌─────────────┐
          │   E2E (将来) │  ← 少量・遅い
          ├─────────────┤
          │  統合テスト   │  ← Infrastructure層
          ├─────────────┤
          │ ユニットテスト │  ← Domain/Application層（多量・高速）
          └─────────────┘
```

---

## レイヤー別テスト方針

| レイヤー | テスト方式 | DB | 理由 |
|----------|-----------|-----|------|
| Domain層 | ユニットテスト | ❌ | 純粋なビジネスロジック |
| Application層 | ユニットテスト | ❌ | ロジックの組み合わせ |
| Infrastructure層 | **統合テスト** | ✅ | DB操作の検証が必要 |
| Presentation層 | E2E（将来） | ✅ | ユーザーフロー全体 |

---

## テスト実行方法

### ユニットテスト（高速）

```bash
npm run test        # 全ユニットテスト
npm run test:watch  # ウォッチモード
```

### 統合テスト（DB使用）

```bash
# 1. テスト用DB起動 + マイグレーション
npm run test:db:setup

# 2. 統合テスト実行
npm run test:integration

# 3. テスト用DB停止
npm run test:db:teardown

# または一括実行
npm run test:all
```

---

## テスト用DB

- **ポート**: 5433（開発DBは5432）
- **Docker**: `docker-compose.test.yml`
- **環境変数**: `.env.test`

---

## Factory パターン

テストデータ生成用に**自作のFactoryパターン**を実装しています。
Node.js/Prisma環境には標準のFactory機能がないため、必要な機能をシンプルに実装しています。

```typescript
const user = await UserFactory.create(prismaTest);
const memo = await MemoFactory.create(prismaTest, {
    userId: user.id,
    content: "テスト内容",
});
```

---

## ディレクトリ構成

```
__tests__/
├── domain/           # Domain層ユニットテスト
├── application/      # Application層ユニットテスト
├── infrastructure/   # モックを使ったユニットテスト
├── integration/      # 【新規】統合テスト（実DB使用）
│   └── repositories/
├── factories/        # 【新規】テストデータFactory
├── helpers/          # 【新規】テストヘルパー
└── setup.integration.ts  # 統合テスト用セットアップ
```

---

*参照: [ADR-001: クリーンアーキテクチャ](../decisions/001-clean-architecture.md)*
