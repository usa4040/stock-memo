"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MemoSummary {
    id: string;
    title: string | null;
    content: string;
    stockCode: string;
    stockName: string;
    updatedAt: string;
    tags: string[];
    pinned: boolean;
}

interface DashboardData {
    statistics: {
        totalMemos: number;
        totalStocks: number;
        totalTags: number;
        pinnedMemos: number;
    };
    pinnedMemos: MemoSummary[];
    recentMemos: MemoSummary[];
    topTags: { tag: string; count: number }[];
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/api/auth/signin");
            return;
        }
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            const data: DashboardData = await res.json();
            setDashboard(data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
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
            {/* ヘッダー */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">ダッシュボード</h1>
                <p className="page-description">
                    {session.user?.name || session.user?.email}さんの投資メモ活動
                </p>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "1rem" }}>読み込み中...</p>
                </div>
            ) : dashboard ? (
                <>
                    {/* 統計カード */}
                    <div className="grid grid-4" style={{ marginBottom: "2rem" }}>
                        <StatCard
                            icon="📝"
                            label="総メモ数"
                            value={dashboard.statistics.totalMemos}
                            color="var(--color-primary)"
                        />
                        <StatCard
                            icon="📈"
                            label="対象銘柄"
                            value={dashboard.statistics.totalStocks}
                            color="var(--color-secondary)"
                        />
                        <StatCard
                            icon="🏷️"
                            label="使用タグ"
                            value={dashboard.statistics.totalTags}
                            color="var(--color-accent)"
                        />
                        <StatCard
                            icon="📌"
                            label="ピン留め"
                            value={dashboard.statistics.pinnedMemos}
                            color="var(--color-success)"
                        />
                    </div>

                    {/* メインコンテンツ */}
                    <div className="grid grid-2" style={{ gap: "2rem" }}>
                        {/* ピン留めメモ */}
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>📌 ピン留めメモ</h2>
                            </div>
                            {dashboard.pinnedMemos.length === 0 ? (
                                <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                                    <p style={{ color: "var(--foreground-secondary)" }}>
                                        ピン留めしたメモはありません
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {dashboard.pinnedMemos.map((memo) => (
                                        <MemoCard key={memo.id} memo={memo} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 最近のメモ */}
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>🕐 最近のメモ</h2>
                                <Link href="/memos" style={{ fontSize: "0.875rem", color: "var(--color-primary)" }}>
                                    すべて見る →
                                </Link>
                            </div>
                            {dashboard.recentMemos.length === 0 ? (
                                <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                                    <p style={{ color: "var(--foreground-secondary)" }}>
                                        まだメモがありません
                                    </p>
                                    <Link href="/stocks" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                                        📈 銘柄を探す
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {dashboard.recentMemos.map((memo) => (
                                        <MemoCard key={memo.id} memo={memo} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* タグクラウド */}
                    {dashboard.topTags.length > 0 && (
                        <section style={{ marginTop: "2rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
                                🏷️ よく使うタグ
                            </h2>
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                                    {dashboard.topTags.map(({ tag, count }) => (
                                        <Link
                                            key={tag}
                                            href={`/memos?tags=${encodeURIComponent(tag)}`}
                                            className="tag"
                                            style={{
                                                padding: "0.5rem 1rem",
                                                fontSize: "0.875rem",
                                                cursor: "pointer",
                                                textDecoration: "none",
                                            }}
                                        >
                                            {tag}
                                            <span style={{
                                                marginLeft: "0.5rem",
                                                padding: "0.125rem 0.375rem",
                                                background: "var(--color-primary)",
                                                color: "white",
                                                borderRadius: "9999px",
                                                fontSize: "0.75rem",
                                            }}>
                                                {count}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* クイックアクション */}
                    <section style={{ marginTop: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
                            ⚡ クイックアクション
                        </h2>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            <Link href="/memos/new" className="btn btn-primary">
                                📝 新規メモ作成
                            </Link>
                            <Link href="/stocks" className="btn btn-outline">
                                📈 銘柄を探す
                            </Link>
                            <Link href="/memos" className="btn btn-outline">
                                📋 メモ一覧
                            </Link>
                        </div>
                    </section>
                </>
            ) : (
                <div className="empty-state card">
                    <div className="empty-state-icon">⚠️</div>
                    <p className="empty-state-title">データの取得に失敗しました</p>
                    <button onClick={fetchDashboard} className="btn btn-primary" style={{ marginTop: "1rem" }}>
                        再読み込み
                    </button>
                </div>
            )}
        </div>
    );
}

// 統計カードコンポーネント
function StatCard({ icon, label, value, color }: {
    icon: string;
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: "2rem" }}>{icon}</div>
                <div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color }}>{value}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--foreground-secondary)" }}>{label}</div>
                </div>
            </div>
        </div>
    );
}

// メモカードコンポーネント
function MemoCard({ memo }: { memo: MemoSummary }) {
    return (
        <Link href={`/memos/${memo.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card-body" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div className="stock-badge">
                        <span className="stock-code">{memo.stockCode}</span>
                        <span className="stock-name">{memo.stockName}</span>
                    </div>
                    {memo.pinned && <span className="pinned-badge">📌</span>}
                </div>
                {memo.title && (
                    <h3 style={{ fontWeight: "600", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                        {memo.title}
                    </h3>
                )}
                <p style={{ fontSize: "0.875rem", color: "var(--foreground-secondary)", marginBottom: "0.5rem", lineHeight: "1.5" }}>
                    {memo.content}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="tag-group">
                        {memo.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag" style={{ fontSize: "0.75rem" }}>{tag}</span>
                        ))}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        {new Date(memo.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                </div>
            </div>
        </Link>
    );
}
