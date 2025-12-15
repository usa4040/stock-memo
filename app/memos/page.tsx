"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Memo {
    id: string;
    title: string | null;
    content: string;
    tags: string[];
    pinned: boolean;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    stock: {
        code: string;
        name: string;
    };
}

interface MemosResponse {
    data: Memo[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function MemosPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/api/auth/signin");
            return;
        }
        fetchMemos();
    }, [page, session, status]);

    const fetchMemos = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            });
            const res = await fetch(`/api/memos?${params}`);
            if (!res.ok) throw new Error("Failed to fetch memos");
            const data: MemosResponse = await res.json();
            setMemos(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error("Error fetching memos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("このメモを削除しますか？")) return;

        try {
            const res = await fetch(`/api/memos/${id}`, { method: "DELETE" });
            if (res.ok) {
                setMemos(memos.filter((m) => m.id !== id));
                setTotal(total - 1);
            } else {
                const data = await res.json();
                alert(data.error || "削除に失敗しました");
            }
        } catch (error) {
            console.error("Error deleting memo:", error);
            alert("削除に失敗しました。ネットワークエラーが発生しました。");
        }
    };

    const handleTogglePin = async (memo: Memo) => {
        try {
            const res = await fetch(`/api/memos/${memo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: !memo.pinned }),
            });
            if (res.ok) {
                fetchMemos();
            }
        } catch (error) {
            console.error("Error toggling pin:", error);
        }
    };

    if (status === "loading") {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }} />
                <p style={{ marginTop: "1rem", color: "var(--foreground-secondary)" }}>読み込み中...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container" style={{ padding: "2rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                    <h1 className="page-title">マイメモ</h1>
                    <p className="page-description">あなたが作成したメモの一覧です</p>
                </div>
                <Link href="/memos/new" className="btn btn-primary">
                    ＋ 新規メモ
                </Link>
            </div>

            {/* 件数表示 */}
            <p style={{ color: "var(--foreground-secondary)", marginBottom: "1rem" }}>
                {total} 件のメモ
            </p>

            {/* メモリスト */}
            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "1rem" }}>読み込み中...</p>
                </div>
            ) : memos.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">📝</div>
                    <p className="empty-state-title">まだメモがありません</p>
                    <p style={{ marginBottom: "1.5rem" }}>銘柄を選んでメモを作成しましょう</p>
                    <Link href="/stocks" className="btn btn-primary">
                        銘柄を探す
                    </Link>
                </div>
            ) : (
                <div className="grid grid-2">
                    {memos.map((memo) => (
                        <div key={memo.id} className="card">
                            <div className="card-body">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <Link href={`/stocks/${memo.stock.code}`} className="stock-badge">
                                        <span className="stock-code">{memo.stock.code}</span>
                                        <span className="stock-name">{memo.stock.name}</span>
                                    </Link>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {memo.pinned && <span className="pinned-badge">📌 ピン</span>}
                                        {memo.visibility === "public" && (
                                            <span className="tag" style={{ background: "var(--color-success)", color: "white" }}>
                                                公開
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {memo.title && (
                                    <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                                        {memo.title}
                                    </h3>
                                )}

                                <p style={{ color: "var(--foreground-secondary)", marginBottom: "1rem", lineHeight: "1.6" }}>
                                    {memo.content.length > 150
                                        ? memo.content.slice(0, 150) + "..."
                                        : memo.content}
                                </p>

                                {memo.tags.length > 0 && (
                                    <div className="tag-group" style={{ marginBottom: "1rem" }}>
                                        {memo.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                                        {new Date(memo.updatedAt).toLocaleDateString("ja-JP")} 更新
                                    </span>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            onClick={() => handleTogglePin(memo)}
                                            className="btn btn-outline"
                                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                        >
                                            {memo.pinned ? "📌 解除" : "📌 ピン"}
                                        </button>
                                        <Link
                                            href={`/memos/${memo.id}/edit`}
                                            className="btn btn-outline"
                                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                        >
                                            編集
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(memo.id)}
                                            className="btn btn-danger"
                                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
                    <button
                        className="btn btn-outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        前へ
                    </button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 1rem", color: "var(--foreground-secondary)" }}>
                        {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        次へ
                    </button>
                </div>
            )}
        </div>
    );
}
