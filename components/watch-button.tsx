"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface WatchButtonProps {
    stockCode: string;
}

export default function WatchButton({ stockCode }: WatchButtonProps) {
    const { data: session } = useSession();
    const [isWatching, setIsWatching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (session) {
            checkWatchStatus();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, stockCode]);

    const checkWatchStatus = async () => {
        try {
            const res = await fetch(`/api/watchlist/${stockCode}`);
            if (res.ok) {
                const data = await res.json();
                setIsWatching(data.isWatching);
            }
        } catch (error) {
            console.error("Error checking watch status:", error);
        } finally {
            setLoading(false);
        }
    };

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
                    setIsWatching(false);
                }
            } else {
                // ウォッチ追加
                const res = await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stockCode }),
                });
                if (res.ok) {
                    setIsWatching(true);
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

    if (loading) {
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
