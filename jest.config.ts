import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // next.config.js と .env ファイルを読み込むためのNext.jsアプリのパス
    dir: "./",
});

// ベース設定（Next.jsの変換設定を含む）
const baseConfig: Config = {
    // セットアップファイル
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    // テスト環境
    testEnvironment: "jsdom",

    // テストファイルのパターン（統合テスト・E2Eテストを除外）
    testPathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/integration/",
        "/__tests__/factories/",
        "/__tests__/helpers/",
        "/e2e/",
    ],

    // テストファイルのパターン
    testMatch: [
        "**/__tests__/**/*.(test|spec).(ts|tsx)",
        "**/*.(test|spec).(ts|tsx)",
    ],

    // カバレッジ設定
    collectCoverageFrom: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "domain/**/*.{ts,tsx}",
        "application/**/*.{ts,tsx}",
        "infrastructure/**/*.{ts,tsx}",
        "!**/*.d.ts",
        "!**/node_modules/**",
    ],

    // モジュールエイリアス
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
};

export default createJestConfig(baseConfig);
