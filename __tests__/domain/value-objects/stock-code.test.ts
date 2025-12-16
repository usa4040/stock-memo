import { StockCode } from "@/domain/value-objects/stock-code";

describe("StockCode", () => {
    describe("create", () => {
        it("4桁の数字で銘柄コードを作成できる", () => {
            const stockCode = StockCode.create("7203");
            expect(stockCode.value).toBe("7203");
        });

        it("3桁の数字は拒否される", () => {
            expect(() => StockCode.create("720")).toThrow(
                "銘柄コードは4桁の数字で入力してください"
            );
        });

        it("5桁の数字は拒否される", () => {
            expect(() => StockCode.create("72031")).toThrow();
        });

        it("文字を含むコードは拒否される", () => {
            expect(() => StockCode.create("720A")).toThrow();
        });

        it("空文字は拒否される", () => {
            expect(() => StockCode.create("")).toThrow();
        });
    });

    describe("isValid", () => {
        it("4桁の数字はtrue", () => {
            expect(StockCode.isValid("7203")).toBe(true);
            expect(StockCode.isValid("9984")).toBe(true);
            expect(StockCode.isValid("0001")).toBe(true);
        });

        it("不正な形式はfalse", () => {
            expect(StockCode.isValid("720")).toBe(false);
            expect(StockCode.isValid("72031")).toBe(false);
            expect(StockCode.isValid("AAAA")).toBe(false);
            expect(StockCode.isValid("")).toBe(false);
        });
    });

    describe("equals", () => {
        it("同じ値のStockCodeは等しい", () => {
            const code1 = StockCode.create("7203");
            const code2 = StockCode.create("7203");
            expect(code1.equals(code2)).toBe(true);
        });

        it("異なる値のStockCodeは等しくない", () => {
            const code1 = StockCode.create("7203");
            const code2 = StockCode.create("9984");
            expect(code1.equals(code2)).toBe(false);
        });
    });

    describe("reconstruct", () => {
        it("バリデーションなしで復元できる", () => {
            const stockCode = StockCode.reconstruct("7203");
            expect(stockCode.value).toBe("7203");
        });
    });
});
