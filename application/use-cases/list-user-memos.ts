import { Memo, IMemoRepository } from "@/domain";

/**
 * ユーザーのメモ一覧取得ユースケース 入力
 */
export interface ListUserMemosInput {
    userId: string;
    page?: number;
    limit?: number;
}

/**
 * ユーザーのメモ一覧取得ユースケース
 */
export class ListUserMemosUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: ListUserMemosInput): Promise<{
        memos: Memo[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const page = input.page || 1;
        const limit = input.limit || 20;

        const { memos, total } = await this.memoRepository.findByUserId(
            input.userId,
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
