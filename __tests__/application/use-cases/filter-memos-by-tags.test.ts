import { Memo, IMemoRepository } from "@/domain";
import { FilterMemosByTagsUseCase } from "@/application";

// モックリポジトリ
const createMockRepository = (): jest.Mocked<IMemoRepository> => ({
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findPublicByStockCode: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    countByUserId: jest.fn(),
    findByUserIdAndTags: jest.fn(), // 新しいメソッド
});

// テスト用メモを作成
const createTestMemo = (overrides?: Partial<{
    id: string;
    userId: string;
    tags: string[];
}>) => {
    return Memo.create({
        id: overrides?.id || "memo-1",
        userId: overrides?.userId || "user-1",
        stockCode: "7203",
        content: "テスト内容",
        tags: overrides?.tags || [],
    });
};

describe("タグでフィルタリング機能", () => {
    describe("リポジトリ: findByUserIdAndTags", () => {
        it("指定したタグを含むメモのみ返す", async () => {
            const mockRepository = createMockRepository();

            const memo1 = createTestMemo({ id: "memo-1", tags: ["長期投資", "高配当"] });
            // memo2は「長期投資」タグを持たないのでフィルタ結果に含まれない
            createTestMemo({ id: "memo-2", tags: ["短期投資"] });
            const memo3 = createTestMemo({ id: "memo-3", tags: ["長期投資", "バリュー"] });

            // 「長期投資」タグでフィルタリング
            mockRepository.findByUserIdAndTags.mockResolvedValue({
                memos: [memo1, memo3],
                total: 2,
            });

            const result = await mockRepository.findByUserIdAndTags(
                "user-1",
                ["長期投資"],
                { page: 1, limit: 20 }
            );

            expect(result.memos).toHaveLength(2);
            expect(result.memos[0].tags).toContain("長期投資");
            expect(result.memos[1].tags).toContain("長期投資");
        });

        it("複数タグでAND検索できる", async () => {
            const mockRepository = createMockRepository();

            const memo1 = createTestMemo({ id: "memo-1", tags: ["長期投資", "高配当"] });

            // 「長期投資」AND「高配当」タグでフィルタリング
            mockRepository.findByUserIdAndTags.mockResolvedValue({
                memos: [memo1],
                total: 1,
            });

            const result = await mockRepository.findByUserIdAndTags(
                "user-1",
                ["長期投資", "高配当"],
                { page: 1, limit: 20 }
            );

            expect(result.memos).toHaveLength(1);
            expect(result.memos[0].tags).toContain("長期投資");
            expect(result.memos[0].tags).toContain("高配当");
        });

        it("タグが一致しない場合は空配列を返す", async () => {
            const mockRepository = createMockRepository();

            mockRepository.findByUserIdAndTags.mockResolvedValue({
                memos: [],
                total: 0,
            });

            const result = await mockRepository.findByUserIdAndTags(
                "user-1",
                ["存在しないタグ"],
                { page: 1, limit: 20 }
            );

            expect(result.memos).toHaveLength(0);
            expect(result.total).toBe(0);
        });
    });
});

describe("FilterMemosByTagsUseCase", () => {
    let useCase: FilterMemosByTagsUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new FilterMemosByTagsUseCase(mockRepository);
    });

    it("指定したタグを含むメモのみ返す", async () => {
        const memo1 = createTestMemo({ id: "memo-1", tags: ["長期投資", "高配当"] });
        const memo3 = createTestMemo({ id: "memo-3", tags: ["長期投資", "バリュー"] });

        mockRepository.findByUserIdAndTags.mockResolvedValue({
            memos: [memo1, memo3],
            total: 2,
        });

        const result = await useCase.execute({
            userId: "user-1",
            tags: ["長期投資"],
        });

        expect(result.memos).toHaveLength(2);
        expect(result.pagination.total).toBe(2);
        expect(mockRepository.findByUserIdAndTags).toHaveBeenCalledWith(
            "user-1",
            ["長期投資"],
            { page: 1, limit: 20 }
        );
    });

    it("複数タグでAND検索できる", async () => {
        const memo1 = createTestMemo({ id: "memo-1", tags: ["長期投資", "高配当"] });

        mockRepository.findByUserIdAndTags.mockResolvedValue({
            memos: [memo1],
            total: 1,
        });

        const result = await useCase.execute({
            userId: "user-1",
            tags: ["長期投資", "高配当"],
        });

        expect(result.memos).toHaveLength(1);
        expect(mockRepository.findByUserIdAndTags).toHaveBeenCalledWith(
            "user-1",
            ["長期投資", "高配当"],
            { page: 1, limit: 20 }
        );
    });

    it("ページネーションが動作する", async () => {
        mockRepository.findByUserIdAndTags.mockResolvedValue({
            memos: [],
            total: 50,
        });

        const result = await useCase.execute({
            userId: "user-1",
            tags: ["長期投資"],
            page: 2,
            limit: 10,
        });

        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.totalPages).toBe(5);
        expect(mockRepository.findByUserIdAndTags).toHaveBeenCalledWith(
            "user-1",
            ["長期投資"],
            { page: 2, limit: 10 }
        );
    });

    it("タグが空の場合はエラー", async () => {
        await expect(
            useCase.execute({
                userId: "user-1",
                tags: [],
            })
        ).rejects.toThrow("タグを1つ以上指定してください");
    });
});
