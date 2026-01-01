import { GetStockUseCase } from "@/application/use-cases/get-stock";
import { Stock, IStockRepository } from "@/domain";

// モックリポジトリ
const createMockRepository = (): jest.Mocked<IStockRepository> => ({
    findByCode: jest.fn(),
    search: jest.fn(),
    count: jest.fn(),
});

describe("GetStockUseCase", () => {
    let useCase: GetStockUseCase;
    let mockRepository: jest.Mocked<IStockRepository>;

    const createTestStock = (code: string = "7203") =>
        Stock.reconstruct({
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

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new GetStockUseCase(mockRepository);
    });

    describe("execute", () => {
        it("銘柄コードで銘柄を取得できる", async () => {
            const expectedStock = createTestStock("7203");
            mockRepository.findByCode.mockResolvedValue(expectedStock);

            const result = await useCase.execute({ code: "7203" });

            expect(result).toBe(expectedStock);
            expect(mockRepository.findByCode).toHaveBeenCalledWith("7203");
        });

        it("存在しない銘柄はエラー", async () => {
            mockRepository.findByCode.mockResolvedValue(null);

            await expect(
                useCase.execute({ code: "9999" })
            ).rejects.toThrow("銘柄が見つかりません");

            expect(mockRepository.findByCode).toHaveBeenCalledWith("9999");
        });
    });
});
