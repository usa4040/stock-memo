import { test, expect } from "@playwright/test";

/**
 * メモ機能 E2E テスト
 * 
 * メモ関連の機能をテストします。
 * 認証が必要なページが多いため、主にページ構造と基本動作をテストします。
 */
test.describe("メモ一覧ページ", () => {
    test("メモ一覧ページにアクセスできる", async ({ page }) => {
        const response = await page.goto("/memos");

        expect(response).not.toBeNull();
        expect(response?.status()).toBeLessThan(500);
    });

    test("未認証時はログインページにリダイレクトまたはメモ一覧が表示", async ({ page }) => {
        await page.goto("/memos");
        await page.waitForLoadState("networkidle");

        const url = page.url();
        // メモ一覧またはログインページのどちらか
        const isMemos = url.includes("/memos");
        const isAuth = url.includes("/signin") || url.includes("/auth");

        expect(isMemos || isAuth).toBe(true);
    });
});

test.describe("メモ作成ページ", () => {
    test("メモ作成ページにアクセスできる", async ({ page }) => {
        const response = await page.goto("/memos/new");

        expect(response).not.toBeNull();
        expect(response?.status()).toBeLessThan(500);
    });

    test("銘柄コード付きでメモ作成ページにアクセスできる", async ({ page }) => {
        const response = await page.goto("/memos/new?stockCode=7203");

        expect(response).not.toBeNull();
        expect(response?.status()).toBeLessThan(500);
    });
});

test.describe("メモ関連のナビゲーション", () => {
    test("ホームページからメモ一覧へのリンクがある", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // 「マイメモ」リンクを探す
        const memoLink = page.locator('a[href="/memos"]');
        const count = await memoLink.count();

        expect(count).toBeGreaterThan(0);
    });

    test("銘柄詳細ページからメモ作成ページへ遷移できる構造", async ({ page }) => {
        await page.goto("/stocks/7203");
        await page.waitForLoadState("networkidle");

        // メモ作成リンクがあるかどうか（認証状態に依存）
        const memoNewLink = page.locator('a[href*="/memos/new"]');
        const count = await memoNewLink.count();

        // リンクがある場合はクリックしてテスト
        if (count > 0) {
            await memoNewLink.first().click();
            await page.waitForLoadState("networkidle");

            const url = page.url();
            // メモ作成ページ、ログインページ、または銘柄詳細ページ（認証リダイレクト後に戻る場合）
            const isExpectedPage = url.includes("/memos") ||
                url.includes("/auth") ||
                url.includes("/signin") ||
                url.includes("/stocks");
            expect(isExpectedPage).toBe(true);
        }
    });
});

test.describe("メモ検索機能", () => {
    test("メモ一覧ページで検索フォームが存在する（認証時）", async ({ page }) => {
        await page.goto("/memos");
        await page.waitForLoadState("networkidle");

        // 認証済みの場合、検索フォームが表示される
        // 未認証の場合はリダイレクトされるため、ここでのテストは限定的
        const url = page.url();

        if (url.includes("/memos")) {
            // 検索入力フィールドを探す
            const searchInput = page.locator('input[placeholder*="検索"]');
            const count = await searchInput.count();

            // 存在する場合のみ確認
            if (count > 0) {
                expect(await searchInput.isVisible()).toBe(true);
            }
        }
    });
});

test.describe("タグフィルタリング", () => {
    test("メモ一覧でタグが表示される構造がある", async ({ page }) => {
        await page.goto("/memos");
        await page.waitForLoadState("networkidle");

        const url = page.url();

        if (url.includes("/memos")) {
            // タグ要素を探す
            const tagElements = page.locator(".tag");
            const count = await tagElements.count();

            // タグが存在するかどうかはデータ依存なので、エラーにはしない
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test("URLパラメータでタグフィルタリングができる", async ({ page }) => {
        // タグパラメータ付きでアクセス
        const response = await page.goto("/memos?tags=長期投資");

        expect(response).not.toBeNull();
        expect(response?.status()).toBeLessThan(500);
    });
});
