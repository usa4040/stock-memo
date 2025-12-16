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

        // タイトルまたは内容にキーワードを含むメモを検索
        const where = {
            userId,
            OR: [
                { title: { contains: keyword } },
                { content: { contains: keyword } },
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
}
