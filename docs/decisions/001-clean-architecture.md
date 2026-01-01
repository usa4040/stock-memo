# ADR-001: クリーンアーキテクチャの採用

**ステータス:** 採用済み  
**決定日:** 2025年  
**影響範囲:** プロジェクト全体

---

## コンテキスト

Stock Memoは、株式投資メモを管理するWebアプリケーションです。プロジェクト開始時に、アプリケーションのアーキテクチャを決定する必要がありました。

### 検討した選択肢

1. **フラットなアーキテクチャ（従来型）**
   - Next.js API Routes内にビジネスロジックを直接記述
   - Prismaモデルをそのまま使用

2. **クリーンアーキテクチャ**
   - Domain層、Application層、Infrastructure層、Presentation層に分離
   - ドメインモデルをフレームワークから独立させる

3. **ヘキサゴナルアーキテクチャ**
   - ポートとアダプターパターン
   - クリーンアーキテクチャと類似

---

## 決定

**クリーンアーキテクチャを採用する。**

以下の4層構造でプロジェクトを構成する：

```
┌─────────────────────────────────────┐
│         Presentation層             │
│   (Next.js, React, API Routes)     │
├─────────────────────────────────────┤
│         Application層              │
│         (ユースケース)              │
├─────────────────────────────────────┤
│           Domain層                 │
│  (エンティティ、値オブジェクト、     │
│   リポジトリインターフェース)        │
├─────────────────────────────────────┤
│        Infrastructure層            │
│    (Prisma、外部サービス実装)        │
└─────────────────────────────────────┘
```

---

## 理由

### 1. テスト容易性

Domain層とApplication層をフレームワークから分離することで、単体テストが容易になります。

```typescript
// モックリポジトリを注入してテスト可能
const mockRepo = { findById: jest.fn(), save: jest.fn() };
const useCase = new CreateMemoUseCase(mockRepo);
```

### 2. ビジネスロジックの明確化

エンティティ内にビジネスルールをカプセル化することで、ロジックの所在が明確になります。

```typescript
class Memo {
    // ビジネスルールがエンティティ内に集約
    updateTags(tags: string[]): void {
        if (tags.length > 10) {
            throw new Error("タグは最大10個までです");
        }
        this._tags = [...tags];
    }
}
```

### 3. フレームワーク非依存

将来的にフレームワーク（Next.js、Prisma等）を変更する場合でも、Domain層とApplication層は変更不要です。

### 4. 関心の分離

各層が明確な責務を持つことで、コードの見通しが良くなります。

| 層 | 責務 |
|---|---|
| Domain | ビジネスルールの表現 |
| Application | ユースケースの実装 |
| Infrastructure | 外部サービスとの連携 |
| Presentation | UIとAPI |

---

## 結果

### ポジティブな影響

- ✅ ドメインモデルが明確に文書化された
- ✅ ユースケースごとに処理が分離され、理解しやすい
- ✅ テストコードが書きやすくなった
- ✅ 新機能追加時の影響範囲が明確

### ネガティブな影響

- ⚠️ 初期のボイラープレートコードが増加
- ⚠️ 小規模な変更でも複数ファイルを修正する必要がある
- ⚠️ 学習コストがやや高い

---

## 実装ガイドライン

### 依存関係ルール

依存は常に内側（Domain層）に向かわせる。

```
Presentation → Application → Domain ← Infrastructure
```

### 新機能追加時のフロー

1. Domain層：エンティティ、値オブジェクトを定義
2. Domain層：リポジトリインターフェースを定義
3. Application層：ユースケースを実装
4. Infrastructure層：リポジトリを実装
5. Presentation層：API RouteとUIを実装

### ディレクトリ構成

```
├── domain/          # ビジネスロジック（最も重要）
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/     # ユースケース
│   └── use-cases/
├── infrastructure/  # 外部サービス実装
│   └── repositories/
└── app/            # Next.js（Presentation）
    └── api/
```

---

## 関連ドキュメント

- [アーキテクチャ概要](../architecture/overview.md)
- [ドメインモデル](../architecture/domain-model.md)
- [レイヤー責務](../architecture/layers.md)

---

## 参考資料

- [The Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture 達人に学ぶソフトウェアの構造と設計](https://www.amazon.co.jp/dp/4048930656)
