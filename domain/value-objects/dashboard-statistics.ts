/**
 * ダッシュボード統計 値オブジェクト
 *
 * ユーザーのダッシュボードに表示する統計情報を表す
 */
export class DashboardStatistics {
    private constructor(
        private readonly _totalMemos: number,
        private readonly _totalStocks: number,
        private readonly _totalTags: number,
        private readonly _pinnedMemos: number,
    ) { }

    /**
     * ダッシュボード統計を作成
     */
    static create(props: {
        totalMemos: number;
        totalStocks: number;
        totalTags: number;
        pinnedMemos: number;
    }): DashboardStatistics {
        // バリデーション: 全ての値が0以上であること
        if (
            props.totalMemos < 0 ||
            props.totalStocks < 0 ||
            props.totalTags < 0 ||
            props.pinnedMemos < 0
        ) {
            throw new Error("統計値は0以上である必要があります");
        }

        return new DashboardStatistics(
            props.totalMemos,
            props.totalStocks,
            props.totalTags,
            props.pinnedMemos,
        );
    }

    // ========== Getters ==========

    get totalMemos(): number {
        return this._totalMemos;
    }

    get totalStocks(): number {
        return this._totalStocks;
    }

    get totalTags(): number {
        return this._totalTags;
    }

    get pinnedMemos(): number {
        return this._pinnedMemos;
    }

    // ========== ビジネスロジック ==========

    /**
     * 統計が空（メモがない）かどうか
     */
    get isEmpty(): boolean {
        return this._totalMemos === 0;
    }

    /**
     * ピン留めメモがあるかどうか
     */
    get hasPinnedMemos(): boolean {
        return this._pinnedMemos > 0;
    }

    /**
     * プリミティブなオブジェクトに変換（API用）
     */
    toPrimitive(): {
        totalMemos: number;
        totalStocks: number;
        totalTags: number;
        pinnedMemos: number;
    } {
        return {
            totalMemos: this._totalMemos,
            totalStocks: this._totalStocks,
            totalTags: this._totalTags,
            pinnedMemos: this._pinnedMemos,
        };
    }
}
