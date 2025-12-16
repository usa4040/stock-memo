import { Memo } from "@/domain/entities/memo";

describe("Memo Entity", () => {
    const createTestMemo = () => {
        return Memo.create({
            id: "memo-1",
            userId: "user-1",
            stockCode: "7203",
            content: "テスト内容",
            title: "テストタイトル",
            tags: ["タグ1", "タグ2"],
            visibility: "private",
        });
    };

    describe("create", () => {
        it("新しいメモを作成できる", () => {
            const memo = createTestMemo();

            expect(memo.id).toBe("memo-1");
            expect(memo.userId).toBe("user-1");
            expect(memo.stockCode.value).toBe("7203");
            expect(memo.content.value).toBe("テスト内容");
            expect(memo.title).toBe("テストタイトル");
            expect(memo.tags).toEqual(["タグ1", "タグ2"]);
            expect(memo.pinned).toBe(false);
            expect(memo.visibility.isPrivate).toBe(true);
        });

        it("タイトルなしでメモを作成できる", () => {
            const memo = Memo.create({
                id: "memo-2",
                userId: "user-1",
                stockCode: "7203",
                content: "テスト内容",
            });

            expect(memo.title).toBeNull();
        });

        it("不正な銘柄コードはエラー", () => {
            expect(() =>
                Memo.create({
                    id: "memo-3",
                    userId: "user-1",
                    stockCode: "720", // 3桁
                    content: "テスト内容",
                })
            ).toThrow();
        });

        it("空の内容はエラー", () => {
            expect(() =>
                Memo.create({
                    id: "memo-4",
                    userId: "user-1",
                    stockCode: "7203",
                    content: "",
                })
            ).toThrow();
        });
    });

    describe("isOwnedBy", () => {
        it("所有者の場合はtrue", () => {
            const memo = createTestMemo();
            expect(memo.isOwnedBy("user-1")).toBe(true);
        });

        it("所有者でない場合はfalse", () => {
            const memo = createTestMemo();
            expect(memo.isOwnedBy("user-2")).toBe(false);
        });
    });

    describe("canBeViewedBy", () => {
        it("公開メモは誰でも閲覧可能", () => {
            const memo = createTestMemo();
            memo.publish();

            expect(memo.canBeViewedBy("user-1")).toBe(true);
            expect(memo.canBeViewedBy("user-2")).toBe(true);
            expect(memo.canBeViewedBy(null)).toBe(true);
        });

        it("非公開メモは所有者のみ閲覧可能", () => {
            const memo = createTestMemo();

            expect(memo.canBeViewedBy("user-1")).toBe(true);
            expect(memo.canBeViewedBy("user-2")).toBe(false);
            expect(memo.canBeViewedBy(null)).toBe(false);
        });
    });

    describe("pin/unpin", () => {
        it("ピン留めできる", () => {
            const memo = createTestMemo();
            expect(memo.pinned).toBe(false);

            memo.pin();
            expect(memo.pinned).toBe(true);
        });

        it("ピン留めを解除できる", () => {
            const memo = createTestMemo();
            memo.pin();
            memo.unpin();

            expect(memo.pinned).toBe(false);
        });

        it("ピン留め状態を切り替えられる", () => {
            const memo = createTestMemo();
            expect(memo.pinned).toBe(false);

            memo.togglePin();
            expect(memo.pinned).toBe(true);

            memo.togglePin();
            expect(memo.pinned).toBe(false);
        });
    });

    describe("publish/unpublish", () => {
        it("公開できる", () => {
            const memo = createTestMemo();
            expect(memo.visibility.isPrivate).toBe(true);

            memo.publish();
            expect(memo.visibility.isPublic).toBe(true);
        });

        it("非公開にできる", () => {
            const memo = createTestMemo();
            memo.publish();
            memo.unpublish();

            expect(memo.visibility.isPrivate).toBe(true);
        });
    });

    describe("updateContent", () => {
        it("内容を更新できる", () => {
            const memo = createTestMemo();
            const originalUpdatedAt = memo.updatedAt;

            // 少し待ってから更新（updatedAtの変化を確認するため）
            memo.updateContent("新しい内容");

            expect(memo.content.value).toBe("新しい内容");
            expect(memo.updatedAt.getTime()).toBeGreaterThanOrEqual(
                originalUpdatedAt.getTime()
            );
        });

        it("空の内容はエラー", () => {
            const memo = createTestMemo();
            expect(() => memo.updateContent("")).toThrow();
        });
    });

    describe("updateTags", () => {
        it("タグを更新できる", () => {
            const memo = createTestMemo();
            memo.updateTags(["新タグ1", "新タグ2", "新タグ3"]);

            expect(memo.tags).toEqual(["新タグ1", "新タグ2", "新タグ3"]);
        });

        it("11個以上のタグはエラー", () => {
            const memo = createTestMemo();
            expect(() => memo.updateTags(Array(11).fill("タグ"))).toThrow(
                "タグは最大10個までです"
            );
        });
    });

    describe("toPrimitive", () => {
        it("プリミティブなオブジェクトに変換できる", () => {
            const memo = createTestMemo();
            const primitive = memo.toPrimitive();

            expect(primitive.id).toBe("memo-1");
            expect(primitive.stockCode).toBe("7203");
            expect(primitive.content).toBe("テスト内容");
            expect(primitive.visibility).toBe("private");
        });
    });
});
