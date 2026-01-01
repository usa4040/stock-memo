/**
 * テスト用 Prisma クライアント
 *
 * 統合テストで使用する専用のPrismaクライアント
 * 環境変数 DATABASE_URL からテスト用DBに接続
 */
import { PrismaClient } from "@prisma/client";

// テスト用のPrismaクライアント（シングルトン）
const globalForPrisma = globalThis as unknown as {
    prismaTest: PrismaClient | undefined;
};

export const prismaTest =
    globalForPrisma.prismaTest ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaTest = prismaTest;
}

export default prismaTest;
