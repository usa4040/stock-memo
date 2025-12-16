"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stock {
    code: string;
    name: string;
    marketSegment: string | null;
    industry33Name: string | null;
    scaleName: string | null;
}

interface StocksResponse {
    data: Stock[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function StocksPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchStocks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, query]);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(query && { q: query }),
            });
            const res = await fetch(`/api/stocks?${params}`);
            const data: StocksResponse = await res.json();
            setStocks(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error("Error fetching stocks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchStocks();
    };

    return (
        <div className="container" style={{ padding: "2rem 1.5rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">銘柄一覧</h1>
                <p className="page-description">日本株の銘柄を検索してメモを作成できます</p>
            </div>

            {/* 検索フォーム */}
            <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", maxWidth: "500px" }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="銘柄コードまたは銘柄名で検索..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        検索
                    </button>
                </div>
            </form>

            {/* 件数表示 */}
            <p style={{ color: "var(--foreground-secondary)", marginBottom: "1rem" }}>
                {total.toLocaleString()} 件の銘柄が見つかりました
            </p>

            {/* 銘柄リスト */}
            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "1rem" }}>読み込み中...</p>
                </div>
            ) : stocks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p className="empty-state-title">銘柄が見つかりません</p>
                    <p>検索条件を変更してお試しください</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {stocks.map((stock) => (
                        <Link
                            key={stock.code}
                            href={`/stocks/${stock.code}`}
                            style={{ textDecoration: "none" }}
                        >
                            <div className="card" style={{ cursor: "pointer" }}>
                                <div className="card-body">
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                        <span className="stock-code" style={{ fontSize: "1.125rem" }}>
                                            {stock.code}
                                        </span>
                                        <span style={{ fontWeight: "600", color: "var(--foreground)" }}>
                                            {stock.name}
                                        </span>
                                    </div>
                                    <div className="tag-group">
                                        {stock.marketSegment && (
                                            <span className="tag">{stock.marketSegment}</span>
                                        )}
                                        {stock.industry33Name && (
                                            <span className="tag" style={{ background: "var(--background-secondary)", color: "var(--foreground-secondary)" }}>
                                                {stock.industry33Name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
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
