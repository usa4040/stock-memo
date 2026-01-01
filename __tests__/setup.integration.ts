/**
 * 統合テスト用 グローバルセットアップ
 *
 * テスト実行前後のDB接続管理
 */
import prismaTest from "@/lib/prisma-test";
import { resetDatabase, ensureConnection } from "./helpers/db-helper";
import { resetFactoryCounters } from "./factories";

// テスト全体の開始前
beforeAll(async () => {
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
