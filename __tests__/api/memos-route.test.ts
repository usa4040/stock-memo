/**
 * メモAPIルート統合テスト
 * 
 * /api/memos および /api/memos/[id] のエンドポイントをテストします。
 * 
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// モックデータ
const TEST_USER_ID = "test-api-user";
const TEST_USER_EMAIL = "test-api@example.com";
const TEST_STOCK_CODE = "7203"; // トヨタ自動車

// getServerSession をモック
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// authOptions をモック
jest.mock("@/lib/auth", () => ({
    authOptions: {},
}));

import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/memos/route";
import {
    GET as GET_BY_ID,
    PATCH,
    DELETE
} from "@/app/api/memos/[id]/route";

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe("Memos API Routes", () => {
    const createdMemoIds: string[] = [];
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
                    name: "Test API User",
                },
            });
        }
        testUserId = user.id;
    });

    afterAll(async () => {
        // テストで作成したメモをクリーンアップ
        if (createdMemoIds.length > 0) {
            await prisma.memo.deleteMany({
                where: { id: { in: createdMemoIds } },
            });
        }
        await prisma.$disconnect();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/memos", () => {
        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const request = new NextRequest("http://localhost:3000/api/memos");
            const response = await GET(request);

            expect(response.status).toBe(401);
            const body = await response.json();
            expect(body.error).toBe("認証が必要です");
        });

        it("認証ありでメモ一覧を取得できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty("data");
            expect(body).toHaveProperty("pagination");
            expect(Array.isArray(body.data)).toBe(true);
        });

        it("ページネーションパラメータが適用される", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos?page=1&limit=5");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.pagination.page).toBe(1);
            expect(body.pagination.limit).toBe(5);
        });
    });

    describe("POST /api/memos", () => {
        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const request = new NextRequest("http://localhost:3000/api/memos", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: TEST_STOCK_CODE,
                    content: "テストメモ",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it("認証ありでメモを作成できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: TEST_STOCK_CODE,
                    content: "APIテストで作成したメモ",
                    title: "テストタイトル",
                    tags: ["テスト"],
                    visibility: "private",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(201);
            const body = await response.json();
            expect(body.content).toBe("APIテストで作成したメモ");
            expect(body.stock.code).toBe(TEST_STOCK_CODE);

            // クリーンアップ用にIDを保存
            createdMemoIds.push(body.id);
        });

        it("存在しない銘柄コードで404を返す", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: "9999",
                    content: "存在しない銘柄",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(404);
        });

        it("空のコンテンツで400を返す", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos", {
                method: "POST",
                body: JSON.stringify({
                    stockCode: TEST_STOCK_CODE,
                    content: "",
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/memos/[id]", () => {
        let testMemoId: string;

        beforeAll(async () => {
            // テスト用メモを作成
            const memo = await prisma.memo.create({
                data: {
                    userId: testUserId,
                    stockCode: TEST_STOCK_CODE,
                    content: "GET詳細テスト用メモ",
                    visibility: "private",
                },
            });
            testMemoId = memo.id;
            createdMemoIds.push(testMemoId);
        });

        it("自分のメモを取得できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest(`http://localhost:3000/api/memos/${testMemoId}`);
            const response = await GET_BY_ID(request, { params: Promise.resolve({ id: testMemoId }) });

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.id).toBe(testMemoId);
        });

        it("存在しないメモで404を返す", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos/non-existent-id");
            const response = await GET_BY_ID(request, { params: Promise.resolve({ id: "non-existent-id" }) });

            expect(response.status).toBe(404);
        });
    });

    describe("PATCH /api/memos/[id]", () => {
        let testMemoId: string;

        beforeAll(async () => {
            // テスト用メモを作成
            const memo = await prisma.memo.create({
                data: {
                    userId: testUserId,
                    stockCode: TEST_STOCK_CODE,
                    content: "PATCH更新テスト用メモ",
                    visibility: "private",
                },
            });
            testMemoId = memo.id;
            createdMemoIds.push(testMemoId);
        });

        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/memos/${testMemoId}`, {
                method: "PATCH",
                body: JSON.stringify({ content: "更新後" }),
            });
            const response = await PATCH(request, { params: Promise.resolve({ id: testMemoId }) });

            expect(response.status).toBe(401);
        });

        it("自分のメモを更新できる", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest(`http://localhost:3000/api/memos/${testMemoId}`, {
                method: "PATCH",
                body: JSON.stringify({ content: "更新されたコンテンツ" }),
            });
            const response = await PATCH(request, { params: Promise.resolve({ id: testMemoId }) });

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.content).toBe("更新されたコンテンツ");
        });
    });

    describe("DELETE /api/memos/[id]", () => {
        it("認証なしで401を返す", async () => {
            mockGetServerSession.mockResolvedValue(null);

            const request = new NextRequest("http://localhost:3000/api/memos/some-id", {
                method: "DELETE",
            });
            const response = await DELETE(request, { params: Promise.resolve({ id: "some-id" }) });

            expect(response.status).toBe(401);
        });

        it("自分のメモを削除できる", async () => {
            // 削除用メモを作成
            const memo = await prisma.memo.create({
                data: {
                    userId: testUserId,
                    stockCode: TEST_STOCK_CODE,
                    content: "削除テスト用メモ",
                    visibility: "private",
                },
            });

            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest(`http://localhost:3000/api/memos/${memo.id}`, {
                method: "DELETE",
            });
            const response = await DELETE(request, { params: Promise.resolve({ id: memo.id }) });

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.message).toBe("メモを削除しました");

            // 削除されていることを確認
            const deletedMemo = await prisma.memo.findUnique({
                where: { id: memo.id },
            });
            expect(deletedMemo).toBeNull();
        });

        it("存在しないメモで404を返す", async () => {
            mockGetServerSession.mockResolvedValue({
                user: { id: testUserId, email: TEST_USER_EMAIL },
                expires: new Date(Date.now() + 86400000).toISOString(),
            });

            const request = new NextRequest("http://localhost:3000/api/memos/non-existent-id", {
                method: "DELETE",
            });
            const response = await DELETE(request, { params: Promise.resolve({ id: "non-existent-id" }) });

            expect(response.status).toBe(404);
        });
    });
});
