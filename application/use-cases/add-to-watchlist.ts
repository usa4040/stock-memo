import { WatchlistItem, IWatchlistRepository, IStockRepository } from "@/domain";

export interface AddToWatchlistInput {
    userId: string;
    stockCode: string;
    note?: string;
}

/**
 * ウォッチリストに銘柄を追加するユースケース
 */
export class AddToWatchlistUseCase {
    constructor(
        private readonly watchlistRepository: IWatchlistRepository,
        private readonly stockRepository: IStockRepository
    ) { }

    async execute(input: AddToWatchlistInput): Promise<WatchlistItem> {
        const { userId, stockCode, note } = input;

        // 銘柄の存在確認
        const stock = await this.stockRepository.findByCode(stockCode);
        if (!stock) {
            throw new Error("指定された銘柄が見つかりません");
        }

        // 既にウォッチ済みか確認
        const existing = await this.watchlistRepository.findByUserIdAndStockCode(
            userId,
            stockCode
        );
        if (existing) {
            throw new Error("既にウォッチリストに追加されています");
        }

        // ウォッチリストアイテムを作成
        const item = WatchlistItem.create({
            id: crypto.randomUUID(),
            userId,
            stockCode,
            note,
        });

        await this.watchlistRepository.save(item);

        return item;
    }
}
