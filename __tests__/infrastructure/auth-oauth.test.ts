/**
 * OAuth認証設定テスト
 * 
 * Google OAuthプロバイダーの設定を検証します。
 */

describe("OAuth Authentication Configuration", () => {
    describe("Google OAuth Provider", () => {
        it("Googleプロバイダーが設定されていること", async () => {
            const { authOptions } = await import("@/lib/auth");

            const hasGoogleProvider = authOptions.providers.some(
                (provider) => provider.id === "google"
            );
            expect(hasGoogleProvider).toBe(true);
        });

        it("プロバイダーの数が1つであること（Googleのみ）", async () => {
            const { authOptions } = await import("@/lib/auth");

            expect(authOptions.providers.length).toBe(1);
        });
    });

    describe("Session Configuration", () => {
        it("JWTセッション戦略が使用されている", async () => {
            const { authOptions } = await import("@/lib/auth");

            expect(authOptions.session?.strategy).toBe("jwt");
        });
    });
});
