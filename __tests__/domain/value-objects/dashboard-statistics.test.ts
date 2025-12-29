import { DashboardStatistics } from "@/domain/value-objects/dashboard-statistics";

describe("DashboardStatistics", () => {
    describe("create", () => {
        it("正常な値で統計情報を作成できる", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 10,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 3,
            });

            expect(stats.totalMemos).toBe(10);
            expect(stats.totalStocks).toBe(5);
            expect(stats.totalTags).toBe(15);
            expect(stats.pinnedMemos).toBe(3);
        });

        it("ゼロの値でも作成できる", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 0,
                totalStocks: 0,
                totalTags: 0,
                pinnedMemos: 0,
            });

            expect(stats.totalMemos).toBe(0);
            expect(stats.totalStocks).toBe(0);
            expect(stats.totalTags).toBe(0);
            expect(stats.pinnedMemos).toBe(0);
        });

        it("負の値はエラー", () => {
            expect(() => DashboardStatistics.create({
                totalMemos: -1,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 3,
            })).toThrow("統計値は0以上である必要があります");
        });
    });

    describe("isEmpty", () => {
        it("全てゼロの場合はtrue", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 0,
                totalStocks: 0,
                totalTags: 0,
                pinnedMemos: 0,
            });

            expect(stats.isEmpty).toBe(true);
        });

        it("メモがある場合はfalse", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 1,
                totalStocks: 0,
                totalTags: 0,
                pinnedMemos: 0,
            });

            expect(stats.isEmpty).toBe(false);
        });
    });

    describe("hasPinnedMemos", () => {
        it("ピン留めメモがある場合はtrue", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 10,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 3,
            });

            expect(stats.hasPinnedMemos).toBe(true);
        });

        it("ピン留めメモがない場合はfalse", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 10,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 0,
            });

            expect(stats.hasPinnedMemos).toBe(false);
        });
    });

    describe("toPrimitive", () => {
        it("プリミティブなオブジェクトに変換できる", () => {
            const stats = DashboardStatistics.create({
                totalMemos: 10,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 3,
            });

            expect(stats.toPrimitive()).toEqual({
                totalMemos: 10,
                totalStocks: 5,
                totalTags: 15,
                pinnedMemos: 3,
            });
        });
    });
});
