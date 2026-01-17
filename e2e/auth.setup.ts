import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "../.auth/user.json");

/**
 * 認証セットアップ
 * 
 * NextAuth.jsのセッションをモックするためのセットアップ。
 * テスト用のセッションCookieを設定し、認証済み状態をシミュレートします。
 */
setup("authenticate", async ({ page }) => {
    // .auth ディレクトリを作成
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // ホームページにアクセス
    await page.goto("/");

    // テスト用のセッションCookieを設定
    // NextAuth.jsはsecure Cookieを使用するため、httpOnlyとsecureを設定
    await page.context().addCookies([
        {
            name: "next-auth.session-token",
            value: "test-session-token-for-e2e",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false, // localhost では secure: false
            sameSite: "Lax",
        },
    ]);

    // ストレージ状態を保存
    await page.context().storageState({ path: authFile });
});
