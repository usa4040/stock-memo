/**
 * 銘柄APIルート統合テスト
 * 
 * /api/stocks のエンドポイントをテストします。
 * 
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { GET } from "@/app/api/stocks/route";

describe("Stocks API Routes", () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("GET /api/stocks", () => {
        it("銘柄一覧を取得できる", async () => {
            const request = new NextRequest("http://localhost:3000/api/stocks");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty("data");
            expect(body).toHaveProperty("pagination");
            expect(Array.isArray(body.data)).toBe(true);
        });

        it("ページネーションパラメータが適用される", async () => {
            const request = new NextRequest("http://localhost:3000/api/stocks?page=1&limit=5");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.pagination.page).toBe(1);
            expect(body.pagination.limit).toBe(5);
            expect(body.data.length).toBeLessThanOrEqual(5);
        });

        it("検索クエリで銘柄を検索できる", async () => {
            const request = new NextRequest("http://localhost:3000/api/stocks?q=トヨタ");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(Array.isArray(body.data)).toBe(true);
            // トヨタが検索結果に含まれることを確認（データが存在する場合）
            if (body.data.length > 0) {
                const hasMatch = body.data.some(
                    (stock: { name: string; code: string }) =>
                        stock.name.includes("トヨタ") || stock.code.includes("7203")
                );
                expect(hasMatch).toBe(true);
            }
        });

        it("銘柄コードで検索できる", async () => {
            const request = new NextRequest("http://localhost:3000/api/stocks?q=7203");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(Array.isArray(body.data)).toBe(true);
        });

        it("銘柄データに必須フィールドがある", async () => {
            const request = new NextRequest("http://localhost:3000/api/stocks?limit=1");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();

            if (body.data.length > 0) {
                const stock = body.data[0];
                expect(stock).toHaveProperty("code");
                expect(stock).toHaveProperty("name");
            }
        });
    });
});
