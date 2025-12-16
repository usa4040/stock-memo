import { Memo, IMemoRepository } from "@/domain";

/**
 * タグでメモをフィルタリングするユースケース 入力
 */
export interface FilterMemosByTagsInput {
    userId: string;
    tags: string[];
    page?: number;
    limit?: number;
}

/**
 * タグでメモをフィルタリングするユースケース
 */
export class FilterMemosByTagsUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: FilterMemosByTagsInput): Promise<{
        memos: Memo[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        // タグが空の場合はエラー
        if (!input.tags || input.tags.length === 0) {
            throw new Error("タグを1つ以上指定してください");
        }

        const page = input.page || 1;
        const limit = input.limit || 20;

        const { memos, total } = await this.memoRepository.findByUserIdAndTags(
            input.userId,
            input.tags,
            { page, limit }
        );

        return {
            memos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
