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

describe("GetMemoUseCase", () => {
    let useCase: GetMemoUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    const createTestMemo = (props: { userId?: string; visibility?: "public" | "private" } = {}) =>
        Memo.create({
            id: "memo-1",
            userId: props.userId ?? "user-1",
            stockCode: "7203",
            content: "テスト内容",
            title: "テストタイトル",
            visibility: props.visibility ?? "private",
        });

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new GetMemoUseCase(mockRepository);
    });

    describe("execute", () => {
        it("所有者は自分のメモを取得できる", async () => {
            const memo = createTestMemo({ userId: "user-1", visibility: "private" });
            mockRepository.findById.mockResolvedValue(memo);

            const result = await useCase.execute({
                memoId: "memo-1",
                userId: "user-1",
            });

            expect(result).toBe(memo);
            expect(mockRepository.findById).toHaveBeenCalledWith("memo-1");
        });

        it("公開メモは誰でも取得できる", async () => {
            const memo = createTestMemo({ userId: "user-1", visibility: "public" });
            memo.publish();
            mockRepository.findById.mockResolvedValue(memo);

            const result = await useCase.execute({
                memoId: "memo-1",
                userId: "user-2", // 他のユーザー
            });

            expect(result).toBe(memo);
        });

        it("公開メモは未ログインでも取得できる", async () => {
            const memo = createTestMemo({ visibility: "public" });
            memo.publish();
            mockRepository.findById.mockResolvedValue(memo);

            const result = await useCase.execute({
                memoId: "memo-1",
                userId: null, // 未ログイン
            });

            expect(result).toBe(memo);
        });

        it("非公開メモは他のユーザーが取得するとエラー", async () => {
            const memo = createTestMemo({ userId: "user-1", visibility: "private" });
            mockRepository.findById.mockResolvedValue(memo);

            await expect(
                useCase.execute({
                    memoId: "memo-1",
                    userId: "user-2", // 他のユーザー
                })
            ).rejects.toThrow("アクセス権限がありません");
        });

        it("非公開メモは未ログインユーザーが取得するとエラー", async () => {
            const memo = createTestMemo({ visibility: "private" });
            mockRepository.findById.mockResolvedValue(memo);

            await expect(
                useCase.execute({
                    memoId: "memo-1",
                    userId: null, // 未ログイン
                })
            ).rejects.toThrow("アクセス権限がありません");
        });

        it("存在しないメモはエラー", async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    memoId: "non-existent",
                    userId: "user-1",
                })
            ).rejects.toThrow("メモが見つかりません");
        });
    });
});
