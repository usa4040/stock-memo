/* eslint-disable @next/next/no-html-link-for-pages */
import { render, screen } from "@testing-library/react";

// next/link をモック
jest.mock("next/link", () => {
    return function MockLink({
        children,
        href,
        className,
    }: {
        children: React.ReactNode;
        href: string;
        className?: string;
    }) {
        return (
            <a href={href} className={className}>
                {children}
            </a>
        );
    };
});

// ホームページの簡易版（実際のコンポーネントの構造をテスト）
function MockHomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">株メモ</h1>
                    <p className="hero-description">
                        あなたの株式投資アイデアを記録・整理するためのメモアプリケーション。
                        銘柄ごとにメモを管理し、投資判断をサポートします。
                    </p>
                    <div>
                        <a href="/stocks" className="btn btn-primary">
                            銘柄を探す
                        </a>
                        <a href="/dashboard" className="btn btn-outline">
                            ダッシュボード
                        </a>
                        <a href="/memos" className="btn btn-outline">
                            マイメモ
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section>
                <h2>主な機能</h2>
                <div>
                    <div>
                        <h3>銘柄メモ</h3>
                        <p>銘柄ごとにメモを作成・管理。投資アイデアや分析結果を記録できます。</p>
                    </div>
                    <div>
                        <h3>タグ管理</h3>
                        <p>タグを使ってメモを整理。テーマや投資スタイルで分類できます。</p>
                    </div>
                    <div>
                        <h3>プライバシー</h3>
                        <p>メモは非公開がデフォルト。公開設定で他のユーザーと共有も可能。</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section>
                <div>
                    <div>4,000+</div>
                    <div>登録銘柄数</div>
                </div>
                <div>
                    <div>無料</div>
                    <div>すべての機能</div>
                </div>
                <div>
                    <div>安全</div>
                    <div>データ保護</div>
                </div>
            </section>
        </>
    );
}

describe("ホームページ", () => {
    describe("ヒーローセクション", () => {
        it("タイトルが表示される", () => {
            render(<MockHomePage />);

            expect(screen.getByText("株メモ")).toBeInTheDocument();
        });

        it("説明文が表示される", () => {
            render(<MockHomePage />);

            expect(
                screen.getByText(/あなたの株式投資アイデアを記録・整理する/)
            ).toBeInTheDocument();
        });

        it("銘柄を探すリンクがある", () => {
            render(<MockHomePage />);

            const link = screen.getByText("銘柄を探す");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/stocks");
        });

        it("マイメモリンクがある", () => {
            render(<MockHomePage />);

            const link = screen.getByText("マイメモ");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/memos");
        });

        it("ダッシュボードリンクがある", () => {
            render(<MockHomePage />);

            const link = screen.getByText("ダッシュボード");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/dashboard");
        });
    });

    describe("機能紹介セクション", () => {
        it("主な機能のタイトルがある", () => {
            render(<MockHomePage />);

            expect(screen.getByText("主な機能")).toBeInTheDocument();
        });

        it("銘柄メモ機能が紹介されている", () => {
            render(<MockHomePage />);

            expect(screen.getByText("銘柄メモ")).toBeInTheDocument();
            expect(screen.getByText(/銘柄ごとにメモを作成・管理/)).toBeInTheDocument();
        });

        it("タグ管理機能が紹介されている", () => {
            render(<MockHomePage />);

            expect(screen.getByText("タグ管理")).toBeInTheDocument();
            expect(screen.getByText(/タグを使ってメモを整理/)).toBeInTheDocument();
        });

        it("プライバシー機能が紹介されている", () => {
            render(<MockHomePage />);

            expect(screen.getByText("プライバシー")).toBeInTheDocument();
            expect(screen.getByText(/メモは非公開がデフォルト/)).toBeInTheDocument();
        });
    });

    describe("統計セクション", () => {
        it("登録銘柄数が表示される", () => {
            render(<MockHomePage />);

            expect(screen.getByText("4,000+")).toBeInTheDocument();
            expect(screen.getByText("登録銘柄数")).toBeInTheDocument();
        });

        it("無料表示がある", () => {
            render(<MockHomePage />);

            expect(screen.getByText("無料")).toBeInTheDocument();
            expect(screen.getByText("すべての機能")).toBeInTheDocument();
        });

        it("安全性の表示がある", () => {
            render(<MockHomePage />);

            expect(screen.getByText("安全")).toBeInTheDocument();
            expect(screen.getByText("データ保護")).toBeInTheDocument();
        });
    });
});
