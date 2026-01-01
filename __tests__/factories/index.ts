/**
 * テストデータ Factory
 *
 * Laravel風のテストデータ生成パターン
 * 統合テストで使用
 */
import { PrismaClient } from "@prisma/client";

// ========================================
// User Factory
// ========================================

let userCounter = 0;

export const UserFactory = {
    /**
     * ユーザーを作成
     */
    create: async (
        prisma: PrismaClient,
        overrides: Partial<{
            id: string;
            email: string;
            name: string;
        }> = {}
    ) => {
        userCounter++;
        return prisma.user.create({
            data: {
                id: overrides.id ?? `test-user-${userCounter}`,
                email: overrides.email ?? `test${userCounter}@example.com`,
                name: overrides.name ?? `Test User ${userCounter}`,
            },
        });
    },
};

// ========================================
// Stock Factory
// ========================================

export const StockFactory = {
    /**
     * 銘柄を作成
     */
    create: async (
        prisma: PrismaClient,
        overrides: Partial<{
            code: string;
            name: string;
            marketSegment: string | null;
            industry33Code: string | null;
            industry33Name: string | null;
            industry17Code: string | null;
            industry17Name: string | null;
            scaleCode: string | null;
            scaleName: string | null;
        }> = {}
    ) => {
        return prisma.stock.create({
            data: {
                code: overrides.code ?? "7203",
                name: overrides.name ?? "トヨタ自動車",
                marketSegment: overrides.marketSegment ?? "プライム",
                industry33Code: overrides.industry33Code ?? null,
                industry33Name: overrides.industry33Name ?? null,
                industry17Code: overrides.industry17Code ?? null,
                industry17Name: overrides.industry17Name ?? null,
                scaleCode: overrides.scaleCode ?? null,
                scaleName: overrides.scaleName ?? null,
            },
        });
    },
};

// ========================================
// Memo Factory
// ========================================

let memoCounter = 0;

export const MemoFactory = {
    /**
     * メモを作成
     */
    create: async (
        prisma: PrismaClient,
        overrides: Partial<{
            id: string;
            userId: string;
            stockCode: string;
            title: string | null;
            content: string;
            tags: string[];
            pinned: boolean;
            visibility: string;
        }> = {}
    ) => {
        memoCounter++;
        return prisma.memo.create({
            data: {
                id: overrides.id ?? `test-memo-${memoCounter}`,
                userId: overrides.userId ?? "test-user-1",
                stockCode: overrides.stockCode ?? "7203",
                title: overrides.title ?? `テストメモ ${memoCounter}`,
                content: overrides.content ?? "これはテスト用のメモ内容です。",
                tags: overrides.tags ?? [],
                pinned: overrides.pinned ?? false,
                visibility: overrides.visibility ?? "private",
            },
        });
    },
};

// ========================================
// WatchlistItem Factory
// ========================================

let watchlistCounter = 0;

export const WatchlistItemFactory = {
    /**
     * ウォッチリストアイテムを作成
     */
    create: async (
        prisma: PrismaClient,
        overrides: Partial<{
            id: string;
            userId: string;
            stockCode: string;
            note: string | null;
        }> = {}
    ) => {
        watchlistCounter++;
        return prisma.watchlistItem.create({
            data: {
                id: overrides.id ?? `test-watchlist-${watchlistCounter}`,
                userId: overrides.userId ?? "test-user-1",
                stockCode: overrides.stockCode ?? "7203",
                note: overrides.note ?? null,
            },
        });
    },
};

// ========================================
// カウンターリセット（テスト間で使用）
// ========================================

export function resetFactoryCounters(): void {
    userCounter = 0;
    memoCounter = 0;
    watchlistCounter = 0;
}
