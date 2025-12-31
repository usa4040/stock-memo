import { WatchlistItem } from "@/domain/entities/watchlist-item";

describe("WatchlistItem", () => {
    describe("create", () => {
        it("新しいウォッチリストアイテムを作成できる", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
            });

            expect(item.id).toBe("item-1");
            expect(item.userId).toBe("user-1");
            expect(item.stockCode.value).toBe("7203");
            expect(item.note).toBeNull();
            expect(item.createdAt).toBeInstanceOf(Date);
        });

        it("メモ付きでウォッチリストアイテムを作成できる", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
                note: "高配当銘柄として注目",
            });

            expect(item.note).toBe("高配当銘柄として注目");
        });

        it("無効な銘柄コードでエラーになる", () => {
            expect(() => {
                WatchlistItem.create({
                    id: "item-1",
                    userId: "user-1",
                    stockCode: "invalid",
                });
            }).toThrow();
        });
    });

    describe("reconstruct", () => {
        it("DBからウォッチリストアイテムを復元できる", () => {
            const createdAt = new Date("2024-01-01");
            const item = WatchlistItem.reconstruct({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
                note: "テストメモ",
                createdAt,
            });

            expect(item.id).toBe("item-1");
            expect(item.stockCode.value).toBe("7203");
            expect(item.note).toBe("テストメモ");
            expect(item.createdAt).toEqual(createdAt);
        });
    });

    describe("isOwnedBy", () => {
        it("所有者ならtrueを返す", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
            });

            expect(item.isOwnedBy("user-1")).toBe(true);
            expect(item.isOwnedBy("user-2")).toBe(false);
        });
    });

    describe("updateNote", () => {
        it("メモを更新できる", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
            });

            item.updateNote("新しいメモ");
            expect(item.note).toBe("新しいメモ");
        });

        it("メモをnullにできる", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
                note: "既存のメモ",
            });

            item.updateNote(null);
            expect(item.note).toBeNull();
        });
    });

    describe("toPrimitive", () => {
        it("プリミティブなオブジェクトに変換できる", () => {
            const item = WatchlistItem.create({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
                note: "テスト",
            });

            const primitive = item.toPrimitive();
            expect(primitive).toEqual({
                id: "item-1",
                userId: "user-1",
                stockCode: "7203",
                note: "テスト",
                createdAt: expect.any(Date),
            });
        });
    });
});
