import { test, expect } from "@playwright/test";

/**
 * ホームページ E2Eテスト
 */
test.describe("ホームページ", () => {
    test("ホームページが表示される", async ({ page }) => {
        await page.goto("/");

        // タイトルを確認
        await expect(page).toHaveTitle(/株メモ/);

        // メインタイトルが表示される
        await expect(page.locator("h1")).toContainText("株メモ");
    });

    test("銘柄を探すボタンが機能する", async ({ page }) => {
        await page.goto("/");

        // 「銘柄を探す」ボタンをクリック
        await page.click('text=銘柄を探す');

        // 銘柄一覧ページに遷移
        await expect(page).toHaveURL(/\/stocks/);
    });

    test("ログインボタンが表示される", async ({ page }) => {
        await page.goto("/");

        // ヘッダーにログインリンクがある
        await expect(page.locator("header")).toContainText("ログイン");
    });
});

/**
 * 銘柄一覧ページ E2Eテスト
 */
test.describe("銘柄一覧ページ", () => {
    test("銘柄一覧が表示される", async ({ page }) => {
        await page.goto("/stocks");

        // ページタイトルを確認
        await expect(page.locator("h1")).toContainText("銘柄");

        // 銘柄データが読み込まれるまで待機
        await page.waitForLoadState("networkidle");
    });

    test("銘柄を検索できる", async ({ page }) => {
        await page.goto("/stocks");

        // 検索ボックスに入力
        const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill("トヨタ");
            await searchInput.press("Enter");

            // 検索結果を待機
            await page.waitForLoadState("networkidle");
        }
    });
});

/**
 * ログインページ E2Eテスト
 */
test.describe("ログインページ", () => {
    test("ログインページが表示される", async ({ page }) => {
        await page.goto("/auth/signin");

        // ログインフォームが表示される
        await expect(page.locator("h1")).toContainText("ログイン");
    });

    test("Googleログインボタンが表示される", async ({ page }) => {
        await page.goto("/auth/signin");

        // Googleログインボタンを確認
        await expect(page.locator('text=Googleでログイン')).toBeVisible();
    });
});

/**
 * 銘柄詳細ページ E2Eテスト
 */
test.describe("銘柄詳細ページ", () => {
    test("銘柄詳細ページが表示される", async ({ page }) => {
        // トヨタの銘柄詳細ページへ
        await page.goto("/stocks/7203");

        // ページが読み込まれるまで待機
        await page.waitForLoadState("networkidle");

        // 銘柄コードまたは銘柄名が表示される
        await expect(page.locator("body")).toContainText(/7203|トヨタ/);
    });
});
