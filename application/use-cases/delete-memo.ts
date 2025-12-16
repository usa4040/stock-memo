import { IMemoRepository } from "@/domain";

/**
 * メモ削除ユースケース 入力
 */
export interface DeleteMemoInput {
    memoId: string;
    userId: string; // 権限チェック用
}

/**
 * メモ削除ユースケース
 */
export class DeleteMemoUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: DeleteMemoInput): Promise<void> {
        // メモを取得
        const memo = await this.memoRepository.findById(input.memoId);

        if (!memo) {
            throw new Error("メモが見つかりません");
        }

        // 権限チェック
        if (!memo.isOwnedBy(input.userId)) {
            throw new Error("削除権限がありません");
        }

        // 削除
        await this.memoRepository.delete(input.memoId);
    }
}
