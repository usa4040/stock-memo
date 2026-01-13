/**
 * 環境変数バリデーションテスト
 * 
 * 必須の環境変数が正しく設定されていることを確認します。
 * 今回のログインエラー（NEXTAUTH_SECRET未設定）を防ぐためのテストです。
 */

describe("Environment Variables Validation", () => {
    describe("データベース設定", () => {
        it("DATABASE_URLが設定されていること", () => {
            expect(process.env.DATABASE_URL).toBeDefined();
            expect(process.env.DATABASE_URL).not.toBe("");
        });

        it("DATABASE_URLが有効なPostgreSQL接続文字列であること", () => {
            const url = process.env.DATABASE_URL;
            expect(url).toMatch(/^postgresql:\/\//);
        });

        it("DATABASE_URLにホスト名が含まれていること", () => {
            const url = process.env.DATABASE_URL;
            // postgresql://user:pass@host:port/db の形式を確認
            expect(url).toMatch(/@[a-zA-Z0-9.-]+:/);
        });
    });

    describe("NextAuth設定", () => {
        it("NEXTAUTH_SECRETが設定されていること", () => {
            expect(process.env.NEXTAUTH_SECRET).toBeDefined();
            expect(process.env.NEXTAUTH_SECRET).not.toBe("");
        });

        it("NEXTAUTH_SECRETが十分な長さであること（32文字以上）", () => {
            const secret = process.env.NEXTAUTH_SECRET;
            if (secret) {
                expect(secret.length).toBeGreaterThanOrEqual(32);
            }
        });

        it("NEXTAUTH_URLが設定されていること", () => {
            expect(process.env.NEXTAUTH_URL).toBeDefined();
            expect(process.env.NEXTAUTH_URL).not.toBe("");
        });

        it("NEXTAUTH_URLが有効なURLであること", () => {
            const url = process.env.NEXTAUTH_URL;
            expect(url).toMatch(/^https?:\/\//);
        });
    });

    describe("設定の整合性", () => {
        it("本番環境では安全でないシークレットが使用されていないこと", () => {
            const secret = process.env.NEXTAUTH_SECRET;
            const nodeEnv = process.env.NODE_ENV;

            if (nodeEnv === "production") {
                // 本番環境では弱いシークレットを禁止
                expect(secret).not.toBe("your_nextauth_secret_here");
                expect(secret).not.toBe("secret");
                expect(secret).not.toBe("password");
            }
        });

        it("DATABASE_URLにプレースホルダーが残っていないこと", () => {
            const url = process.env.DATABASE_URL;
            expect(url).not.toContain("[YOUR-PASSWORD]");
            expect(url).not.toContain("[your-password]");
            expect(url).not.toContain("your_password_here");
        });
    });
});
