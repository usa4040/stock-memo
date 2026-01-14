"use client";

import useSWR from "swr";

// 汎用fetcher関数
export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error("データの取得に失敗しました");
        throw error;
    }
    return res.json();
};

// 銘柄一覧を取得するhook
export function useStocks(params?: { page?: number; limit?: number; q?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.q) searchParams.set("q", params.q);

    const url = `/api/stocks?${searchParams.toString()}`;
    return useSWR(url, fetcher);
}

// ダッシュボードデータを取得するhook
export function useDashboard() {
    return useSWR("/api/dashboard", fetcher);
}

// メモ一覧を取得するhook
export function useMemos(params?: {
    page?: number;
    limit?: number;
    q?: string;
    tags?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.q) searchParams.set("q", params.q);
    if (params?.tags) searchParams.set("tags", params.tags);

    const url = `/api/memos?${searchParams.toString()}`;
    return useSWR(url, fetcher);
}

// ウォッチリストを取得するhook
export function useWatchlist() {
    return useSWR("/api/watchlist", fetcher);
}

// 特定銘柄のウォッチ状態を取得するhook
export function useWatchStatus(stockCode: string) {
    return useSWR(stockCode ? `/api/watchlist/${stockCode}` : null, fetcher);
}
