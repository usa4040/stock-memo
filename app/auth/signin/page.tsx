"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");

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
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                            株メモ にログイン
                        </h1>
                        <p style={{ color: "var(--foreground-secondary)" }}>
                            Googleアカウントでログインしてください
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
                            ログインに失敗しました。もう一度お試しください。
                        </div>
                    )}

                    {/* Google OAuth ログイン */}
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl })}
                        className="btn"
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            background: "white",
                            border: "1px solid var(--border)",
                            color: "#333",
                            cursor: "pointer",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Googleでログイン
                    </button>
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

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "calc(100vh - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div className="loading-spinner" />
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
