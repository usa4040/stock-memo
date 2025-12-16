import { Memo, IMemoRepository } from "@/domain";

/**
 * メモ検索ユースケース 入力
 */
export interface SearchMemosInput {
    userId: string;
    keyword: string;
    page?: number;
    limit?: number;
}

/**
 * メモ検索ユースケース
 * 
 * タイトルと内容からキーワードを検索する
 */
export class SearchMemosUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: SearchMemosInput): Promise<{
        memos: Memo[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        // キーワードのバリデーション
        const keyword = input.keyword?.trim();
        if (!keyword) {
            throw new Error("検索キーワードを入力してください");
        }

        const page = input.page || 1;
        const limit = input.limit || 20;

        const { memos, total } = await this.memoRepository.searchByKeyword(
            input.userId,
            keyword,
            { page, limit }
        );

        return {
            memos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        };
    }
}
