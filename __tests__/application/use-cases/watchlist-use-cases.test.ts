import { AddToWatchlistUseCase } from "@/application/use-cases/add-to-watchlist";
import { RemoveFromWatchlistUseCase } from "@/application/use-cases/remove-from-watchlist";
import { ListWatchlistUseCase } from "@/application/use-cases/list-watchlist";
import { CheckWatchlistUseCase } from "@/application/use-cases/check-watchlist";
import { WatchlistItem, Stock, IWatchlistRepository, IStockRepository } from "@/domain";

// モックリポジトリ
const createMockWatchlistRepository = (): jest.Mocked<IWatchlistRepository> => ({
    findByUserId: jest.fn(),
    findByUserIdAndStockCode: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    countByUserId: jest.fn(),
});

const createMockStockRepository = (): jest.Mocked<IStockRepository> => ({
    findByCode: jest.fn(),
    search: jest.fn(),
    count: jest.fn(),
});

// テスト用のWatchlistItemを作成
const createTestWatchlistItem = (overrides: Partial<{
    id: string;
    userId: string;
    stockCode: string;
    note: string | null;
}> = {}): WatchlistItem => {
    return WatchlistItem.reconstruct({
        id: overrides.id || "item-1",
        userId: overrides.userId || "user-1",
        stockCode: overrides.stockCode || "7203",
        note: overrides.note !== undefined ? overrides.note : null,
        createdAt: new Date(),
    });
};

// テスト用のStockを作成
const createTestStock = (code: string = "7203"): Stock => {
    return Stock.reconstruct({
        code,
        name: "トヨタ自動車",
        marketSegment: "プライム",
        industry33Code: null,
        industry33Name: null,
        industry17Code: null,
        industry17Name: null,
        scaleCode: null,
        scaleName: null,
    });
};

describe("AddToWatchlistUseCase", () => {
    let useCase: AddToWatchlistUseCase;
    let mockWatchlistRepository: jest.Mocked<IWatchlistRepository>;
    let mockStockRepository: jest.Mocked<IStockRepository>;

    beforeEach(() => {
        mockWatchlistRepository = createMockWatchlistRepository();
        mockStockRepository = createMockStockRepository();
        useCase = new AddToWatchlistUseCase(mockWatchlistRepository, mockStockRepository);
    });

    it("銘柄をウォッチリストに追加できる", async () => {
        mockStockRepository.findByCode.mockResolvedValue(createTestStock());
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(null);
        mockWatchlistRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: "user-1",
            stockCode: "7203",
        });

        expect(result.stockCode.value).toBe("7203");
        expect(result.userId).toBe("user-1");
        expect(mockWatchlistRepository.save).toHaveBeenCalled();
    });

    it("メモ付きでウォッチリストに追加できる", async () => {
        mockStockRepository.findByCode.mockResolvedValue(createTestStock());
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(null);
        mockWatchlistRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: "user-1",
            stockCode: "7203",
            note: "高配当銘柄",
        });

        expect(result.note).toBe("高配当銘柄");
    });

    it("存在しない銘柄はエラーになる", async () => {
        mockStockRepository.findByCode.mockResolvedValue(null);

        await expect(
            useCase.execute({ userId: "user-1", stockCode: "9999" })
        ).rejects.toThrow("指定された銘柄が見つかりません");
    });

    it("既にウォッチ済みの銘柄はエラーになる", async () => {
        mockStockRepository.findByCode.mockResolvedValue(createTestStock());
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(
            createTestWatchlistItem()
        );

        await expect(
            useCase.execute({ userId: "user-1", stockCode: "7203" })
        ).rejects.toThrow("既にウォッチリストに追加されています");
    });
});

describe("RemoveFromWatchlistUseCase", () => {
    let useCase: RemoveFromWatchlistUseCase;
    let mockWatchlistRepository: jest.Mocked<IWatchlistRepository>;

    beforeEach(() => {
        mockWatchlistRepository = createMockWatchlistRepository();
        useCase = new RemoveFromWatchlistUseCase(mockWatchlistRepository);
    });

    it("ウォッチリストから銘柄を削除できる", async () => {
        const item = createTestWatchlistItem({ id: "item-1", userId: "user-1" });
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(item);
        mockWatchlistRepository.delete.mockResolvedValue(undefined);

        await useCase.execute({ userId: "user-1", stockCode: "7203" });

        expect(mockWatchlistRepository.delete).toHaveBeenCalledWith("item-1");
    });

    it("ウォッチしていない銘柄はエラーになる", async () => {
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(null);

        await expect(
            useCase.execute({ userId: "user-1", stockCode: "7203" })
        ).rejects.toThrow("ウォッチリストに見つかりません");
    });

    it("他のユーザーのウォッチは削除できない", async () => {
        const item = createTestWatchlistItem({ userId: "user-2" });
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(item);

        await expect(
            useCase.execute({ userId: "user-1", stockCode: "7203" })
        ).rejects.toThrow("削除する権限がありません");
    });
});

describe("ListWatchlistUseCase", () => {
    let useCase: ListWatchlistUseCase;
    let mockWatchlistRepository: jest.Mocked<IWatchlistRepository>;

    beforeEach(() => {
        mockWatchlistRepository = createMockWatchlistRepository();
        useCase = new ListWatchlistUseCase(mockWatchlistRepository);
    });

    it("ユーザーのウォッチリストを取得できる", async () => {
        const items = [
            createTestWatchlistItem({ id: "1", stockCode: "7203" }),
            createTestWatchlistItem({ id: "2", stockCode: "9984" }),
        ];
        mockWatchlistRepository.findByUserId.mockResolvedValue(items);
        mockWatchlistRepository.countByUserId.mockResolvedValue(2);

        const result = await useCase.execute({ userId: "user-1" });

        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    it("ウォッチリストが空の場合でも正常に動作する", async () => {
        mockWatchlistRepository.findByUserId.mockResolvedValue([]);
        mockWatchlistRepository.countByUserId.mockResolvedValue(0);

        const result = await useCase.execute({ userId: "user-1" });

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
    });
});

describe("CheckWatchlistUseCase", () => {
    let useCase: CheckWatchlistUseCase;
    let mockWatchlistRepository: jest.Mocked<IWatchlistRepository>;

    beforeEach(() => {
        mockWatchlistRepository = createMockWatchlistRepository();
        useCase = new CheckWatchlistUseCase(mockWatchlistRepository);
    });

    it("ウォッチ中の銘柄はisWatching: trueを返す", async () => {
        const item = createTestWatchlistItem({ note: "注目銘柄" });
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(item);

        const result = await useCase.execute({ userId: "user-1", stockCode: "7203" });

        expect(result.isWatching).toBe(true);
        expect(result.note).toBe("注目銘柄");
    });

    it("ウォッチしていない銘柄はisWatching: falseを返す", async () => {
        mockWatchlistRepository.findByUserIdAndStockCode.mockResolvedValue(null);

        const result = await useCase.execute({ userId: "user-1", stockCode: "7203" });

        expect(result.isWatching).toBe(false);
        expect(result.note).toBeNull();
    });
});
