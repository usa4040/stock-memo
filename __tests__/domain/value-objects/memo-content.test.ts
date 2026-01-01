import { MemoContent } from "@/domain/value-objects/memo-content";

describe("MemoContent Value Object", () => {
    describe("create", () => {
        it("正常な内容でMemoContentを作成できる", () => {
            const content = MemoContent.create("これはテストメモです。");
            expect(content.value).toBe("これはテストメモです。");
        });

        it("前後の空白をトリムする", () => {
            const content = MemoContent.create("  テスト内容  ");
            expect(content.value).toBe("テスト内容");
        });

        it("1文字の内容で作成できる", () => {
            const content = MemoContent.create("あ");
            expect(content.value).toBe("あ");
        });

        it("10000文字の内容で作成できる", () => {
            const longContent = "あ".repeat(10000);
            const content = MemoContent.create(longContent);
            expect(content.value).toBe(longContent);
            expect(content.length).toBe(10000);
        });

        it("空文字列はエラー", () => {
            expect(() => MemoContent.create("")).toThrow("メモ内容は必須です");
        });

        it("空白のみはエラー", () => {
            expect(() => MemoContent.create("   ")).toThrow("メモ内容は必須です");
        });

        it("10000文字を超える内容はエラー", () => {
            const tooLongContent = "あ".repeat(10001);
            expect(() => MemoContent.create(tooLongContent)).toThrow(
                "メモ内容は10000文字以内で入力してください"
            );
        });
    });

    describe("reconstruct", () => {
        it("既存の内容から復元できる", () => {
            const content = MemoContent.reconstruct("復元された内容");
            expect(content.value).toBe("復元された内容");
        });

        it("バリデーションなしで復元する", () => {
            // reconstructはDBからの復元用なのでバリデーションをスキップ
            const content = MemoContent.reconstruct("");
            expect(content.value).toBe("");
        });
    });

    describe("length", () => {
        it("文字数を取得できる", () => {
            const content = MemoContent.create("12345");
            expect(content.length).toBe(5);
        });

        it("日本語の文字数を正しくカウントする", () => {
            const content = MemoContent.create("あいうえお");
            expect(content.length).toBe(5);
        });
    });

    describe("preview", () => {
        it("短い内容はそのまま返す", () => {
            const content = MemoContent.create("短いメモ");
            expect(content.preview()).toBe("短いメモ");
        });

        it("デフォルトで150文字まで表示する", () => {
            const longContent = "あ".repeat(200);
            const content = MemoContent.create(longContent);
            const preview = content.preview();

            expect(preview.length).toBe(153); // 150 + "..."
            expect(preview).toBe("あ".repeat(150) + "...");
        });

        it("指定した長さでプレビューを取得できる", () => {
            const content = MemoContent.create("これはテストメモの内容です。");
            const preview = content.preview(5);

            expect(preview).toBe("これはテス...");
        });

        it("指定した長さ以下なら省略しない", () => {
            const content = MemoContent.create("短い");
            expect(content.preview(100)).toBe("短い");
        });
    });

    describe("equals", () => {
        it("同じ内容はtrueを返す", () => {
            const content1 = MemoContent.create("テスト");
            const content2 = MemoContent.create("テスト");
            expect(content1.equals(content2)).toBe(true);
        });

        it("異なる内容はfalseを返す", () => {
            const content1 = MemoContent.create("テスト1");
            const content2 = MemoContent.create("テスト2");
            expect(content1.equals(content2)).toBe(false);
        });
    });

    describe("toString", () => {
        it("内容を文字列として返す", () => {
            const content = MemoContent.create("テスト内容");
            expect(content.toString()).toBe("テスト内容");
        });
    });
});
