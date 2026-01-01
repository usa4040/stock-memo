/**
 * 統合テスト用 グローバルセットアップ
 *
 * テスト実行前後のDB接続管理
 * 重要: 開発DBへの誤接続を防ぐセーフガード付き
 */
import prismaTest from "@/lib/prisma-test";
import { resetDatabase, ensureConnection } from "./helpers/db-helper";
import { resetFactoryCounters } from "./factories";

/**
 * テスト用DBへの接続を確認
 * 開発DB（5432）に接続しようとした場合は即座に中止
 */
async function verifyTestDatabase(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL || "";

    // ポート5433（テスト用）以外への接続を禁止
    if (!databaseUrl.includes(":5433/")) {
        console.error("\n");
        console.error("╔══════════════════════════════════════════════════════════════╗");
        console.error("║  ❌ エラー: テスト用DB（ポート5433）に接続していません      ║");
        console.error("║                                                              ║");
        console.error("║  開発DBへの誤った接続を防ぐため、テストを中止します。        ║");
        console.error("║                                                              ║");
        console.error("║  対処法:                                                     ║");
        console.error("║    1. cp .env.test.example .env.test                         ║");
        console.error("║    2. npm run test:all を使用してテストを実行                ║");
        console.error("╚══════════════════════════════════════════════════════════════╝");
        console.error("\n");
        process.exit(1);
    }

    // データベース名に "test" が含まれていることを確認
    if (!databaseUrl.includes("_test")) {
        console.error("\n");
        console.error("⚠️ 警告: DATABASE_URLに '_test' が含まれていません。");
        console.error("テスト用DBには 'stockmemo_test' のような名前を推奨します。");
        console.error("\n");
    }
}

// テスト全体の開始前
beforeAll(async () => {
    await verifyTestDatabase();
    await ensureConnection(prismaTest);
});

// テスト全体の終了後
afterAll(async () => {
    await prismaTest.$disconnect();
});

// 各テストの開始前
beforeEach(async () => {
    await resetDatabase(prismaTest);
    resetFactoryCounters();
});

