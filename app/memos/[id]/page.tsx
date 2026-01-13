"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "@/components/confirm-modal";

interface Memo {
    id: string;
    userId: string;
    title: string | null;
    content: string;
    tags: string[];
    pinned: boolean;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    stockCode: string;
    stock: {
        code: string;
        name: string;
        marketSegment: string | null;
        industry33Name: string | null;
    };
    user: {
        name: string | null;
        image: string | null;
    };
}

export default function MemoDetailPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const memoId = params.id as string;

    const [memo, setMemo] = useState<Memo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMemo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoId]);

    const fetchMemo = async () => {
        try {
            const res = await fetch(`/api/memos/${memoId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setError("メモが見つかりません");
                } else if (res.status === 403) {
                    setError("このメモを表示する権限がありません");
                } else {
                    setError("メモの取得に失敗しました");
                }
                return;
            }
            const data: Memo = await res.json();
            setMemo(data);
        } catch (error) {
            console.error("Error fetching memo:", error);
            setError("メモの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!memo) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/memos/${memo.id}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/memos");
            } else {
                const data = await res.json();
                alert(data.error || "削除に失敗しました");
            }
        } catch (error) {
            console.error("Error deleting memo:", error);
            alert("削除に失敗しました");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleTogglePin = async () => {
        if (!memo) return;

        try {
            const res = await fetch(`/api/memos/${memo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: !memo.pinned }),
            });
            if (res.ok) {
                setMemo({ ...memo, pinned: !memo.pinned });
            }
        } catch (error) {
            console.error("Error toggling pin:", error);
        }
    };

    const isOwner = session?.user?.id === memo?.userId;

    if (loading) {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }} />
                <p style={{ marginTop: "1rem", color: "var(--foreground-secondary)" }}>読み込み中...</p>
            </div>
        );
    }

    if (error) {
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

    if (!memo) return null;

    return (
        <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
            {/* ナビゲーション */}
            <nav style={{ marginBottom: "1.5rem" }}>
                <Link href="/memos" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    ← マイメモに戻る
                </Link>
            </nav>

            {/* メモヘッダー */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-body">
                    {/* 銘柄情報 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <Link href={`/stocks/${memo.stock.code}`} className="stock-badge" style={{ textDecoration: "none" }}>
                            <span className="stock-code" style={{ fontSize: "1.25rem" }}>{memo.stock.code}</span>
                            <span className="stock-name" style={{ fontSize: "1rem" }}>{memo.stock.name}</span>
                        </Link>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {memo.pinned && <span className="pinned-badge">ピン留め済み</span>}
                            <span
                                className="tag"
                                style={{
                                    background: memo.visibility === "public" ? "var(--color-success)" : "var(--foreground-muted)",
                                    color: "white"
                                }}
                            >
                                {memo.visibility === "public" ? "公開" : "非公開"}
                            </span>
                        </div>
                    </div>

                    {/* タイトル */}
                    {memo.title && (
                        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "1rem" }}>
                            {memo.title}
                        </h1>
                    )}

                    {/* メタ情報 */}
                    <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <span>作成: {new Date(memo.createdAt).toLocaleDateString("ja-JP")}</span>
                        <span>更新: {new Date(memo.updatedAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                </div>
            </div>

            {/* メモ本文 */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-body">
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "var(--foreground)" }}>
                        {memo.content}
                    </div>
                </div>
            </div>

            {/* タグ */}
            {memo.tags.length > 0 && (
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <div className="card-body">
                        <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--foreground-muted)", marginBottom: "0.75rem" }}>
                            タグ
                        </h3>
                        <div className="tag-group">
                            {memo.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* アクションボタン（オーナーのみ） */}
            {isOwner && (
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <button
                                onClick={handleTogglePin}
                                className="btn btn-outline"
                            >
                                {memo.pinned ? "ピン留め解除" : "ピン留め"}
                            </button>
                            <Link href={`/memos/${memo.id}/edit`} className="btn btn-primary">
                                編集
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn btn-danger"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 削除確認モーダル */}
            <ConfirmModal
                isOpen={showDeleteModal}
                title="メモを削除"
                message={`「${memo.stock.name}」のメモを削除しますか？この操作は取り消せません。`}
                confirmText={isDeleting ? "削除中..." : "削除する"}
                cancelText="キャンセル"
                confirmButtonClass="btn-danger"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
}
