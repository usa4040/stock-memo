"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Memo {
    id: string;
    title: string | null;
    content: string;
    tags: string[];
    pinned: boolean;
    visibility: string;
    stockCode: string;
    stock: {
        code: string;
        name: string;
    };
}

export default function EditMemoPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const memoId = params.id as string;

    const [memo, setMemo] = useState<Memo | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/api/auth/signin");
            return;
        }
        fetchMemo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status, memoId]);

    const fetchMemo = async () => {
        try {
            const res = await fetch(`/api/memos/${memoId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setError("メモが見つかりません");
                } else if (res.status === 403) {
                    setError("このメモを編集する権限がありません");
                } else {
                    setError("メモの取得に失敗しました");
                }
                return;
            }
            const data: Memo = await res.json();
            setMemo(data);
            setTitle(data.title || "");
            setContent(data.content);
            setTags(data.tags.join(", "));
            setVisibility(data.visibility as "private" | "public");
        } catch (error) {
            console.error("Error fetching memo:", error);
            setError("メモの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setError("メモの内容を入力してください");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/memos/${memoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim() || null,
                    content: content.trim(),
                    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                    visibility,
                }),
            });

            if (res.ok) {
                router.push("/memos");
            } else {
                const data = await res.json();
                setError(data.error || "メモの更新に失敗しました");
            }
        } catch (error) {
            console.error("Error updating memo:", error);
            setError("メモの更新に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading" || loading) {
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

    if (error && !memo) {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <div className="card-body">
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}></div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                            {error}
                        </h1>
                        <Link href="/memos" className="btn btn-primary">
                            マイメモに戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
            <nav style={{ marginBottom: "1.5rem" }}>
                <Link href="/memos" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    ← マイメモに戻る
                </Link>
            </nav>

            <h1 className="page-title">メモを編集</h1>

            {memo && (
                <div className="stock-badge" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                    <span className="stock-code">{memo.stock.code}</span>
                    <span className="stock-name">{memo.stock.name}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                <div className="card-body">
                    {error && (
                        <div style={{ padding: "1rem", background: "var(--color-danger)", color: "white", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                            {error}
                        </div>
                    )}

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
                            rows={10}
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
                                非公開
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
                            disabled={saving}
                            style={{ flex: 1 }}
                        >
                            {saving ? "保存中..." : "変更を保存"}
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
