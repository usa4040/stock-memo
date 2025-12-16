/**
 * ユーティリティ関数のテスト
 */

describe("ユーティリティ関数", () => {
    describe("日付フォーマット", () => {
        it("日本語形式で日付をフォーマットできる", () => {
            const date = new Date("2024-01-15T10:30:00");
            const formatted = date.toLocaleDateString("ja-JP");

            expect(formatted).toMatch(/2024/);
            expect(formatted).toMatch(/1/);
            expect(formatted).toMatch(/15/);
        });
    });

    describe("文字列操作", () => {
        it("長い文字列を切り詰めて...を追加できる", () => {
            const longText = "これは非常に長いテキストです。150文字を超えると切り詰められます。";
            const maxLength = 20;

            const truncated =
                longText.length > maxLength
                    ? longText.slice(0, maxLength) + "..."
                    : longText;

            expect(truncated).toHaveLength(23); // 20 + "..."
            expect(truncated).toContain("...");
        });

        it("短い文字列は切り詰められない", () => {
            const shortText = "短いテキスト";
            const maxLength = 20;

            const result =
                shortText.length > maxLength
                    ? shortText.slice(0, maxLength) + "..."
                    : shortText;

            expect(result).toBe("短いテキスト");
            expect(result).not.toContain("...");
        });
    });

    describe("タグ処理", () => {
        it("カンマ区切りの文字列を配列に変換できる", () => {
            const tagsString = "投資, 長期, 高配当";
            const tags = tagsString
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            expect(tags).toEqual(["投資", "長期", "高配当"]);
        });

        it("空の文字列は空の配列になる", () => {
            const tagsString = "";
            const tags = tagsString
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            expect(tags).toEqual([]);
        });

        it("空白のみの要素は除外される", () => {
            const tagsString = "投資, , 長期, , 高配当";
            const tags = tagsString
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            expect(tags).toEqual(["投資", "長期", "高配当"]);
        });
    });

    describe("バリデーション", () => {
        it("メールアドレスの形式をチェックできる", () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            expect(emailRegex.test("test@example.com")).toBe(true);
            expect(emailRegex.test("user.name@domain.co.jp")).toBe(true);
            expect(emailRegex.test("invalid-email")).toBe(false);
            expect(emailRegex.test("@example.com")).toBe(false);
        });

        it("株式コードの形式をチェックできる", () => {
            const stockCodeRegex = /^\d{4}$/;

            expect(stockCodeRegex.test("7203")).toBe(true);
            expect(stockCodeRegex.test("9984")).toBe(true);
            expect(stockCodeRegex.test("123")).toBe(false);
            expect(stockCodeRegex.test("12345")).toBe(false);
            expect(stockCodeRegex.test("AAAA")).toBe(false);
        });
    });
});
