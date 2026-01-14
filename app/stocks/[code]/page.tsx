import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import WatchButton from "@/components/watch-button";

interface Props {
    params: Promise<{ code: string }>;
}

export default async function StockDetailPage({ params }: Props) {
    const { code } = await params;

    const [stock, publicMemosCount] = await Promise.all([
        prisma.stock.findUnique({
            where: { code },
            include: {
                memos: {
                    where: { visibility: "public" },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    include: {
                        user: {
                            select: { name: true, image: true },
                        },
                    },
                },
            },
        }),
        prisma.memo.count({
            where: {
                stockCode: code,
                visibility: "public",
            },
        }),
    ]);

    if (!stock) {
        notFound();
    }

    return (
        <div className="container" style={{ padding: "2rem 1.5rem" }}>
            {/* ブレッドクラム */}
            <nav style={{ marginBottom: "1.5rem" }}>
                <Link href="/stocks" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    ← 銘柄一覧に戻る
                </Link>
            </nav>

            {/* 銘柄情報 */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-primary)" }}>
                            {stock.code}
                        </span>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", margin: 0 }}>
                            {stock.name}
                        </h1>
                    </div>

                    <div className="tag-group" style={{ marginBottom: "1.5rem" }}>
                        {stock.marketSegment && <span className="tag">{stock.marketSegment}</span>}
                        {stock.industry33Name && <span className="tag">{stock.industry33Name}</span>}
                        {stock.scaleName && <span className="tag">{stock.scaleName}</span>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        {stock.industry17Name && (
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "0.25rem" }}>
                                    17業種分類
                                </div>
                                <div style={{ fontWeight: "500" }}>{stock.industry17Name}</div>
                            </div>
                        )}
                        {stock.listedDate && (
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "0.25rem" }}>
                                    上場日
                                </div>
                                <div style={{ fontWeight: "500" }}>
                                    {new Date(stock.listedDate).toLocaleDateString("ja-JP")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* アクション */}
            <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href={`/memos/new?stockCode=${stock.code}`} className="btn btn-primary">
                    この銘柄にメモを追加
                </Link>
                <WatchButton stockCode={stock.code} />
            </div>

            {/* 公開メモ */}
            <section>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                    公開メモ ({publicMemosCount}件)
                </h2>

                {stock.memos.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-state-icon"></div>
                        <p className="empty-state-title">まだ公開メモがありません</p>
                        <p>最初のメモを作成してみましょう</p>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {stock.memos.map((memo) => (
                            <div key={memo.id} className="card">
                                <div className="card-body">
                                    {memo.title && (
                                        <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                                            {memo.title}
                                        </h3>
                                    )}
                                    <p style={{ color: "var(--foreground-secondary)", marginBottom: "1rem", lineHeight: "1.6" }}>
                                        {memo.content.length > 200
                                            ? memo.content.slice(0, 200) + "…"
                                            : memo.content}
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div className="tag-group">
                                            {memo.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                                            {memo.user.name} • {new Date(memo.createdAt).toLocaleDateString("ja-JP")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
