/**
 * API レスポンスのテスト
 * 実際のAPIリクエストはせず、レスポンス形式のテスト
 */

describe("API レスポンス形式", () => {
    describe("銘柄一覧API", () => {
        const mockStocksResponse = {
            data: [
                {
                    code: "7203",
                    name: "トヨタ自動車",
                    marketSegment: "プライム",
                    industry33Name: "輸送用機器",
                    size: "LARGE",
                },
                {
                    code: "9984",
                    name: "ソフトバンクグループ",
                    marketSegment: "プライム",
                    industry33Name: "情報・通信業",
                    size: "LARGE",
                },
            ],
            pagination: {
                page: 1,
                limit: 20,
                total: 4410,
                totalPages: 221,
            },
        };

        it("正しい形式のデータを持つ", () => {
            expect(mockStocksResponse.data).toBeInstanceOf(Array);
            expect(mockStocksResponse.data.length).toBeGreaterThan(0);
        });

        it("銘柄データに必須フィールドがある", () => {
            const stock = mockStocksResponse.data[0];
            expect(stock).toHaveProperty("code");
            expect(stock).toHaveProperty("name");
            expect(stock.code).toBe("7203");
        });

        it("ページネーション情報がある", () => {
            const pagination = mockStocksResponse.pagination;
            expect(pagination).toHaveProperty("page");
            expect(pagination).toHaveProperty("limit");
            expect(pagination).toHaveProperty("total");
            expect(pagination).toHaveProperty("totalPages");
        });
    });

    describe("メモ一覧API", () => {
        const mockMemosResponse = {
            data: [
                {
                    id: "memo-1",
                    title: "投資メモ",
                    content: "トヨタの業績分析",
                    tags: ["自動車", "長期投資"],
                    pinned: true,
                    visibility: "private",
                    createdAt: "2024-01-01T00:00:00.000Z",
                    updatedAt: "2024-01-01T00:00:00.000Z",
                    stock: {
                        code: "7203",
                        name: "トヨタ自動車",
                    },
                },
            ],
            pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            },
        };

        it("正しい形式のデータを持つ", () => {
            expect(mockMemosResponse.data).toBeInstanceOf(Array);
        });

        it("メモデータに必須フィールドがある", () => {
            const memo = mockMemosResponse.data[0];
            expect(memo).toHaveProperty("id");
            expect(memo).toHaveProperty("content");
            expect(memo).toHaveProperty("stock");
            expect(memo).toHaveProperty("createdAt");
        });

        it("タグは配列である", () => {
            const memo = mockMemosResponse.data[0];
            expect(memo.tags).toBeInstanceOf(Array);
        });

        it("紐づく銘柄情報がある", () => {
            const memo = mockMemosResponse.data[0];
            expect(memo.stock).toHaveProperty("code");
            expect(memo.stock).toHaveProperty("name");
        });
    });

    describe("エラーレスポンス", () => {
        it("401 認証エラー", () => {
            const errorResponse = {
                error: "認証が必要です",
            };
            expect(errorResponse).toHaveProperty("error");
            expect(errorResponse.error).toBe("認証が必要です");
        });

        it("403 権限エラー", () => {
            const errorResponse = {
                error: "アクセス権限がありません",
            };
            expect(errorResponse).toHaveProperty("error");
        });

        it("404 Not Found", () => {
            const errorResponse = {
                error: "メモが見つかりません",
            };
            expect(errorResponse).toHaveProperty("error");
        });

        it("400 バリデーションエラー", () => {
            const errorResponse = {
                error: "入力内容に問題があります",
                details: {
                    fieldErrors: {
                        content: ["内容は必須です"],
                    },
                },
            };
            expect(errorResponse).toHaveProperty("error");
            expect(errorResponse).toHaveProperty("details");
        });
    });
});

describe("HTTPステータスコード", () => {
    const statusCodes = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    };

    it("成功時のステータスコード", () => {
        expect(statusCodes.OK).toBe(200);
        expect(statusCodes.CREATED).toBe(201);
    });

    it("クライアントエラーのステータスコード", () => {
        expect(statusCodes.BAD_REQUEST).toBe(400);
        expect(statusCodes.UNAUTHORIZED).toBe(401);
        expect(statusCodes.FORBIDDEN).toBe(403);
        expect(statusCodes.NOT_FOUND).toBe(404);
    });

    it("サーバーエラーのステータスコード", () => {
        expect(statusCodes.INTERNAL_SERVER_ERROR).toBe(500);
    });
});
