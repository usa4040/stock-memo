import { IWatchlistRepository } from "@/domain";

export interface CheckWatchlistInput {
    userId: string;
    stockCode: string;
}

export interface CheckWatchlistOutput {
    isWatching: boolean;
    note: string | null;
}

/**
 * 銘柄がウォッチ中か確認するユースケース
 */
export class CheckWatchlistUseCase {
    constructor(private readonly watchlistRepository: IWatchlistRepository) { }

    async execute(input: CheckWatchlistInput): Promise<CheckWatchlistOutput> {
        const { userId, stockCode } = input;

        const item = await this.watchlistRepository.findByUserIdAndStockCode(
            userId,
            stockCode
        );

        if (item) {
            return {
                isWatching: true,
                note: item.note,
            };
        }

        return {
            isWatching: false,
            note: null,
        };
    }
}
