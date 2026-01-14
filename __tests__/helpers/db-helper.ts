/**
 * テスト用DBヘルパー
 *
 * 統合テストで使用するユーティリティ関数
 */
import { PrismaClient } from "@prisma/client";

/**
 * データベースをリセット（全テーブルのデータを削除）
 *
 * 外部キー制約を考慮して削除順序を指定
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
    // 削除順序は外部キー制約を考慮（子テーブルから削除）
    await prisma.$transaction([
        prisma.memo.deleteMany(),
        prisma.watchlistItem.deleteMany(),
        prisma.account.deleteMany(),
        prisma.session.deleteMany(),
        prisma.user.deleteMany(),
        prisma.stock.deleteMany(), // テスト用DBでは銘柄も削除
    ]);
}

/**
 * データベース接続を確認
 */
export async function ensureConnection(prisma: PrismaClient): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
}

/**
 * テスト用のトランザクションラッパー
 *
 * テスト後に自動ロールバック
 */
export async function withTransaction<T>(
    prisma: PrismaClient,
    fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
    return prisma.$transaction(async (tx) => {
        await fn(tx as PrismaClient);
        // テスト後はロールバック（エラーを投げる）
        throw new Error("ROLLBACK_TRANSACTION");
    }).catch((e) => {
        if (e.message === "ROLLBACK_TRANSACTION") {
            return undefined as T;
        }
        throw e;
    });
}
