import { WatchlistItem } from "../entities";

/**
 * ウォッチリストリポジトリ インターフェース
 * 
 * ウォッチリストの永続化を抽象化する
 * 実装はインフラ層で行う（Prisma等）
 */
export interface IWatchlistRepository {
    /**
     * ユーザーのウォッチリストを取得
     */
    findByUserId(userId: string): Promise<WatchlistItem[]>;

    /**
     * ユーザーIDと銘柄コードでウォッチアイテムを取得
     */
    findByUserIdAndStockCode(
        userId: string,
        stockCode: string
    ): Promise<WatchlistItem | null>;

    /**
     * ウォッチリストアイテムを保存（作成・更新）
     */
    save(item: WatchlistItem): Promise<void>;

    /**
     * ウォッチリストアイテムを削除
     */
    delete(id: string): Promise<void>;

    /**
     * ユーザーのウォッチリスト件数を取得
     */
    countByUserId(userId: string): Promise<number>;
}
