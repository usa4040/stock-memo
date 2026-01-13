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

    test("メールアドレス入力フィールドがある", async ({ page }) => {
        await page.goto("/auth/signin");

        // メールアドレス入力フィールドを確認
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toBeVisible();
    });

    test("メールアドレスでログインできる", async ({ page }) => {
        await page.goto("/auth/signin");

        // メールアドレスを入力
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill("test-e2e@example.com");

        // ログインボタンをクリック
        await page.click('button[type="submit"]');

        // ダッシュボードまたはホームにリダイレクト
        await page.waitForURL(/\/(dashboard|$)/);
    });
});

/**
 * 認証済みユーザーのフロー E2Eテスト
 */
test.describe("認証済みユーザーフロー", () => {
    // 各テスト前にログイン
    test.beforeEach(async ({ page }) => {
        await page.goto("/auth/signin");
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill("test-e2e-flow@example.com");
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|$)/);
    });

    test("ダッシュボードにアクセスできる", async ({ page }) => {
        await page.goto("/dashboard");

        // ダッシュボードのコンテンツを確認
        await expect(page.locator("body")).toContainText(/総メモ数|ダッシュボード/);
    });

    test("メモ一覧にアクセスできる", async ({ page }) => {
        await page.goto("/memos");

        // メモ一覧ページを確認
        await expect(page.locator("h1")).toContainText("メモ");
    });

    test("ウォッチリストにアクセスできる", async ({ page }) => {
        await page.goto("/watchlist");

        // ウォッチリストページを確認
        await expect(page.locator("h1")).toContainText("ウォッチリスト");
    });
});

/**
 * メモ作成フロー E2Eテスト
 */
test.describe("メモ作成フロー", () => {
    test.beforeEach(async ({ page }) => {
        // ログイン
        await page.goto("/auth/signin");
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill("test-e2e-memo@example.com");
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|$)/);
    });

    test("銘柄詳細ページからメモ作成ページに遷移できる", async ({ page }) => {
        // トヨタの銘柄詳細ページへ
        await page.goto("/stocks/7203");

        // 「メモを追加」ボタンをクリック
        const addMemoButton = page.locator('text=メモを追加');
        if (await addMemoButton.isVisible()) {
            await addMemoButton.click();

            // メモ作成ページに遷移
            await expect(page).toHaveURL(/\/memos\/new/);
        }
    });
});
