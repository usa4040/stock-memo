/**
 * DB接続ヘルスチェックテスト
 * 
 * データベースへの接続が正常に行えることを確認します。
 * 今回のログインエラー（接続失敗）を防ぐためのテストです。
 * 
 * @jest-environment node
 */

import prisma from "@/lib/prisma";

describe("Database Connection Health Check", () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("基本接続", () => {
        it("データベースに接続できること", async () => {
            // $queryRawでSELECT 1を実行して接続確認
            const result = await prisma.$queryRaw<[{ value: number }]>`SELECT 1 as value`;
            expect(result).toBeDefined();
            expect(result[0].value).toBe(1);
        });

        it("Prisma Clientが初期化されていること", () => {
            expect(prisma).toBeDefined();
            expect(typeof prisma.user).toBe("object");
            expect(typeof prisma.memo).toBe("object");
            expect(typeof prisma.stock).toBe("object");
        });
    });

    describe("テーブルアクセス", () => {
        it("Userテーブルにアクセスできること", async () => {
            const count = await prisma.user.count();
            expect(typeof count).toBe("number");
            expect(count).toBeGreaterThanOrEqual(0);
        });

        it("Stockテーブルにアクセスできること", async () => {
            const count = await prisma.stock.count();
            expect(typeof count).toBe("number");
            expect(count).toBeGreaterThanOrEqual(0);
        });

        it("Memoテーブルにアクセスできること", async () => {
            const count = await prisma.memo.count();
            expect(typeof count).toBe("number");
            expect(count).toBeGreaterThanOrEqual(0);
        });

        it("WatchlistItemテーブルにアクセスできること", async () => {
            const count = await prisma.watchlistItem.count();
            expect(typeof count).toBe("number");
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    describe("接続エラーハンドリング", () => {
        it("不正なクエリでエラーがスローされること", async () => {
            await expect(
                prisma.$queryRaw`SELECT * FROM non_existent_table`
            ).rejects.toThrow();
        });
    });
});
