import { PrismaClient } from "@prisma/client";
import { Memo, IMemoRepository } from "@/domain";

/**
 * Prisma を使ったメモリポジトリの実装
 */
export class PrismaMemoRepository implements IMemoRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * IDでメモを取得
     */
    async findById(id: string): Promise<Memo | null> {
        const data = await this.prisma.memo.findUnique({
            where: { id },
        });

        if (!data) {
            return null;
        }

        return this.toDomain(data);
    }

    /**
     * ユーザーのメモ一覧を取得
     */
    async findByUserId(
        userId: string,
        options?: { page?: number; limit?: number }
    ): Promise<{ memos: Memo[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.memo.findMany({
                where: { userId },
                orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
                skip,
                take: limit,
            }),
            this.prisma.memo.count({ where: { userId } }),
        ]);

        return {
            memos: data.map((d) => this.toDomain(d)),
            total,
        };
    }

    /**
     * 銘柄コードで公開メモを取得
     */
    async findPublicByStockCode(
        stockCode: string,
        options?: { page?: number; limit?: number }
    ): Promise<{ memos: Memo[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where = {
            stockCode,
            visibility: "public",
        };

        const [data, total] = await Promise.all([
            this.prisma.memo.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.memo.count({ where }),
        ]);

        return {
            memos: data.map((d) => this.toDomain(d)),
            total,
        };
    }

    /**
     * メモを保存（upsert）
     */
    async save(memo: Memo): Promise<void> {
        const data = memo.toPrimitive();

        await this.prisma.memo.upsert({
            where: { id: data.id },
            update: {
                title: data.title,
                content: data.content,
                tags: data.tags,
                pinned: data.pinned,
                visibility: data.visibility,
                updatedAt: data.updatedAt,
            },
            create: {
                id: data.id,
                userId: data.userId,
                stockCode: data.stockCode,
                title: data.title,
                content: data.content,
                tags: data.tags,
                pinned: data.pinned,
                visibility: data.visibility,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            },
        });
    }

    /**
     * メモを削除
     */
    async delete(id: string): Promise<void> {
        await this.prisma.memo.delete({
            where: { id },
        });
    }

    /**
     * ユーザーのメモ数を取得
     */
    async countByUserId(userId: string): Promise<number> {
        return this.prisma.memo.count({
            where: { userId },
        });
    }

    /**
     * ユーザーのメモをタグでフィルタリングして取得
     */
    async findByUserIdAndTags(
        userId: string,
        tags: string[],
        options?: { page?: number; limit?: number }
    ): Promise<{ memos: Memo[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        // 全てのタグを含むメモを検索（AND検索）
        const where = {
            userId,
            AND: tags.map((tag) => ({
                tags: { has: tag },
            })),
        };

        const [data, total] = await Promise.all([
            this.prisma.memo.findMany({
                where,
                orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
                skip,
                take: limit,
            }),
            this.prisma.memo.count({ where }),
        ]);

        return {
            memos: data.map((d) => this.toDomain(d)),
            total,
        };
    }

    /**
     * キーワードでメモを検索
     */
    async searchByKeyword(
        userId: string,
        keyword: string,
        options?: { page?: number; limit?: number }
    ): Promise<{ memos: Memo[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        // タイトル、内容、銘柄名、銘柄コードにキーワードを含むメモを検索
        const where = {
            userId,
            OR: [
                { title: { contains: keyword } },
                { content: { contains: keyword } },
                { stock: { name: { contains: keyword } } },
                { stock: { code: { contains: keyword } } },
            ],
        };

        const [data, total] = await Promise.all([
            this.prisma.memo.findMany({
                where,
                orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
                skip,
                take: limit,
            }),
            this.prisma.memo.count({ where }),
        ]);

        return {
            memos: data.map((d) => this.toDomain(d)),
            total,
        };
    }

    /**
     * Prismaのデータ → ドメインモデルに変換
     */
    private toDomain(data: {
        id: string;
        userId: string;
        stockCode: string;
        title: string | null;
        content: string;
        tags: string[];
        pinned: boolean;
        visibility: string;
        createdAt: Date;
        updatedAt: Date;
    }): Memo {
        return Memo.reconstruct({
            id: data.id,
            userId: data.userId,
            stockCode: data.stockCode,
            title: data.title,
            content: data.content,
            tags: data.tags,
            pinned: data.pinned,
            visibility: data.visibility,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    // ========== ダッシュボード用メソッド ==========

    /**
     * ユーザーのピン留めメモを取得
     */
    async findPinnedByUserId(userId: string, limit: number = 5): Promise<Memo[]> {
        const data = await this.prisma.memo.findMany({
            where: {
                userId,
                pinned: true,
            },
            orderBy: { updatedAt: "desc" },
            take: limit,
        });

        return data.map((d) => this.toDomain(d));
    }

    /**
     * ユーザーの最近更新したメモを取得
     */
    async findRecentByUserId(userId: string, limit: number = 5): Promise<Memo[]> {
        const data = await this.prisma.memo.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: limit,
        });

        return data.map((d) => this.toDomain(d));
    }

    /**
     * ユーザーのタグ統計を取得（使用回数順）
     */
    async getTagStatistics(
        userId: string,
        limit: number = 10
    ): Promise<{ tag: string; count: number }[]> {
        // ユーザーの全メモを取得してタグを集計
        const memos = await this.prisma.memo.findMany({
            where: { userId },
            select: { tags: true },
        });

        // タグの出現回数をカウント
        const tagCounts = new Map<string, number>();
        for (const memo of memos) {
            for (const tag of memo.tags) {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
        }

        // 出現回数順にソートして上位を返す
        return Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * ユーザーの対象銘柄数を取得
     */
    async countUniqueStocksByUserId(userId: string): Promise<number> {
        const result = await this.prisma.memo.groupBy({
            by: ["stockCode"],
            where: { userId },
        });

        return result.length;
    }

    /**
     * ユーザーのタグ数を取得
     */
    async countUniqueTagsByUserId(userId: string): Promise<number> {
        const memos = await this.prisma.memo.findMany({
            where: { userId },
            select: { tags: true },
        });

        const uniqueTags = new Set<string>();
        for (const memo of memos) {
            for (const tag of memo.tags) {
                uniqueTags.add(tag);
            }
        }

        return uniqueTags.size;
    }

    /**
     * ユーザーのピン留めメモ数を取得
     */
    async countPinnedByUserId(userId: string): Promise<number> {
        return this.prisma.memo.count({
            where: {
                userId,
                pinned: true,
            },
        });
    }
}
