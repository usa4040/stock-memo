import { Memo, IMemoRepository } from "@/domain";
import { SearchMemosUseCase } from "@/application";

// モックリポジトリ
const createMockRepository = (): jest.Mocked<IMemoRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findPublicByStockCode: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  countByUserId: jest.fn(),
  findByUserIdAndTags: jest.fn(),
  searchByKeyword: jest.fn(), // 新しいメソッド
});

// テスト用メモを作成
const createTestMemo = (overrides?: Partial<{
  id: string;
  userId: string;
  title: string;
  content: string;
}>) => {
  return Memo.create({
    id: overrides?.id || "memo-1",
    userId: overrides?.userId || "user-1",
    stockCode: "7203",
    content: overrides?.content || "テスト内容",
    title: overrides?.title,
  });
};

describe("SearchMemosUseCase", () => {
  let useCase: SearchMemosUseCase;
  let mockRepository: jest.Mocked<IMemoRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new SearchMemosUseCase(mockRepository);
  });

  it("キーワードでメモを検索できる", async () => {
    const memo1 = createTestMemo({ 
      id: "memo-1", 
      title: "トヨタの分析", 
      content: "長期投資に向いている" 
    });
    const memo2 = createTestMemo({ 
      id: "memo-2", 
      title: "ソニーの決算", 
      content: "好決算で株価上昇" 
    });

    mockRepository.searchByKeyword.mockResolvedValue({
      memos: [memo1],
      total: 1,
    });

    const result = await useCase.execute({
      userId: "user-1",
      keyword: "トヨタ",
    });

    expect(result.memos).toHaveLength(1);
    expect(result.memos[0].title).toBe("トヨタの分析");
    expect(mockRepository.searchByKeyword).toHaveBeenCalledWith(
      "user-1",
      "トヨタ",
      { page: 1, limit: 20 }
    );
  });

  it("タイトルと内容の両方を検索できる", async () => {
    const memo1 = createTestMemo({ 
      id: "memo-1", 
      title: "分析メモ", 
      content: "長期投資のポイント" 
    });
    const memo2 = createTestMemo({ 
      id: "memo-2", 
      title: "長期投資戦略", 
      content: "バリュー株を狙う" 
    });

    mockRepository.searchByKeyword.mockResolvedValue({
      memos: [memo1, memo2],
      total: 2,
    });

    const result = await useCase.execute({
      userId: "user-1",
      keyword: "長期投資",
    });

    expect(result.memos).toHaveLength(2);
  });

  it("ページネーションが動作する", async () => {
    mockRepository.searchByKeyword.mockResolvedValue({
      memos: [],
      total: 50,
    });

    const result = await useCase.execute({
      userId: "user-1",
      keyword: "投資",
      page: 2,
      limit: 10,
    });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(5);
    expect(mockRepository.searchByKeyword).toHaveBeenCalledWith(
      "user-1",
      "投資",
      { page: 2, limit: 10 }
    );
  });

  it("キーワードが空の場合はエラー", async () => {
    await expect(
      useCase.execute({
        userId: "user-1",
        keyword: "",
      })
    ).rejects.toThrow("検索キーワードを入力してください");
  });

  it("キーワードが空白のみの場合はエラー", async () => {
    await expect(
      useCase.execute({
        userId: "user-1",
        keyword: "   ",
      })
    ).rejects.toThrow("検索キーワードを入力してください");
  });

  it("検索結果がない場合は空配列を返す", async () => {
    mockRepository.searchByKeyword.mockResolvedValue({
      memos: [],
      total: 0,
    });

    const result = await useCase.execute({
      userId: "user-1",
      keyword: "存在しないキーワード",
    });

    expect(result.memos).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
  });
});
