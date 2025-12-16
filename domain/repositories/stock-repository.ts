import { Stock } from "../entities";

/**
 * 銘柄検索オプション
 */
export interface StockSearchOptions {
    query?: string;
    page?: number;
    limit?: number;
}

/**
 * 銘柄リポジトリ インターフェース
 */
export interface IStockRepository {
    /**
     * 銘柄コードで銘柄を取得
     */
    findByCode(code: string): Promise<Stock | null>;

    /**
     * 銘柄一覧を検索・取得
     */
    search(options?: StockSearchOptions): Promise<{
        stocks: Stock[];
        total: number;
    }>;

    /**
     * 全銘柄数を取得
     */
    count(): Promise<number>;
}
