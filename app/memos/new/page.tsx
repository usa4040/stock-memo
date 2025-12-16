"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Stock {
    code: string;
    name: string;
}

function NewMemoContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const stockCodeParam = searchParams.get("stockCode") || "";

    const [stockCode, setStockCode] = useState(stockCodeParam);
    const [stockSearch, setStockSearch] = useState("");
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/api/auth/signin");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    useEffect(() => {
        if (stockCodeParam) {
            fetchStock(stockCodeParam);
        }
    }, [stockCodeParam]);

    useEffect(() => {
        if (stockSearch.length >= 2) {
            searchStocks(stockSearch);
        } else {
            setStocks([]);
        }
    }, [stockSearch]);

    const fetchStock = async (code: string) => {
        try {
            const res = await fetch(`/api/stocks/${code}`);
            if (res.ok) {
                const stock = await res.json();
                setSelectedStock({ code: stock.code, name: stock.name });
                setStockCode(stock.code);
            }
        } catch (error) {
            console.error("Error fetching stock:", error);
        }
    };

    const searchStocks = async (query: string) => {
        try {
            const res = await fetch(`/api/stocks?q=${encodeURIComponent(query)}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                setStocks(data.data);
            }
        } catch (error) {
            console.error("Error searching stocks:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockCode) {
            setError("銘柄を選択してください");
            return;
        }
        if (!content.trim()) {
            setError("メモの内容を入力してください");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/memos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stockCode,
                    title: title.trim() || undefined,
                    content: content.trim(),
                    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                    visibility,
                }),
            });

            if (res.ok) {
                router.push("/memos");
            } else {
                const data = await res.json();
                setError(data.error || "メモの作成に失敗しました");
            }
        } catch (error) {
            console.error("Error creating memo:", error);
            setError("メモの作成に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }} />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
            <nav style={{ marginBottom: "1.5rem" }}>
                <Link href="/memos" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    ← マイメモに戻る
                </Link>
            </nav>

            <h1 className="page-title">新規メモ作成</h1>

            <form onSubmit={handleSubmit} className="card" style={{ marginTop: "2rem" }}>
                <div className="card-body">
                    {error && (
                        <div style={{ padding: "1rem", background: "var(--color-danger)", color: "white", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                            {error}
                        </div>
                    )}

                    {/* 銘柄選択 */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">銘柄 *</label>
                        {selectedStock ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div className="stock-badge">
                                    <span className="stock-code">{selectedStock.code}</span>
                                    <span className="stock-name">{selectedStock.name}</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                    onClick={() => {
                                        setSelectedStock(null);
                                        setStockCode("");
                                    }}
                                >
                                    変更
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="銘柄コードまたは銘柄名を入力..."
                                    value={stockSearch}
                                    onChange={(e) => setStockSearch(e.target.value)}
                                />
                                {stocks.length > 0 && (
                                    <div style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-md)",
                                        boxShadow: "var(--card-shadow-hover)",
                                        zIndex: 10,
                                    }}>
                                        {stocks.map((stock) => (
                                            <button
                                                key={stock.code}
                                                type="button"
                                                style={{
                                                    width: "100%",
                                                    padding: "0.75rem 1rem",
                                                    textAlign: "left",
                                                    border: "none",
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid var(--border)",
                                                }}
                                                onClick={() => {
                                                    setSelectedStock(stock);
                                                    setStockCode(stock.code);
                                                    setStockSearch("");
                                                    setStocks([]);
                                                }}
                                            >
                                                <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                                                    {stock.code}
                                                </span>
                                                <span style={{ marginLeft: "0.5rem" }}>{stock.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* タイトル */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">タイトル（任意）</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="メモのタイトル"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    {/* 内容 */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">内容 *</label>
                        <textarea
                            className="input textarea"
                            placeholder="投資アイデアや分析結果を記録..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            maxLength={10000}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", textAlign: "right" }}>
                            {content.length} / 10000
                        </div>
                    </div>

                    {/* タグ */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">タグ（カンマ区切り）</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="長期投資, 高配当, バリュー株"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    {/* 公開設定 */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">公開設定</label>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={visibility === "private"}
                                    onChange={() => setVisibility("private")}
                                />
                                🔒 非公開
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={visibility === "public"}
                                    onChange={() => setVisibility("public")}
                                />
                                🌐 公開
                            </label>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? "作成中..." : "メモを作成"}
                        </button>
                        <Link href="/memos" className="btn btn-outline">
                            キャンセル
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function NewMemoPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }} />
            </div>
        }>
            <NewMemoContent />
        </Suspense>
    );
}
