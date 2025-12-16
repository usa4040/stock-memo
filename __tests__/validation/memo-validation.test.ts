import { z } from "zod";

/**
 * メモ作成のバリデーションスキーマ（APIと同じ）
 */
const createMemoSchema = z.object({
    stockCode: z.string().length(4, "銘柄コードは4桁で入力してください"),
    title: z.string().max(200, "タイトルは200文字以内で入力してください").optional(),
    content: z.string().min(1, "内容は必須です").max(10000, "内容は10000文字以内で入力してください"),
    tags: z.array(z.string()).max(10, "タグは最大10個までです").optional(),
    visibility: z.enum(["private", "public"]).default("private"),
});

/**
 * メモ更新のバリデーションスキーマ
 */
const updateMemoSchema = z.object({
    title: z.string().max(200, "タイトルは200文字以内で入力してください").optional(),
    content: z.string().min(1, "内容は必須です").max(10000, "内容は10000文字以内で入力してください").optional(),
    tags: z.array(z.string()).max(10, "タグは最大10個までです").optional(),
    pinned: z.boolean().optional(),
    visibility: z.enum(["private", "public"]).optional(),
});

describe("メモ作成バリデーション", () => {
    describe("stockCode", () => {
        it("4桁の銘柄コードは有効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
            });
            expect(result.success).toBe(true);
        });

        it("3桁の銘柄コードは無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "720",
                content: "テスト内容",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("銘柄コードは4桁で入力してください");
            }
        });

        it("5桁の銘柄コードは無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "72031",
                content: "テスト内容",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("content", () => {
        it("内容が空の場合は無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("内容は必須です");
            }
        });

        it("10000文字以内の内容は有効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "a".repeat(10000),
            });
            expect(result.success).toBe(true);
        });

        it("10001文字以上の内容は無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "a".repeat(10001),
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("内容は10000文字以内で入力してください");
            }
        });
    });

    describe("title", () => {
        it("タイトルは省略可能", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
            });
            expect(result.success).toBe(true);
        });

        it("200文字以内のタイトルは有効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                title: "a".repeat(200),
            });
            expect(result.success).toBe(true);
        });

        it("201文字以上のタイトルは無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                title: "a".repeat(201),
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("タイトルは200文字以内で入力してください");
            }
        });
    });

    describe("tags", () => {
        it("タグは省略可能", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
            });
            expect(result.success).toBe(true);
        });

        it("10個以内のタグは有効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                tags: ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5", "タグ6", "タグ7", "タグ8", "タグ9", "タグ10"],
            });
            expect(result.success).toBe(true);
        });

        it("11個以上のタグは無効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                tags: Array(11).fill("タグ"),
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("タグは最大10個までです");
            }
        });
    });

    describe("visibility", () => {
        it("デフォルト値はprivate", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.visibility).toBe("private");
            }
        });

        it("publicは有効", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                visibility: "public",
            });
            expect(result.success).toBe(true);
        });

        it("無効な値は拒否される", () => {
            const result = createMemoSchema.safeParse({
                stockCode: "7203",
                content: "テスト内容",
                visibility: "invalid",
            });
            expect(result.success).toBe(false);
        });
    });
});

describe("メモ更新バリデーション", () => {
    it("すべてのフィールドが省略可能", () => {
        const result = updateMemoSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("pinnedフラグを更新できる", () => {
        const result = updateMemoSchema.safeParse({
            pinned: true,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.pinned).toBe(true);
        }
    });

    it("visibilityを変更できる", () => {
        const result = updateMemoSchema.safeParse({
            visibility: "public",
        });
        expect(result.success).toBe(true);
    });

    it("複数フィールドを同時に更新できる", () => {
        const result = updateMemoSchema.safeParse({
            title: "新しいタイトル",
            content: "新しい内容",
            tags: ["タグ1", "タグ2"],
            pinned: true,
            visibility: "public",
        });
        expect(result.success).toBe(true);
    });
});
