import { Memo, IMemoRepository, IStockRepository, DashboardStatistics } from "@/domain";

/**
 * ダッシュボードデータ取得ユースケース 入力
 */
export interface GetDashboardInput {
    userId: string;
}

/**
 * メモサマリー（ダッシュボード表示用）
 */
export interface MemoSummary {
    id: string;
    title: string | null;
    content: string;
    stockCode: string;
    stockName: string;
    updatedAt: Date;
    tags: string[];
    pinned: boolean;
}

/**
 * ダッシュボードデータ取得ユースケース 出力
 */
export interface DashboardOutput {
    statistics: DashboardStatistics;
    pinnedMemos: MemoSummary[];
    recentMemos: MemoSummary[];
    topTags: { tag: string; count: number }[];
}

/**
 * ダッシュボードデータ取得ユースケース
 * 
 * ユーザーのダッシュボードに表示する情報を取得する
 */
export class GetDashboardUseCase {
    constructor(
        private readonly memoRepository: IMemoRepository,
        private readonly stockRepository: IStockRepository,
    ) { }

    async execute(input: GetDashboardInput): Promise<DashboardOutput> {
        const { userId } = input;

        // 並列で各データを取得
        const [
            totalMemos,
            totalStocks,
            totalTags,
            pinnedCount,
            pinnedMemos,
            recentMemos,
            topTags,
        ] = await Promise.all([
            this.memoRepository.countByUserId(userId),
            this.memoRepository.countUniqueStocksByUserId(userId),
            this.memoRepository.countUniqueTagsByUserId(userId),
            this.memoRepository.countPinnedByUserId(userId),
            this.memoRepository.findPinnedByUserId(userId, 5),
            this.memoRepository.findRecentByUserId(userId, 5),
            this.memoRepository.getTagStatistics(userId, 10),
        ]);

        // 統計情報を作成
        const statistics = DashboardStatistics.create({
            totalMemos,
            totalStocks,
            totalTags,
            pinnedMemos: pinnedCount,
        });

        // メモに銘柄名を付与してMemoSummaryに変換
        const pinnedMemoSummaries = await this.memoToSummaries(pinnedMemos);
        const recentMemoSummaries = await this.memoToSummaries(recentMemos);

        return {
            statistics,
            pinnedMemos: pinnedMemoSummaries,
            recentMemos: recentMemoSummaries,
            topTags,
        };
    }

    /**
     * Memoエンティティ配列をMemoSummary配列に変換
     * 銘柄情報を取得して付与する
     */
    private async memoToSummaries(memos: Memo[]): Promise<MemoSummary[]> {
        // 重複なしで銘柄コードを収集
        const stockCodes = [...new Set(memos.map((m) => m.stockCode.value))];

        // 銘柄情報を取得
        const stockMap = new Map<string, string>();
        await Promise.all(
            stockCodes.map(async (code) => {
                const stock = await this.stockRepository.findByCode(code);
                if (stock) {
                    stockMap.set(code, stock.name);
                }
            })
        );

        // MemoSummaryに変換
        return memos.map((memo) => {
            const primitive = memo.toPrimitive();
            return {
                id: primitive.id,
                title: primitive.title,
                content: this.truncateContent(primitive.content, 100),
                stockCode: primitive.stockCode,
                stockName: stockMap.get(primitive.stockCode) || primitive.stockCode,
                updatedAt: primitive.updatedAt,
                tags: primitive.tags,
                pinned: primitive.pinned,
            };
        });
    }

    /**
     * コンテンツを指定文字数で切り詰める
     */
    private truncateContent(content: string, maxLength: number): string {
        if (content.length <= maxLength) {
            return content;
        }
        return content.slice(0, maxLength) + "...";
    }
}
