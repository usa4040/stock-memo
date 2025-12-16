import { Stock, IStockRepository } from "@/domain";

/**
 * 銘柄検索ユースケース 入力
 */
export interface SearchStocksInput {
    query?: string;
    page?: number;
    limit?: number;
}

/**
 * 銘柄検索ユースケース
 */
export class SearchStocksUseCase {
    constructor(private readonly stockRepository: IStockRepository) { }

    async execute(input: SearchStocksInput): Promise<{
        stocks: Stock[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const page = input.page || 1;
        const limit = input.limit || 20;

        const { stocks, total } = await this.stockRepository.search({
            query: input.query,
            page,
            limit,
        });

        return {
            stocks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
