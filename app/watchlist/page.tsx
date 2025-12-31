"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WatchlistItemData {
    id: string;
    stockCode: string;
    stockName: string;
    note: string | null;
    createdAt: string;
}

export default function WatchlistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [items, setItems] = useState<WatchlistItemData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/api/auth/signin");
            return;
        }
        fetchWatchlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/watchlist");
            if (!res.ok) throw new Error("Failed to fetch watchlist");
            const json = await res.json();
            setItems(json.data);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (stockCode: string) => {
        if (!confirm("この銘柄をウォッチリストから削除しますか？")) return;

        try {
            const res = await fetch(`/api/watchlist/${stockCode}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to remove");
            setItems((prev) => prev.filter((item) => item.stockCode !== stockCode));
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            alert("削除に失敗しました");
        }
    };

    if (status === "loading") {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }} />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="container" style={{ padding: "2rem 1.5rem" }}>
            {/* ヘッダー */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="page-title">👀 ウォッチリスト</h1>
                    <p className="page-description">気になる銘柄をまとめて管理</p>
                </div>
                <Link href="/stocks" className="btn btn-primary">
                    📈 銘柄を探す
                </Link>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "1rem" }}>読み込み中...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="card empty-state" style={{ padding: "3rem", textAlign: "center" }}>
                    <div className="empty-state-icon">👀</div>
                    <p className="empty-state-title">ウォッチリストは空です</p>
                    <p style={{ color: "var(--foreground-secondary)", marginBottom: "1.5rem" }}>
                        銘柄詳細ページから「ウォッチ」ボタンで追加できます
                    </p>
                    <Link href="/stocks" className="btn btn-primary">
                        📈 銘柄を探す
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {items.map((item) => (
                        <div key={item.id} className="card" style={{ padding: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <Link
                                        href={`/stocks/${item.stockCode}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div className="stock-badge" style={{ marginBottom: "0.5rem" }}>
                                            <span className="stock-code">{item.stockCode}</span>
                                            <span className="stock-name">{item.stockName}</span>
                                        </div>
                                    </Link>
                                    {item.note && (
                                        <p style={{ fontSize: "0.875rem", color: "var(--foreground-secondary)", marginTop: "0.5rem" }}>
                                            💬 {item.note}
                                        </p>
                                    )}
                                    <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>
                                        追加日: {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Link
                                        href={`/memos/new?stockCode=${item.stockCode}`}
                                        className="btn btn-outline"
                                        style={{ fontSize: "0.875rem" }}
                                    >
                                        📝 メモ作成
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(item.stockCode)}
                                        className="btn btn-outline"
                                        style={{ fontSize: "0.875rem", color: "var(--color-danger)" }}
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
