import { Memo, IMemoRepository } from "@/domain";
import { randomUUID } from "crypto";

/**
 * メモ作成ユースケース 入力
 */
export interface CreateMemoInput {
    userId: string;
    stockCode: string;
    content: string;
    title?: string;
    tags?: string[];
    visibility?: "private" | "public";
}

/**
 * メモ作成ユースケース
 */
export class CreateMemoUseCase {
    constructor(private readonly memoRepository: IMemoRepository) { }

    async execute(input: CreateMemoInput): Promise<Memo> {
        // メモを作成（ドメインロジックでバリデーション）
        const memo = Memo.create({
            id: randomUUID(),
            userId: input.userId,
            stockCode: input.stockCode,
            content: input.content,
            title: input.title,
            tags: input.tags,
            visibility: input.visibility,
        });

        // 永続化
        await this.memoRepository.save(memo);

        return memo;
    }
}
