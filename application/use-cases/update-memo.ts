import { Memo, IMemoRepository } from "@/domain";

/**
 * メモ更新ユースケース 入力
 */
export interface UpdateMemoInput {
    memoId: string;
    userId: string; // 権限チェック用
    title?: string | null;
    content?: string;
    tags?: string[];
    pinned?: boolean;
    visibility?: "private" | "public";
}

/**
 * メモ更新ユースケース
 */
export class UpdateMemoUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: UpdateMemoInput): Promise<Memo> {
        // メモを取得
        const memo = await this.memoRepository.findById(input.memoId);

        if (!memo) {
            throw new Error("メモが見つかりません");
        }

        // 権限チェック
        if (!memo.isOwnedBy(input.userId)) {
            throw new Error("編集権限がありません");
        }

        // 各フィールドを更新
        if (input.title !== undefined) {
            memo.updateTitle(input.title);
        }

        if (input.content !== undefined) {
            memo.updateContent(input.content);
        }

        if (input.tags !== undefined) {
            memo.updateTags(input.tags);
        }

        if (input.pinned !== undefined) {
            if (input.pinned) {
                memo.pin();
            } else {
                memo.unpin();
            }
        }

        if (input.visibility !== undefined) {
            if (input.visibility === "public") {
                memo.publish();
            } else {
                memo.unpublish();
            }
        }

        // 永続化
        await this.memoRepository.save(memo);

        return memo;
    }
}
