/**
 * ダッシュボードAPIルート統合テスト
 * 
 * /api/dashboard のエンドポイントをテストします。
 * 
 * @jest-environment node
 */

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
import { GET } from "@/app/api/dashboard/route";

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// テスト用データ
const TEST_USER_ID = "test-dashboard-user";
const TEST_USER_EMAIL = "test-dashboard@example.com";

// テスト全体のタイムアウトを30秒に設定
jest.setTimeout(30000);

describe("Dashboard API Routes", () => {
    let testUserId: string;

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
                    name: "Test Dashboard User",
                },
            });
        }
        testUserId = user.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/dashboard", () => {
        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const response = await GET();

            expect(response.status).toBe(401);
            const body = await response.json();
            expect(body.error).toBe("認証が必要です");
        });

        it("認証ありでダッシュボードデータを取得できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const response = await GET();

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty("statistics");
            expect(body).toHaveProperty("pinnedMemos");
            expect(body).toHaveProperty("recentMemos");
            expect(body).toHaveProperty("topTags");
        });

        it("統計情報に必須フィールドがある", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const response = await GET();

            expect(response.status).toBe(200);
            const body = await response.json();

            expect(body.statistics).toHaveProperty("totalMemos");
            expect(body.statistics).toHaveProperty("totalStocks");
            expect(body.statistics).toHaveProperty("totalTags");
            expect(body.statistics).toHaveProperty("pinnedMemos");
        });

        it("pinnedMemosとrecentMemosは配列である", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const response = await GET();

            expect(response.status).toBe(200);
            const body = await response.json();

            expect(Array.isArray(body.pinnedMemos)).toBe(true);
            expect(Array.isArray(body.recentMemos)).toBe(true);
            expect(Array.isArray(body.topTags)).toBe(true);
        });
    });
});
