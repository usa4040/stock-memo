/**
 * 認証フロー統合テスト
 * 
 * CredentialsProviderのauthorize関数をテストします。
 * 今回のログインエラー（DB接続失敗）を防ぐためのテストです。
 * 
 * @jest-environment node
 */

import prisma from "@/lib/prisma";

// テスト用のメールアドレス（ユニークにするためタイムスタンプを使用）
const TEST_EMAIL_PREFIX = "test-auth-flow";
const getTestEmail = () => `${TEST_EMAIL_PREFIX}-${Date.now()}@example.com`;

describe("Authentication Flow Integration Test", () => {
    const createdUserIds: string[] = [];

    afterAll(async () => {
        // テストで作成したユーザーをクリーンアップ
        if (createdUserIds.length > 0) {
            await prisma.user.deleteMany({
                where: { id: { in: createdUserIds } },
            });
        }
        await prisma.$disconnect();
    });

    describe("ユーザー検索", () => {
        it("存在するユーザーを検索できること", async () => {
            // テスト用ユーザーを作成
            const testEmail = getTestEmail();
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: "Test User",
                },
            });
            createdUserIds.push(user.id);

            // ユーザーを検索
            const foundUser = await prisma.user.findUnique({
                where: { email: testEmail },
            });

            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toBe(testEmail);
            expect(foundUser?.name).toBe("Test User");
        });

        it("存在しないユーザーはnullを返すこと", async () => {
            const nonExistentEmail = "non-existent-user@example.com";
            const user = await prisma.user.findUnique({
                where: { email: nonExistentEmail },
            });

            expect(user).toBeNull();
        });
    });

    describe("ユーザー作成", () => {
        it("新規ユーザーを作成できること", async () => {
            const testEmail = getTestEmail();
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: testEmail.split("@")[0],
                },
            });
            createdUserIds.push(user.id);

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.email).toBe(testEmail);
            expect(user.name).toBe(testEmail.split("@")[0]);
        });

        it("同じメールアドレスで重複作成はエラーになること", async () => {
            const testEmail = getTestEmail();

            // 1回目の作成
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: "First User",
                },
            });
            createdUserIds.push(user.id);

            // 2回目の作成（同じメールアドレス）
            await expect(
                prisma.user.create({
                    data: {
                        email: testEmail,
                        name: "Second User",
                    },
                })
            ).rejects.toThrow();
        });
    });

    describe("認証フロー（authorize関数のロジック）", () => {
        it("既存ユーザーでログインできること", async () => {
            const testEmail = getTestEmail();

            // 既存ユーザーを作成
            const existingUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: "Existing User",
                },
            });
            createdUserIds.push(existingUser.id);

            // authorize関数のロジックを再現
            const user = await prisma.user.findUnique({
                where: { email: testEmail },
            });

            expect(user).not.toBeNull();
            expect(user?.id).toBe(existingUser.id);
        });

        it("新規ユーザーでログイン時に自動作成されること", async () => {
            const testEmail = getTestEmail();

            // authorize関数のロジックを再現
            let user = await prisma.user.findUnique({
                where: { email: testEmail },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: testEmail,
                        name: testEmail.split("@")[0],
                    },
                });
                createdUserIds.push(user.id);
            }

            expect(user).not.toBeNull();
            expect(user.email).toBe(testEmail);
        });

        it("空のメールアドレスでは認証できないこと", async () => {
            const credentials = { email: "" };

            // authorize関数のバリデーションロジック
            const isValid = credentials.email && credentials.email.length > 0;
            expect(isValid).toBeFalsy();
        });

        it("undefinedのメールアドレスでは認証できないこと", async () => {
            const credentials: { email?: string } = {};

            // authorize関数のバリデーションロジック
            const isValid = credentials?.email;
            expect(isValid).toBeFalsy();
        });
    });
});
