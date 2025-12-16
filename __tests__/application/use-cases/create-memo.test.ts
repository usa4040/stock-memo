import { CreateMemoUseCase } from "@/application/use-cases/create-memo";
import { Memo, IMemoRepository } from "@/domain";

// モックリポジトリ
const createMockRepository = (): jest.Mocked<IMemoRepository> => ({
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findPublicByStockCode: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    countByUserId: jest.fn(),
});

describe("CreateMemoUseCase", () => {
    let useCase: CreateMemoUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new CreateMemoUseCase(mockRepository);
    });

    it("メモを作成できる", async () => {
        const input = {
            userId: "user-1",
            stockCode: "7203",
            content: "テスト内容",
            title: "テストタイトル",
            tags: ["タグ1"],
            visibility: "private" as const,
        };

        const memo = await useCase.execute(input);

        expect(memo).toBeInstanceOf(Memo);
        expect(memo.userId).toBe("user-1");
        expect(memo.stockCode.value).toBe("7203");
        expect(memo.content.value).toBe("テスト内容");
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("タイトルなしでメモを作成できる", async () => {
        const input = {
            userId: "user-1",
            stockCode: "7203",
            content: "テスト内容",
        };

        const memo = await useCase.execute(input);

        expect(memo.title).toBeNull();
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("不正な銘柄コードはエラー", async () => {
        const input = {
            userId: "user-1",
            stockCode: "720", // 3桁
            content: "テスト内容",
        };

        await expect(useCase.execute(input)).rejects.toThrow();
        expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("空の内容はエラー", async () => {
        const input = {
            userId: "user-1",
            stockCode: "7203",
            content: "",
        };

        await expect(useCase.execute(input)).rejects.toThrow();
        expect(mockRepository.save).not.toHaveBeenCalled();
    });
});
