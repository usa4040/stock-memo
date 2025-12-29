import { GetDashboardUseCase } from "@/application/use-cases/get-dashboard";
import { Memo, Stock, IMemoRepository, IStockRepository } from "@/domain";

// モックリポジトリ
const createMockMemoRepository = (): jest.Mocked<IMemoRepository> => ({
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findPublicByStockCode: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    countByUserId: jest.fn(),
    findByUserIdAndTags: jest.fn(),
    searchByKeyword: jest.fn(),
    findPinnedByUserId: jest.fn(),
    findRecentByUserId: jest.fn(),
    getTagStatistics: jest.fn(),
    countUniqueStocksByUserId: jest.fn(),
    countUniqueTagsByUserId: jest.fn(),
    countPinnedByUserId: jest.fn(),
});

const createMockStockRepository = (): jest.Mocked<IStockRepository> => ({
    findByCode: jest.fn(),
    search: jest.fn(),
    count: jest.fn(),
});

// テスト用のMemoを作成するヘルパー
const createTestMemo = (overrides: Partial<{
    id: string;
    userId: string;
    stockCode: string;
    title: string | null;
    content: string;
    tags: string[];
    pinned: boolean;
    visibility: string;
}> = {}): Memo => {
    return Memo.reconstruct({
        id: overrides.id || "memo-1",
        userId: overrides.userId || "user-1",
        stockCode: overrides.stockCode || "7203",
        title: overrides.title !== undefined ? overrides.title : "テストタイトル",
        content: overrides.content || "テスト内容",
        tags: overrides.tags || [],
        pinned: overrides.pinned || false,
        visibility: overrides.visibility || "private",
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};

// テスト用のStockを作成するヘルパー
const createTestStock = (code: string = "7203", name: string = "トヨタ自動車"): Stock => {
    return Stock.reconstruct({
        code,
        name,
        marketSegment: "プライム（内国株式）",
        industry33Code: null,
        industry33Name: null,
        industry17Code: null,
        industry17Name: null,
        scaleCode: null,
        scaleName: null,
    });
};

describe("GetDashboardUseCase", () => {
    let useCase: GetDashboardUseCase;
    let mockMemoRepository: jest.Mocked<IMemoRepository>;
    let mockStockRepository: jest.Mocked<IStockRepository>;

    beforeEach(() => {
        mockMemoRepository = createMockMemoRepository();
        mockStockRepository = createMockStockRepository();
        useCase = new GetDashboardUseCase(mockMemoRepository, mockStockRepository);
    });

    describe("execute", () => {
        it("ダッシュボードデータを取得できる", async () => {
            // モックの戻り値を設定
            mockMemoRepository.countByUserId.mockResolvedValue(10);
            mockMemoRepository.countUniqueStocksByUserId.mockResolvedValue(5);
            mockMemoRepository.countUniqueTagsByUserId.mockResolvedValue(15);
            mockMemoRepository.countPinnedByUserId.mockResolvedValue(3);
            mockMemoRepository.findPinnedByUserId.mockResolvedValue([
                createTestMemo({ id: "pinned-1", pinned: true }),
            ]);
            mockMemoRepository.findRecentByUserId.mockResolvedValue([
                createTestMemo({ id: "recent-1" }),
                createTestMemo({ id: "recent-2" }),
            ]);
            mockMemoRepository.getTagStatistics.mockResolvedValue([
                { tag: "高配当", count: 5 },
                { tag: "成長株", count: 3 },
            ]);
            mockStockRepository.findByCode.mockResolvedValue(createTestStock());


            const result = await useCase.execute({ userId: "user-1" });

            // 統計情報を確認
            expect(result.statistics.totalMemos).toBe(10);
            expect(result.statistics.totalStocks).toBe(5);
            expect(result.statistics.totalTags).toBe(15);
            expect(result.statistics.pinnedMemos).toBe(3);

            // ピン留めメモを確認
            expect(result.pinnedMemos).toHaveLength(1);
            expect(result.pinnedMemos[0].id).toBe("pinned-1");

            // 最近のメモを確認
            expect(result.recentMemos).toHaveLength(2);

            // タグ統計を確認
            expect(result.topTags).toHaveLength(2);
            expect(result.topTags[0].tag).toBe("高配当");
        });

        it("メモがない場合でも正常に動作する", async () => {
            mockMemoRepository.countByUserId.mockResolvedValue(0);
            mockMemoRepository.countUniqueStocksByUserId.mockResolvedValue(0);
            mockMemoRepository.countUniqueTagsByUserId.mockResolvedValue(0);
            mockMemoRepository.countPinnedByUserId.mockResolvedValue(0);
            mockMemoRepository.findPinnedByUserId.mockResolvedValue([]);
            mockMemoRepository.findRecentByUserId.mockResolvedValue([]);
            mockMemoRepository.getTagStatistics.mockResolvedValue([]);

            const result = await useCase.execute({ userId: "user-1" });

            expect(result.statistics.totalMemos).toBe(0);
            expect(result.statistics.isEmpty).toBe(true);
            expect(result.pinnedMemos).toHaveLength(0);
            expect(result.recentMemos).toHaveLength(0);
            expect(result.topTags).toHaveLength(0);
        });

        it("リポジトリメソッドが正しい引数で呼ばれる", async () => {
            mockMemoRepository.countByUserId.mockResolvedValue(0);
            mockMemoRepository.countUniqueStocksByUserId.mockResolvedValue(0);
            mockMemoRepository.countUniqueTagsByUserId.mockResolvedValue(0);
            mockMemoRepository.countPinnedByUserId.mockResolvedValue(0);
            mockMemoRepository.findPinnedByUserId.mockResolvedValue([]);
            mockMemoRepository.findRecentByUserId.mockResolvedValue([]);
            mockMemoRepository.getTagStatistics.mockResolvedValue([]);

            await useCase.execute({ userId: "user-1" });

            expect(mockMemoRepository.countByUserId).toHaveBeenCalledWith("user-1");
            expect(mockMemoRepository.findPinnedByUserId).toHaveBeenCalledWith("user-1", 5);
            expect(mockMemoRepository.findRecentByUserId).toHaveBeenCalledWith("user-1", 5);
            expect(mockMemoRepository.getTagStatistics).toHaveBeenCalledWith("user-1", 10);
        });
    });
});
