/**
 * PrismaMemoRepository テスト
 * 
 * リポジトリ層のテスト（モックPrismaを使用）
 */

import { PrismaMemoRepository } from "@/infrastructure/repositories/prisma-memo-repository";
import { Memo } from "@/domain";

// モックPrismaClient
const mockPrisma = {
    memo: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
    },
};

// テスト用のPrismaデータ
const mockPrismaData = {
    id: "memo-123",
    userId: "user-123",
    stockCode: "7203",
    title: "テストメモ",
    content: "これはテスト内容です",
    tags: ["長期投資", "高配当"],
    pinned: false,
    visibility: "private",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
};

describe("PrismaMemoRepository", () => {
    let repository: PrismaMemoRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new PrismaMemoRepository(mockPrisma as never);
    });

    describe("findById", () => {
        it("IDでメモを取得できる", async () => {
            mockPrisma.memo.findUnique.mockResolvedValue(mockPrismaData);

            const result = await repository.findById("memo-123");

            expect(result).not.toBeNull();
            expect(result?.id).toBe("memo-123");
            expect(result?.content.value).toBe("これはテスト内容です");
            expect(mockPrisma.memo.findUnique).toHaveBeenCalledWith({
                where: { id: "memo-123" },
            });
        });

        it("存在しないIDはnullを返す", async () => {
            mockPrisma.memo.findUnique.mockResolvedValue(null);

            const result = await repository.findById("not-found");

            expect(result).toBeNull();
        });
    });

    describe("findByUserId", () => {
        it("ユーザーのメモ一覧を取得できる", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.memo.count.mockResolvedValue(1);

            const result = await repository.findByUserId("user-123", { page: 1, limit: 20 });

            expect(result.memos).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "user-123" },
                    skip: 0,
                    take: 20,
                })
            );
        });

        it("ページネーションが正しく動作する", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([]);
            mockPrisma.memo.count.mockResolvedValue(50);

            const result = await repository.findByUserId("user-123", { page: 3, limit: 10 });

            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20, // (3-1) * 10
                    take: 10,
                })
            );
        });
    });

    describe("findByUserIdAndTags", () => {
        it("タグでフィルタリングできる", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.memo.count.mockResolvedValue(1);

            const result = await repository.findByUserIdAndTags(
                "user-123",
                ["長期投資"],
                { page: 1, limit: 20 }
            );

            expect(result.memos).toHaveLength(1);
            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: "user-123",
                        AND: expect.arrayContaining([
                            expect.objectContaining({ tags: { has: "長期投資" } }),
                        ]),
                    }),
                })
            );
        });

        it("複数タグでAND検索できる", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.memo.count.mockResolvedValue(1);

            await repository.findByUserIdAndTags(
                "user-123",
                ["長期投資", "高配当"],
                { page: 1, limit: 20 }
            );

            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        AND: expect.arrayContaining([
                            expect.objectContaining({ tags: { has: "長期投資" } }),
                            expect.objectContaining({ tags: { has: "高配当" } }),
                        ]),
                    }),
                })
            );
        });
    });

    describe("searchByKeyword", () => {
        it("キーワードで検索できる", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.memo.count.mockResolvedValue(1);

            const result = await repository.searchByKeyword(
                "user-123",
                "テスト",
                { page: 1, limit: 20 }
            );

            expect(result.memos).toHaveLength(1);
            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: "user-123",
                        OR: expect.arrayContaining([
                            expect.objectContaining({ title: { contains: "テスト" } }),
                            expect.objectContaining({ content: { contains: "テスト" } }),
                        ]),
                    }),
                })
            );
        });

        it("銘柄名・コードでも検索できる", async () => {
            mockPrisma.memo.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.memo.count.mockResolvedValue(1);

            await repository.searchByKeyword("user-123", "7203", { page: 1, limit: 20 });

            expect(mockPrisma.memo.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ stock: { code: { contains: "7203" } } }),
                        ]),
                    }),
                })
            );
        });
    });

    describe("save", () => {
        it("メモを保存できる（upsert）", async () => {
            mockPrisma.memo.upsert.mockResolvedValue(mockPrismaData);

            const memo = Memo.create({
                id: "memo-123",
                userId: "user-123",
                stockCode: "7203",
                content: "テスト内容",
                title: "テストタイトル",
                tags: ["長期投資"],
            });

            await repository.save(memo);

            expect(mockPrisma.memo.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "memo-123" },
                    update: expect.any(Object),
                    create: expect.any(Object),
                })
            );
        });
    });

    describe("delete", () => {
        it("メモを削除できる", async () => {
            mockPrisma.memo.delete.mockResolvedValue(mockPrismaData);

            await repository.delete("memo-123");

            expect(mockPrisma.memo.delete).toHaveBeenCalledWith({
                where: { id: "memo-123" },
            });
        });
    });

    describe("countByUserId", () => {
        it("ユーザーのメモ数を取得できる", async () => {
            mockPrisma.memo.count.mockResolvedValue(42);

            const result = await repository.countByUserId("user-123");

            expect(result).toBe(42);
            expect(mockPrisma.memo.count).toHaveBeenCalledWith({
                where: { userId: "user-123" },
            });
        });
    });
});
