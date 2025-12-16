import { PrismaClient } from "@prisma/client";
import { Stock, IStockRepository, StockSearchOptions } from "@/domain";

/**
 * Prisma を使った銘柄リポジトリの実装
 */
export class PrismaStockRepository implements IStockRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * 銘柄コードで銘柄を取得
     */
    async findByCode(code: string): Promise<Stock | null> {
        const data = await this.prisma.stock.findUnique({
            where: { code },
        });

        if (!data) {
            return null;
        }

        return this.toDomain(data);
    }

    /**
     * 銘柄一覧を検索・取得
     */
    async search(options?: StockSearchOptions): Promise<{
        stocks: Stock[];
        total: number;
    }> {
        const query = options?.query;
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        // 検索条件を構築
        const where = query
            ? {
                OR: [
                    { code: { contains: query } },
                    { name: { contains: query } },
                ],
            }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.stock.findMany({
                where,
                skip,
                take: limit,
                orderBy: { code: "asc" },
            }),
            this.prisma.stock.count({ where }),
        ]);

        return {
            stocks: data.map((d) => this.toDomain(d)),
            total,
        };
    }

    /**
     * 全銘柄数を取得
     */
    async count(): Promise<number> {
        return this.prisma.stock.count();
    }

    /**
     * Prismaのデータ → ドメインモデルに変換
     */
    private toDomain(data: {
        code: string;
        name: string;
        marketSegment: string | null;
        industry33Code: string | null;
        industry33Name: string | null;
        industry17Code: string | null;
        industry17Name: string | null;
        scaleCode: string | null;
        scaleName: string | null;
    }): Stock {
        return Stock.reconstruct({
            code: data.code,
            name: data.name,
            marketSegment: data.marketSegment,
            industry33Code: data.industry33Code,
            industry33Name: data.industry33Name,
            industry17Code: data.industry17Code,
            industry17Name: data.industry17Name,
            scaleCode: data.scaleCode,
            scaleName: data.scaleName,
        });
    }
}
