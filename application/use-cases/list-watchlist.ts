import { WatchlistItem, IWatchlistRepository } from "@/domain";

export interface ListWatchlistInput {
    userId: string;
}

export interface WatchlistOutput {
    items: WatchlistItem[];
    total: number;
}

/**
 * ユーザーのウォッチリストを取得するユースケース
 */
export class ListWatchlistUseCase {
    constructor(private readonly watchlistRepository: IWatchlistRepository) { }

    async execute(input: ListWatchlistInput): Promise<WatchlistOutput> {
        const { userId } = input;

        const [items, total] = await Promise.all([
            this.watchlistRepository.findByUserId(userId),
            this.watchlistRepository.countByUserId(userId),
        ]);

        return { items, total };
    }
}
