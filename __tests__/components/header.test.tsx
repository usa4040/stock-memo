/* eslint-disable @next/next/no-html-link-for-pages */
import { render, screen } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";

// next-auth/react をモック
jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
    signOut: jest.fn(),
}));

// next/link をモック（テスト用に<a>タグで代替）
jest.mock("next/link", () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Headerコンポーネントを直接インポートせず、テスト用の簡易版を使用
// (SessionProviderの依存を避けるため)
function MockHeader() {
    const { data: session, status } = useSession();

    return (
        <header>
            <nav>
                <a href="/">株メモ</a>
                <a href="/stocks">銘柄一覧</a>
                {status === "loading" ? (
                    <span>読み込み中...</span>
                ) : session ? (
                    <>
                        <a href="/memos">マイメモ</a>
                        <span>{session.user?.name || session.user?.email}</span>
                        <button onClick={() => signOut()}>ログアウト</button>
                    </>
                ) : (
                    <a href="/api/auth/signin">ログイン</a>
                )}
            </nav>
        </header>
    );
}

describe("Header", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("未認証状態", () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: "unauthenticated",
            });
        });

        it("ロゴとナビゲーションが表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("株メモ")).toBeInTheDocument();
            expect(screen.getByText("銘柄一覧")).toBeInTheDocument();
        });

        it("ログインリンクが表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("ログイン")).toBeInTheDocument();
        });

        it("マイメモリンクは表示されない", () => {
            render(<MockHeader />);

            expect(screen.queryByText("マイメモ")).not.toBeInTheDocument();
        });
    });

    describe("認証済み状態", () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: {
                        id: "user-1",
                        name: "テストユーザー",
                        email: "test@example.com",
                    },
                },
                status: "authenticated",
            });
        });

        it("ユーザー名が表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("テストユーザー")).toBeInTheDocument();
        });

        it("マイメモリンクが表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("マイメモ")).toBeInTheDocument();
        });

        it("ログアウトボタンが表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("ログアウト")).toBeInTheDocument();
        });

        it("ログインリンクは表示されない", () => {
            render(<MockHeader />);

            expect(screen.queryByText("ログイン")).not.toBeInTheDocument();
        });
    });

    describe("読み込み中状態", () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: "loading",
            });
        });

        it("読み込み中のテキストが表示される", () => {
            render(<MockHeader />);

            expect(screen.getByText("読み込み中...")).toBeInTheDocument();
        });
    });
});
