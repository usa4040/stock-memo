import { IWatchlistRepository } from "@/domain";

export interface RemoveFromWatchlistInput {
    userId: string;
    stockCode: string;
}

/**
 * ウォッチリストから銘柄を削除するユースケース
 */
export class RemoveFromWatchlistUseCase {
    constructor(private readonly watchlistRepository: IWatchlistRepository) { }

    async execute(input: RemoveFromWatchlistInput): Promise<void> {
        const { userId, stockCode } = input;

        // ウォッチアイテムを取得
        const item = await this.watchlistRepository.findByUserIdAndStockCode(
            userId,
            stockCode
        );

        if (!item) {
            throw new Error("ウォッチリストに見つかりません");
        }

        // 所有者確認
        if (!item.isOwnedBy(userId)) {
            throw new Error("削除する権限がありません");
        }

        await this.watchlistRepository.delete(item.id);
    }
}
