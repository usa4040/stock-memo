import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/components/confirm-modal";

describe("ConfirmModal", () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        isOpen: true,
        title: "テストタイトル",
        message: "テストメッセージ",
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("表示", () => {
        it("isOpenがtrueの場合、モーダルが表示される", () => {
            render(<ConfirmModal {...defaultProps} />);

            expect(screen.getByText("テストタイトル")).toBeInTheDocument();
            expect(screen.getByText("テストメッセージ")).toBeInTheDocument();
        });

        it("isOpenがfalseの場合、モーダルが表示されない", () => {
            render(<ConfirmModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText("テストタイトル")).not.toBeInTheDocument();
        });

        it("デフォルトのボタンテキストが表示される", () => {
            render(<ConfirmModal {...defaultProps} />);

            expect(screen.getByText("確認")).toBeInTheDocument();
            expect(screen.getByText("キャンセル")).toBeInTheDocument();
        });

        it("カスタムボタンテキストが表示される", () => {
            render(
                <ConfirmModal
                    {...defaultProps}
                    confirmText="削除する"
                    cancelText="やめる"
                />
            );

            expect(screen.getByText("削除する")).toBeInTheDocument();
            expect(screen.getByText("やめる")).toBeInTheDocument();
        });
    });

    describe("インタラクション", () => {
        it("確認ボタンをクリックするとonConfirmが呼ばれる", () => {
            render(<ConfirmModal {...defaultProps} />);

            fireEvent.click(screen.getByText("確認"));

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });

        it("キャンセルボタンをクリックするとonCancelが呼ばれる", () => {
            render(<ConfirmModal {...defaultProps} />);

            fireEvent.click(screen.getByText("キャンセル"));

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it("ESCキーを押すとonCancelが呼ばれる", () => {
            render(<ConfirmModal {...defaultProps} />);

            fireEvent.keyDown(document, { key: "Escape" });

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it("背景をクリックするとonCancelが呼ばれる", () => {
            render(<ConfirmModal {...defaultProps} />);

            const backdrop = screen.getByRole("dialog").parentElement;
            if (backdrop) {
                fireEvent.click(backdrop);
            }

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it("モーダル内部をクリックしてもonCancelは呼ばれない", () => {
            render(<ConfirmModal {...defaultProps} />);

            fireEvent.click(screen.getByRole("dialog"));

            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });
});
