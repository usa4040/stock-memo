import { SearchStocksUseCase } from "@/application/use-cases/search-stocks";
import { Stock, IStockRepository } from "@/domain";

// モックリポジトリ
const createMockRepository = (): jest.Mocked<IStockRepository> => ({
    findByCode: jest.fn(),
    search: jest.fn(),
    count: jest.fn(),
});

describe("SearchStocksUseCase", () => {
    let useCase: SearchStocksUseCase;
    let mockRepository: jest.Mocked<IStockRepository>;

    const createTestStock = (code: string, name: string) =>
        Stock.reconstruct({
            code,
            name,
            marketSegment: "プライム",
            industry33Code: null,
            industry33Name: null,
            industry17Code: null,
            industry17Name: null,
            scaleCode: null,
            scaleName: null,
        });

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new SearchStocksUseCase(mockRepository);
    });

    describe("execute", () => {
        it("クエリで銘柄を検索できる", async () => {
            const stocks = [
                createTestStock("7203", "トヨタ自動車"),
                createTestStock("7267", "本田技研工業"),
            ];
            mockRepository.search.mockResolvedValue({ stocks, total: 2 });

            const result = await useCase.execute({ query: "自動車" });

            expect(result.stocks).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
            expect(mockRepository.search).toHaveBeenCalledWith({
                query: "自動車",
                page: 1,
                limit: 20,
            });
        });

        it("ページネーションパラメータを渡せる", async () => {
            mockRepository.search.mockResolvedValue({ stocks: [], total: 100 });

            const result = await useCase.execute({
                query: "test",
                page: 3,
                limit: 10,
            });

            expect(result.pagination.page).toBe(3);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(100);
            expect(result.pagination.totalPages).toBe(10);
            expect(mockRepository.search).toHaveBeenCalledWith({
                query: "test",
                page: 3,
                limit: 10,
            });
        });

        it("デフォルトでpage=1, limit=20", async () => {
            mockRepository.search.mockResolvedValue({ stocks: [], total: 0 });

            await useCase.execute({});

            expect(mockRepository.search).toHaveBeenCalledWith({
                query: undefined,
                page: 1,
                limit: 20,
            });
        });

        it("結果が空でも正しくページネーションを返す", async () => {
            mockRepository.search.mockResolvedValue({ stocks: [], total: 0 });

            const result = await useCase.execute({ query: "存在しない銘柄" });

            expect(result.stocks).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        it("totalPagesが正しく計算される", async () => {
            mockRepository.search.mockResolvedValue({ stocks: [], total: 55 });

            const result = await useCase.execute({ limit: 10 });

            expect(result.pagination.totalPages).toBe(6); // 55 / 10 = 5.5 -> ceil(5.5) = 6
        });
    });
});
