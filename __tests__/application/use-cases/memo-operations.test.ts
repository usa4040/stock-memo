import { UpdateMemoUseCase } from "@/application/use-cases/update-memo";
import { DeleteMemoUseCase } from "@/application/use-cases/delete-memo";
import { GetMemoUseCase } from "@/application/use-cases/get-memo";
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

// テスト用メモを作成
const createTestMemo = (overrides?: Partial<{
    id: string;
    userId: string;
    visibility: "private" | "public";
}>) => {
    return Memo.create({
        id: overrides?.id || "memo-1",
        userId: overrides?.userId || "user-1",
        stockCode: "7203",
        content: "テスト内容",
        title: "テストタイトル",
        visibility: overrides?.visibility || "private",
    });
};

describe("UpdateMemoUseCase", () => {
    let useCase: UpdateMemoUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new UpdateMemoUseCase(mockRepository);
    });

    it("所有者はメモを更新できる", async () => {
        const existingMemo = createTestMemo();
        mockRepository.findById.mockResolvedValue(existingMemo);

        const memo = await useCase.execute({
            memoId: "memo-1",
            userId: "user-1",
            content: "更新された内容",
        });

        expect(memo.content.value).toBe("更新された内容");
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("所有者でない場合はエラー", async () => {
        const existingMemo = createTestMemo();
        mockRepository.findById.mockResolvedValue(existingMemo);

        await expect(
            useCase.execute({
                memoId: "memo-1",
                userId: "user-2", // 別のユーザー
                content: "更新された内容",
            })
        ).rejects.toThrow("編集権限がありません");
    });

    it("存在しないメモはエラー", async () => {
        mockRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({
                memoId: "not-found",
                userId: "user-1",
                content: "更新された内容",
            })
        ).rejects.toThrow("メモが見つかりません");
    });

    it("ピン留めを更新できる", async () => {
        const existingMemo = createTestMemo();
        mockRepository.findById.mockResolvedValue(existingMemo);

        const memo = await useCase.execute({
            memoId: "memo-1",
            userId: "user-1",
            pinned: true,
        });

        expect(memo.pinned).toBe(true);
    });
});

describe("DeleteMemoUseCase", () => {
    let useCase: DeleteMemoUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new DeleteMemoUseCase(mockRepository);
    });

    it("所有者はメモを削除できる", async () => {
        const existingMemo = createTestMemo();
        mockRepository.findById.mockResolvedValue(existingMemo);

        await useCase.execute({
            memoId: "memo-1",
            userId: "user-1",
        });

        expect(mockRepository.delete).toHaveBeenCalledWith("memo-1");
    });

    it("所有者でない場合はエラー", async () => {
        const existingMemo = createTestMemo();
        mockRepository.findById.mockResolvedValue(existingMemo);

        await expect(
            useCase.execute({
                memoId: "memo-1",
                userId: "user-2",
            })
        ).rejects.toThrow("削除権限がありません");
    });
});

describe("GetMemoUseCase", () => {
    let useCase: GetMemoUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new GetMemoUseCase(mockRepository);
    });

    it("公開メモは誰でも取得できる", async () => {
        const publicMemo = createTestMemo({ visibility: "public" });
        mockRepository.findById.mockResolvedValue(publicMemo);

        const memo = await useCase.execute({
            memoId: "memo-1",
            userId: "user-2", // 別のユーザー
        });

        expect(memo.id).toBe("memo-1");
    });

    it("公開メモは未ログインでも取得できる", async () => {
        const publicMemo = createTestMemo({ visibility: "public" });
        mockRepository.findById.mockResolvedValue(publicMemo);

        const memo = await useCase.execute({
            memoId: "memo-1",
            userId: null, // 未ログイン
        });

        expect(memo.id).toBe("memo-1");
    });

    it("非公開メモは所有者のみ取得できる", async () => {
        const privateMemo = createTestMemo({ visibility: "private" });
        mockRepository.findById.mockResolvedValue(privateMemo);

        const memo = await useCase.execute({
            memoId: "memo-1",
            userId: "user-1", // 所有者
        });

        expect(memo.id).toBe("memo-1");
    });

    it("非公開メモは他人は取得できない", async () => {
        const privateMemo = createTestMemo({ visibility: "private" });
        mockRepository.findById.mockResolvedValue(privateMemo);

        await expect(
            useCase.execute({
                memoId: "memo-1",
                userId: "user-2", // 別のユーザー
            })
        ).rejects.toThrow("アクセス権限がありません");
    });
});
