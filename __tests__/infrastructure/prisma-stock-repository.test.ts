/**
 * PrismaStockRepository テスト
 * 
 * リポジトリ層のテスト（モックPrismaを使用）
 */

import { PrismaStockRepository } from "@/infrastructure/repositories/prisma-stock-repository";
import { Stock } from "@/domain";

// モックPrismaClient
const mockPrisma = {
    stock: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
};

// テスト用のPrismaデータ
const mockPrismaData = {
    code: "7203",
    name: "トヨタ自動車",
    marketSegment: "プライム",
    industry33Code: "3050",
    industry33Name: "輸送用機器",
    industry17Code: "8",
    industry17Name: "自動車・輸送機",
    scaleCode: "1",
    scaleName: "TOPIX Core30",
};

describe("PrismaStockRepository", () => {
    let repository: PrismaStockRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new PrismaStockRepository(mockPrisma as never);
    });

    describe("findByCode", () => {
        it("銘柄コードで銘柄を取得できる", async () => {
            mockPrisma.stock.findUnique.mockResolvedValue(mockPrismaData);

            const result = await repository.findByCode("7203");

            expect(result).not.toBeNull();
            expect(result?.code).toBe("7203");
            expect(result?.name).toBe("トヨタ自動車");
            expect(result?.marketSegment).toBe("プライム");
            expect(mockPrisma.stock.findUnique).toHaveBeenCalledWith({
                where: { code: "7203" },
            });
        });

        it("存在しないコードはnullを返す", async () => {
            mockPrisma.stock.findUnique.mockResolvedValue(null);

            const result = await repository.findByCode("9999");

            expect(result).toBeNull();
        });
    });

    describe("search", () => {
        it("クエリで銘柄を検索できる", async () => {
            mockPrisma.stock.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.stock.count.mockResolvedValue(1);

            const result = await repository.search({ query: "トヨタ" });

            expect(result.stocks).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(mockPrisma.stock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { code: { contains: "トヨタ" } },
                            { name: { contains: "トヨタ" } },
                        ],
                    },
                })
            );
        });

        it("クエリなしで全銘柄を検索できる", async () => {
            mockPrisma.stock.findMany.mockResolvedValue([mockPrismaData]);
            mockPrisma.stock.count.mockResolvedValue(100);

            const result = await repository.search({});

            expect(mockPrisma.stock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });

        it("ページネーションが正しく動作する", async () => {
            mockPrisma.stock.findMany.mockResolvedValue([]);
            mockPrisma.stock.count.mockResolvedValue(100);

            await repository.search({ page: 3, limit: 10 });

            expect(mockPrisma.stock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20, // (3-1) * 10
                    take: 10,
                })
            );
        });

        it("デフォルトはpage=1, limit=20", async () => {
            mockPrisma.stock.findMany.mockResolvedValue([]);
            mockPrisma.stock.count.mockResolvedValue(0);

            await repository.search({});

            expect(mockPrisma.stock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 20,
                })
            );
        });

        it("銘柄コードでソートされる", async () => {
            mockPrisma.stock.findMany.mockResolvedValue([]);
            mockPrisma.stock.count.mockResolvedValue(0);

            await repository.search({});

            expect(mockPrisma.stock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { code: "asc" },
                })
            );
        });
    });

    describe("count", () => {
        it("全銘柄数を取得できる", async () => {
            mockPrisma.stock.count.mockResolvedValue(4000);

            const result = await repository.count();

            expect(result).toBe(4000);
            expect(mockPrisma.stock.count).toHaveBeenCalled();
        });
    });
});
