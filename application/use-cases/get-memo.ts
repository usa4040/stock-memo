import { Memo, IMemoRepository } from "@/domain";

/**
 * メモ取得ユースケース 入力
 */
export interface GetMemoInput {
    memoId: string;
    userId: string | null; // 閲覧者のID（未ログインの場合はnull）
}

/**
 * メモ取得ユースケース
 */
export class GetMemoUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: GetMemoInput): Promise<Memo> {
        // メモを取得
        const memo = await this.memoRepository.findById(input.memoId);

        if (!memo) {
            throw new Error("メモが見つかりません");
        }

        // 閲覧権限チェック
        if (!memo.canBeViewedBy(input.userId)) {
            throw new Error("アクセス権限がありません");
        }

        return memo;
    }
}
