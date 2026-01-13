/**
 * メモ更新ユースケース テスト
 */

import { UpdateMemoUseCase, UpdateMemoInput } from "@/application/use-cases/update-memo";
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
function createTestMemo(userId: string, overrides?: Partial<{
    id: string;
    content: string;
    title: string | null;
    tags: string[];
    pinned: boolean;
    visibility: "private" | "public";
}>): Memo {
    return Memo.create({
        id: overrides?.id ?? "memo-1",
        userId,
        stockCode: "7203",
        content: overrides?.content ?? "テストコンテンツ",
        title: overrides?.title ?? null,
        tags: overrides?.tags ?? [],
        pinned: overrides?.pinned ?? false,
        visibility: overrides?.visibility ?? "private",
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

describe("UpdateMemoUseCase", () => {
    let useCase: UpdateMemoUseCase;
    const testUserId = "user-1";
    const otherUserId = "user-2";

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateMemoUseCase(mockMemoRepository);
    });

    describe("正常系", () => {
        it("タイトルを更新できる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                title: "新しいタイトル",
            };

            const result = await useCase.execute(input);

            expect(result.title).toBe("新しいタイトル");
            expect(mockMemoRepository.save).toHaveBeenCalledWith(memo);
        });

        it("コンテンツを更新できる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                content: "更新されたコンテンツ",
            };

            const result = await useCase.execute(input);

            expect(result.content.value).toBe("更新されたコンテンツ");
        });

        it("タグを更新できる", async () => {
            const memo = createTestMemo(testUserId, { tags: ["古いタグ"] });
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                tags: ["新しいタグ", "追加タグ"],
            };

            const result = await useCase.execute(input);

            expect(result.tags).toEqual(["新しいタグ", "追加タグ"]);
        });

        it("ピン留めできる", async () => {
            const memo = createTestMemo(testUserId, { pinned: false });
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                pinned: true,
            };

            const result = await useCase.execute(input);

            expect(result.pinned).toBe(true);
        });

        it("ピン留めを解除できる", async () => {
            const memo = createTestMemo(testUserId, { pinned: true });
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                pinned: false,
            };

            const result = await useCase.execute(input);

            expect(result.pinned).toBe(false);
        });

        it("公開設定を変更できる（非公開→公開）", async () => {
            const memo = createTestMemo(testUserId, { visibility: "private" });
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                visibility: "public",
            };

            const result = await useCase.execute(input);

            expect(result.visibility.value).toBe("public");
        });

        it("公開設定を変更できる（公開→非公開）", async () => {
            const memo = createTestMemo(testUserId, { visibility: "public" });
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                visibility: "private",
            };

            const result = await useCase.execute(input);

            expect(result.visibility.value).toBe("private");
        });

        it("複数のフィールドを同時に更新できる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);
            mockMemoRepository.save.mockResolvedValue();

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                title: "新タイトル",
                content: "新コンテンツ",
                tags: ["タグ1", "タグ2"],
                pinned: true,
                visibility: "public",
            };

            const result = await useCase.execute(input);

            expect(result.title).toBe("新タイトル");
            expect(result.content.value).toBe("新コンテンツ");
            expect(result.tags).toEqual(["タグ1", "タグ2"]);
            expect(result.pinned).toBe(true);
            expect(result.visibility.value).toBe("public");
        });
    });

    describe("異常系", () => {
        it("存在しないメモはエラーになる", async () => {
            mockMemoRepository.findById.mockResolvedValue(null);

            const input: UpdateMemoInput = {
                memoId: "non-existent",
                userId: testUserId,
                content: "更新",
            };

            await expect(useCase.execute(input)).rejects.toThrow("メモが見つかりません");
        });

        it("他のユーザーのメモは編集できない", async () => {
            const memo = createTestMemo(otherUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                content: "更新",
            };

            await expect(useCase.execute(input)).rejects.toThrow("編集権限がありません");
        });

        it("空のコンテンツはエラーになる", async () => {
            const memo = createTestMemo(testUserId);
            mockMemoRepository.findById.mockResolvedValue(memo);

            const input: UpdateMemoInput = {
                memoId: "memo-1",
                userId: testUserId,
                content: "",
            };

            await expect(useCase.execute(input)).rejects.toThrow();
        });
    });
});
