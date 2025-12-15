"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// ハイドレーションエラーを防ぐため、Headerはクライアントサイドのみでレンダリング
const Header = dynamic(() => import("@/components/header"), {
    ssr: false,
    loading: () => <div style={{ height: "60px" }} />, // ヘッダーの高さ分のプレースホルダー
});

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <SessionProvider>
            <Header />
            <main>{children}</main>
        </SessionProvider>
    );
}
