import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2Eテスト設定
 * 
 * 実行: npx playwright test
 * UIモード: npx playwright test --ui
 * レポート: npx playwright show-report
 */
export default defineConfig({
    // テストディレクトリ
    testDir: "./e2e",

    // 各テストのタイムアウト
    timeout: 30 * 1000,

    // 期待値のタイムアウト
    expect: {
        timeout: 5000,
    },

    // テスト失敗時のリトライ（CI時のみ）
    retries: process.env.CI ? 2 : 0,

    // 並列実行のワーカー数
    workers: process.env.CI ? 1 : undefined,

    // レポート設定
    reporter: [
        ["html", { open: "never" }],
        ["list"],
    ],

    // 共通設定
    use: {
        // ベースURL
        baseURL: "http://localhost:3000",

        // トレース（テスト失敗時のみ）
        trace: "on-first-retry",

        // スクリーンショット（テスト失敗時のみ）
        screenshot: "only-on-failure",
    },

    // テスト用のブラウザ設定
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        // 必要に応じて追加
        // {
        //     name: "firefox",
        //     use: { ...devices["Desktop Firefox"] },
        // },
        // {
        //     name: "webkit",
        //     use: { ...devices["Desktop Safari"] },
        // },
    ],

    // 開発サーバーの自動起動
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
