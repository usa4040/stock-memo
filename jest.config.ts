import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // next.config.js と .env ファイルを読み込むためのNext.jsアプリのパス
    dir: "./",
});

const config: Config = {
    // テスト環境
    testEnvironment: "jsdom",

    // セットアップファイル
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

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
        "!**/*.d.ts",
        "!**/node_modules/**",
    ],

    // モジュールエイリアス
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
};

export default createJestConfig(config);
