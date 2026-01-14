"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/swr";

interface WatchButtonProps {
    stockCode: string;
}

export default function WatchButton({ stockCode }: WatchButtonProps) {
    const { data: session } = useSession();
    const [actionLoading, setActionLoading] = useState(false);

    // SWRでウォッチ状態を取得（sessionがある場合のみ）
    const { data, isLoading } = useSWR(
        session ? `/api/watchlist/${stockCode}` : null,
        fetcher
    );

    const isWatching = data?.isWatching ?? false;

    const handleToggleWatch = async () => {
        if (!session) {
            alert("ログインが必要です");
            return;
        }

        setActionLoading(true);
        try {
            if (isWatching) {
                // ウォッチ解除
                const res = await fetch(`/api/watchlist/${stockCode}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    // SWRキャッシュを更新
                    mutate(`/api/watchlist/${stockCode}`, { isWatching: false }, false);
                }
            } else {
                // ウォッチ追加
                const res = await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stockCode }),
                });
                if (res.ok) {
                    // SWRキャッシュを更新
                    mutate(`/api/watchlist/${stockCode}`, { isWatching: true }, false);
                }
            }
        } catch (error) {
            console.error("Error toggling watch:", error);
            alert("操作に失敗しました");
        } finally {
            setActionLoading(false);
        }
    };

    if (!session) {
        return null;
    }

    if (isLoading) {
        return (
            <button className="btn btn-outline" disabled style={{ opacity: 0.5 }}>
                👀 読み込み中…
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleWatch}
            disabled={actionLoading}
            className={`btn ${isWatching ? "btn-primary" : "btn-outline"}`}
            style={{
                minWidth: "140px",
            }}
        >
            {actionLoading ? (
                "処理中…"
            ) : isWatching ? (
                "👀 ウォッチ中"
            ) : (
                "👀 ウォッチする"
            )}
        </button>
    );
}
