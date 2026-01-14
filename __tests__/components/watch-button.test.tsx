import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WatchButton from "@/components/watch-button";
import { SWRConfig } from "swr";

// next-auth/react のモック
jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
}));

// fetch のモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// alert のモック
const mockAlert = jest.fn();
global.alert = mockAlert;

import { useSession } from "next-auth/react";
const mockUseSession = useSession as jest.Mock;

// SWRのキャッシュを無効化するラッパー
const SWRWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
    </SWRConfig>
);

describe("WatchButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("未ログイン時", () => {
        it("セッションがない場合は何も表示しない", () => {
            mockUseSession.mockReturnValue({ data: null });

            const { container } = render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe("ログイン時", () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: { user: { id: "user-1", name: "Test User" } },
            });
        });

        it("読み込み中は「読み込み中…」と表示される", async () => {
            mockFetch.mockImplementation(() => new Promise(() => { })); // 永久に解決しない

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            expect(screen.getByText(/読み込み中/)).toBeInTheDocument();
        });

        it("ウォッチしていない場合は「ウォッチする」と表示される", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ isWatching: false }),
            });

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチする/)).toBeInTheDocument();
            });
        });

        it("ウォッチ中の場合は「ウォッチ中」と表示される", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ isWatching: true }),
            });

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチ中/)).toBeInTheDocument();
            });
        });

        it("「ウォッチする」クリックでPOSTリクエストが送信される", async () => {
            // 最初はウォッチしていない
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ isWatching: false }),
            });
            // 追加成功
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチする/)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stockCode: "7203" }),
                });
            });
        });

        it("「ウォッチ中」クリックでDELETEリクエストが送信される", async () => {
            // 最初はウォッチ中
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ isWatching: true }),
            });
            // 削除成功
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチ中/)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith("/api/watchlist/7203", {
                    method: "DELETE",
                });
            });
        });

        it("エラー時にはアラートが表示される", async () => {
            // console.errorの出力を抑制
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ isWatching: false }),
            });
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチする/)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith("操作に失敗しました");
            });

            // console.errorが呼ばれたことを確認
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it("処理中は「処理中…」と表示されボタンが無効になる", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ isWatching: false }),
            });
            // 2回目のfetchは遅延させる
            mockFetch.mockImplementationOnce(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ ok: true, json: () => Promise.resolve({}) }),
                            100
                        )
                    )
            );

            render(
                <SWRWrapper>
                    <WatchButton stockCode="7203" />
                </SWRWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/ウォッチする/)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole("button"));

            expect(screen.getByText("処理中…")).toBeInTheDocument();
            expect(screen.getByRole("button")).toBeDisabled();
        });
    });
});
