"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("メールアドレスを入力してください");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: email.trim(),
                callbackUrl,
            });

            if (result?.error) {
                setError("ログインに失敗しました");
            }
        } catch (error) {
            console.error("Sign in error:", error);
            setError("ログインに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "calc(100vh - 60px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <div className="card-body" style={{ padding: "2rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                            Stock Memo にログイン
                        </h1>
                        <p style={{ color: "var(--foreground-secondary)" }}>
                            メールアドレスを入力してください
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: "0.75rem 1rem",
                            background: "var(--color-danger)",
                            color: "white",
                            borderRadius: "var(--radius-md)",
                            marginBottom: "1.5rem",
                            fontSize: "0.875rem",
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label className="label">メールアドレス</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="example@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: "100%", padding: "0.75rem" }}
                        >
                            {loading ? "ログイン中..." : "ログイン"}
                        </button>
                    </form>

                    <div style={{
                        marginTop: "1.5rem",
                        paddingTop: "1.5rem",
                        borderTop: "1px solid var(--border)",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--foreground-secondary)",
                    }}>
                        <p>
                            新規ユーザーの場合は自動的にアカウントが作成されます
                        </p>
                    </div>
                </div>

                <div className="card-footer" style={{ textAlign: "center" }}>
                    <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                        ← ホームに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
