/**
 * ウォッチリストAPIルート統合テスト
 * 
 * /api/watchlist のエンドポイントをテストします。
 * 
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// getServerSession をモック
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// authOptions をモック
jest.mock("@/lib/auth", () => ({
    authOptions: {},
}));

import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/watchlist/route";

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// テスト用データ
const TEST_USER_ID = "test-watchlist-user";
const TEST_USER_EMAIL = "test-watchlist@example.com";
const TEST_STOCK_CODE = "7203"; // トヨタ自動車

describe("Watchlist API Routes", () => {
    let testUserId: string;
    const createdWatchlistIds: string[] = [];

    beforeAll(async () => {
        // テスト用ユーザーを作成または取得
        let user = await prisma.user.findUnique({
            where: { email: TEST_USER_EMAIL },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: TEST_USER_ID,
                    email: TEST_USER_EMAIL,
                    name: "Test Watchlist User",
                },
            });
        }
        testUserId = user.id;
    });

    afterAll(async () => {
        // テストで作成したウォッチリストをクリーンアップ
        if (createdWatchlistIds.length > 0) {
            await prisma.watchlistItem.deleteMany({
                where: { id: { in: createdWatchlistIds } },
            });
        }
        // このテストで追加した可能性のあるアイテムもクリーンアップ
        await prisma.watchlistItem.deleteMany({
            where: {
                userId: testUserId,
                stockCode: TEST_STOCK_CODE,
            },
        });
        await prisma.$disconnect();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/watchlist", () => {
        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const response = await GET();

            expect(response.status).toBe(401);
            const body = await response.json();
            expect(body.error).toBe("認証が必要です");
        });

        it("認証ありでウォッチリストを取得できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const response = await GET();

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty("data");
            expect(body).toHaveProperty("total");
            expect(Array.isArray(body.data)).toBe(true);
        });
    });

    describe("POST /api/watchlist", () => {
        // 各テスト前にクリーンアップ
        beforeEach(async () => {
            await prisma.watchlistItem.deleteMany({
                where: {
                    userId: testUserId,
                    stockCode: TEST_STOCK_CODE,
                },
            });
        });

        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const request = new NextRequest("http://localhost:3000/api/watchlist", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: TEST_STOCK_CODE,
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it("認証ありでウォッチリストに追加できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/watchlist", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: TEST_STOCK_CODE,
                    note: "テストノート",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(201);
            const body = await response.json();
            expect(body.stockCode).toBe(TEST_STOCK_CODE);
            expect(body).toHaveProperty("stockName");

            // クリーンアップ用にIDを保存
            createdWatchlistIds.push(body.id);
        });

        it("存在しない銘柄コードで400を返す", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/watchlist", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: "9999",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
        });
    });
});
