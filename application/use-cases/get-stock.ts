import { Stock, IStockRepository } from "@/domain";

/**
 * 銘柄取得ユースケース 入力
 */
export interface GetStockInput {
    code: string;
}

/**
 * 銘柄取得ユースケース
 */
export class GetStockUseCase {
    constructor(private readonly stockRepository: IStockRepository) { }

    async execute(input: GetStockInput): Promise<Stock> {
        const stock = await this.stockRepository.findByCode(input.code);

        if (!stock) {
            throw new Error("銘柄が見つかりません");
        }

        return stock;
    }
}
