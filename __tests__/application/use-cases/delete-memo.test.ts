/**
 * メモ削除ユースケース テスト
 */

import { DeleteMemoUseCase, DeleteMemoInput } from "@/application/use-cases/delete-memo";
import { Memo, IMemoRepository } from "@/domain";

// モックリポジトリ
const mockMemoRepository: jest.Mocked<IMemoRepository> = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByStockCode: jest.fn(),
    findPublicByStockCode: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    filterByTags: jest.fn(),
    getStatistics: jest.fn(),
    getPinnedMemos: jest.fn(),
    getRecentMemos: jest.fn(),
    getTopTags: jest.fn(),
};

// テスト用メモを作成
function createTestMemo(userId: string, memoId: string = "memo-1"): Memo {
    return Memo.create({
        id: memoId,
        userId,
        stockCode: "7203",
        content: "テストコンテンツ",
        title: null,
        tags: [],
        pinned: false,
        visibility: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

describe("DeleteMemoUseCase", () => {
    let useCase: DeleteMemoUseCase;
    const testUserId = "user-1";
    const otherUserId = "user-2";

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteMemoUseCase(mockMemoRepository);
    });

    describe("正常系", () => {
        it("自分のメモを削除できる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.delete.mockResolvedValue();

            const input: DeleteMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
            };

            await useCase.execute(input);

            expect(mockMemoRepository.delete).toHaveBeenCalledWith("memo-1");
        });

        it("削除後にリポジトリのdeleteが呼ばれる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.delete.mockResolvedValue();

            const input: DeleteMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
            };

            await useCase.execute(input);

            expect(mockMemoRepository.findById).toHaveBeenCalledWith("memo-1");
            expect(mockMemoRepository.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe("異常系", () => {
        it("存在しないメモはエラーになる", async () => {
            mockMemoRepository.findById.mockResolvedValue(null);

            const input: DeleteMemoInput = {
                memoId: "non-existent",
                userId: testUserId,
            };

            await expect(useCase.execute(input)).rejects.toThrow("メモが見つかりません");
            expect(mockMemoRepository.delete).not.toHaveBeenCalled();
        });

        it("他のユーザーのメモは削除できない", async () => {
            const memo = createTestMemo(otherUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);

            const input: DeleteMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
            };

            await expect(useCase.execute(input)).rejects.toThrow("削除権限がありません");
            expect(mockMemoRepository.delete).not.toHaveBeenCalled();
        });

        it("権限エラー時はメモがそのまま残る", async () => {
            const memo = createTestMemo(otherUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);

            const input: DeleteMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
            };

            try {
                await useCase.execute(input);
            } catch {
                // エラーは想定内
            }

            // deleteが呼ばれていないことを確認
            expect(mockMemoRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe("境界値", () => {
        it("メモIDが空文字の場合はfindByIdに空文字が渡される", async () => {
            mockMemoRepository.findById.mockResolvedValue(null);

            const input: DeleteMemoInput = {
                memoId: "",
                userId: testUserId,
            };

            await expect(useCase.execute(input)).rejects.toThrow("メモが見つかりません");
            expect(mockMemoRepository.findById).toHaveBeenCalledWith("");
        });

        it("ユーザーIDが空文字の場合は権限エラーになる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);

            const input: DeleteMemoInput = {
                memoId: "memo-1",
                userId: "",
            };

            await expect(useCase.execute(input)).rejects.toThrow("削除権限がありません");
        });
    });
});
