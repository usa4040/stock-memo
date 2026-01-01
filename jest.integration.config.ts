import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    dir: "./",
});

// 統合テスト用設定
const integrationConfig: Config = {
    displayName: "integration",

    // セットアップファイル
    setupFilesAfterEnv: ["<rootDir>/__tests__/setup.integration.ts"],

    // テスト環境（Node.js）
    testEnvironment: "node",

    // 統合テストのみをマッチ
    testMatch: ["**/__tests__/integration/**/*.(test|spec).(ts|tsx)"],

    // モジュールエイリアス
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
};

export default createJestConfig(integrationConfig);
