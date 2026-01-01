"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="logo">
                    <span className="logo-icon">📈</span>
                    <span className="logo-text">株メモ</span>
                </Link>

                <nav className="nav">
                    <Link href="/stocks" className="nav-link">
                        銘柄一覧
                    </Link>
                    {session && (
                        <>
                            <Link href="/dashboard" className="nav-link">
                                ダッシュボード
                            </Link>
                            <Link href="/watchlist" className="nav-link">
                                ウォッチリスト
                            </Link>
                            <Link href="/memos" className="nav-link">
                                マイメモ
                            </Link>
                        </>
                    )}
                </nav>

                <div className="auth-section">
                    {status === "loading" ? (
                        <div className="loading-spinner" />
                    ) : session ? (
                        <div className="user-menu">
                            <span className="user-name">{session.user?.name || "ユーザー"}</span>
                            <button onClick={() => signOut()} className="btn btn-outline">
                                ログアウト
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => signIn()} className="btn btn-primary">
                            ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
