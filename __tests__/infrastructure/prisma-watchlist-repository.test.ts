/**
 * PrismaWatchlistRepository テスト
 * 
 * リポジトリ層のテスト（モックPrismaを使用）
 */

import { PrismaWatchlistRepository } from "@/infrastructure/repositories/prisma-watchlist-repository";
import { WatchlistItem } from "@/domain";

// モックPrismaClient
const mockPrisma = {
    watchlistItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
};

// テスト用のPrismaデータ
const mockPrismaData = {
    id: "watchlist-1",
    userId: "user-123",
    stockCode: "7203",
    note: "注目銘柄",
    createdAt: new Date("2024-01-01T00:00:00Z"),
};

describe("PrismaWatchlistRepository", () => {
    let repository: PrismaWatchlistRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new PrismaWatchlistRepository(mockPrisma as never);
    });

    describe("findByUserId", () => {
        it("ユーザーのウォッチリストを取得できる", async () => {
            mockPrisma.watchlistItem.findMany.mockResolvedValue([mockPrismaData]);

            const result = await repository.findByUserId("user-123");

            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe("user-123");
            expect(result[0].stockCode.value).toBe("7203");
            expect(mockPrisma.watchlistItem.findMany).toHaveBeenCalledWith({
                where: { userId: "user-123" },
                orderBy: { createdAt: "desc" },
            });
        });

        it("ウォッチリストが空の場合は空配列を返す", async () => {
            mockPrisma.watchlistItem.findMany.mockResolvedValue([]);

            const result = await repository.findByUserId("user-123");

            expect(result).toHaveLength(0);
        });
    });

    describe("findByUserIdAndStockCode", () => {
        it("ユーザーと銘柄コードでウォッチリストを取得できる", async () => {
            mockPrisma.watchlistItem.findUnique.mockResolvedValue(mockPrismaData);

            const result = await repository.findByUserIdAndStockCode("user-123", "7203");

            expect(result).not.toBeNull();
            expect(result?.userId).toBe("user-123");
            expect(mockPrisma.watchlistItem.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_stockCode: { userId: "user-123", stockCode: "7203" },
                },
            });
        });

        it("存在しない場合はnullを返す", async () => {
            mockPrisma.watchlistItem.findUnique.mockResolvedValue(null);

            const result = await repository.findByUserIdAndStockCode("user-123", "9999");

            expect(result).toBeNull();
        });
    });

    describe("save", () => {
        it("ウォッチリストアイテムを保存できる（upsert）", async () => {
            mockPrisma.watchlistItem.upsert.mockResolvedValue(mockPrismaData);

            const item = WatchlistItem.create({
                id: "watchlist-1",
                userId: "user-123",
                stockCode: "7203",
                note: "注目銘柄",
            });

            await repository.save(item);

            expect(mockPrisma.watchlistItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "watchlist-1" },
                    create: expect.objectContaining({
                        id: "watchlist-1",
                        userId: "user-123",
                        stockCode: "7203",
                        note: "注目銘柄",
                    }),
                    update: expect.objectContaining({
                        note: "注目銘柄",
                    }),
                })
            );
        });

        it("メモなしでも保存できる", async () => {
            mockPrisma.watchlistItem.upsert.mockResolvedValue({
                ...mockPrismaData,
                note: null,
            });

            const item = WatchlistItem.create({
                id: "watchlist-2",
                userId: "user-123",
                stockCode: "7203",
            });

            await repository.save(item);

            expect(mockPrisma.watchlistItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({
                        note: null,
                    }),
                })
            );
        });
    });

    describe("delete", () => {
        it("ウォッチリストアイテムを削除できる", async () => {
            mockPrisma.watchlistItem.delete.mockResolvedValue(mockPrismaData);

            await repository.delete("watchlist-1");

            expect(mockPrisma.watchlistItem.delete).toHaveBeenCalledWith({
                where: { id: "watchlist-1" },
            });
        });
    });

    describe("countByUserId", () => {
        it("ユーザーのウォッチリスト数を取得できる", async () => {
            mockPrisma.watchlistItem.count.mockResolvedValue(10);

            const result = await repository.countByUserId("user-123");

            expect(result).toBe(10);
            expect(mockPrisma.watchlistItem.count).toHaveBeenCalledWith({
                where: { userId: "user-123" },
            });
        });
    });
});
