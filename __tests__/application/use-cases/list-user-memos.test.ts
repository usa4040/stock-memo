import { ListUserMemosUseCase } from "@/application/use-cases/list-user-memos";
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

describe("ListUserMemosUseCase", () => {
    let useCase: ListUserMemosUseCase;
    let mockRepository: jest.Mocked<IMemoRepository>;

    const createTestMemo = (id: string) =>
        Memo.create({
            id,
            userId: "user-1",
            stockCode: "7203",
            content: "テスト内容",
            title: `メモ ${id}`,
        });

    beforeEach(() => {
        mockRepository = createMockRepository();
        useCase = new ListUserMemosUseCase(mockRepository);
    });

    describe("execute", () => {
        it("ユーザーのメモ一覧を取得できる", async () => {
            const memos = [createTestMemo("memo-1"), createTestMemo("memo-2")];
            mockRepository.findByUserId.mockResolvedValue({ memos, total: 2 });

            const result = await useCase.execute({ userId: "user-1" });

            expect(result.memos).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
            expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
                page: 1,
                limit: 20,
            });
        });

        it("ページネーションパラメータを渡せる", async () => {
            mockRepository.findByUserId.mockResolvedValue({ memos: [], total: 50 });

            const result = await useCase.execute({
                userId: "user-1",
                page: 2,
                limit: 10,
            });

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(50);
            expect(result.pagination.totalPages).toBe(5);
            expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
                page: 2,
                limit: 10,
            });
        });

        it("デフォルトでpage=1, limit=20", async () => {
            mockRepository.findByUserId.mockResolvedValue({ memos: [], total: 0 });

            await useCase.execute({ userId: "user-1" });

            expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
                page: 1,
                limit: 20,
            });
        });

        it("メモがない場合は空配列を返す", async () => {
            mockRepository.findByUserId.mockResolvedValue({ memos: [], total: 0 });

            const result = await useCase.execute({ userId: "user-1" });

            expect(result.memos).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        it("totalPagesが正しく計算される", async () => {
            mockRepository.findByUserId.mockResolvedValue({ memos: [], total: 45 });

            const result = await useCase.execute({
                userId: "user-1",
                limit: 10,
            });

            expect(result.pagination.totalPages).toBe(5); // 45 / 10 = 4.5 -> ceil(4.5) = 5
        });
    });
});
