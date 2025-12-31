import { PrismaClient } from "@prisma/client";
import { WatchlistItem, IWatchlistRepository } from "@/domain";

/**
 * ウォッチリストリポジトリ Prisma実装
 */
export class PrismaWatchlistRepository implements IWatchlistRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByUserId(userId: string): Promise<WatchlistItem[]> {
        const data = await this.prisma.watchlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return data.map((d) => this.toDomain(d));
    }

    async findByUserIdAndStockCode(
        userId: string,
        stockCode: string
    ): Promise<WatchlistItem | null> {
        const data = await this.prisma.watchlistItem.findUnique({
            where: {
                userId_stockCode: { userId, stockCode },
            },
        });

        if (!data) return null;
        return this.toDomain(data);
    }

    async save(item: WatchlistItem): Promise<void> {
        const primitive = item.toPrimitive();
        await this.prisma.watchlistItem.upsert({
            where: { id: primitive.id },
            create: {
                id: primitive.id,
                userId: primitive.userId,
                stockCode: primitive.stockCode,
                note: primitive.note,
                createdAt: primitive.createdAt,
            },
            update: {
                note: primitive.note,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.watchlistItem.delete({
            where: { id },
        });
    }

    async countByUserId(userId: string): Promise<number> {
        return this.prisma.watchlistItem.count({
            where: { userId },
        });
    }

    private toDomain(data: {
        id: string;
        userId: string;
        stockCode: string;
        note: string | null;
        createdAt: Date;
    }): WatchlistItem {
        return WatchlistItem.reconstruct({
            id: data.id,
            userId: data.userId,
            stockCode: data.stockCode,
            note: data.note,
            createdAt: data.createdAt,
        });
    }
}
