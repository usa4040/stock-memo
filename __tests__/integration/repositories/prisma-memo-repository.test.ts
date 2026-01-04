/**
 * PrismaMemoRepository 統合テスト
 *
 * 実際のテスト用DBを使用してリポジトリの動作を検証
 */
import prismaTest from "@/lib/prisma-test";
import { PrismaMemoRepository } from "@/infrastructure/repositories/prisma-memo-repository";
import { Memo } from "@/domain";
import { UserFactory, StockFactory, MemoFactory } from "../../factories";

describe("PrismaMemoRepository Integration", () => {
    let repository: PrismaMemoRepository;

    beforeAll(() => {
        repository = new PrismaMemoRepository(prismaTest);
    });

    describe("findById", () => {
        it("IDでメモを取得できる", async () => {
            // Arrange
            const user = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "7203" });
            const memo = await MemoFactory.create(prismaTest, {
                userId: user.id,
                stockCode: "7203",
                content: "テスト内容",
            });

            // Act
            const result = await repository.findById(memo.id);

            // Assert
            expect(result).not.toBeNull();
            expect(result?.id).toBe(memo.id);
            expect(result?.content.value).toBe("テスト内容");
        });

        it("存在しないIDはnullを返す", async () => {
            const result = await repository.findById("non-existent-id");
            expect(result).toBeNull();
        });
    });

    describe("findByUserId", () => {
        it("ユーザーのメモ一覧を取得できる", async () => {
            // Arrange
            const user = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "7203" });
            await MemoFactory.create(prismaTest, { userId: user.id, stockCode: "7203" });
            await MemoFactory.create(prismaTest, { userId: user.id, stockCode: "7203" });

            // Act
            const result = await repository.findByUserId(user.id, { page: 1, limit: 10 });

            // Assert
            expect(result.memos).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it("他のユーザーのメモは取得しない", async () => {
            // Arrange
            const user1 = await UserFactory.create(prismaTest);
            const user2 = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "7203" });
            await MemoFactory.create(prismaTest, { userId: user1.id, stockCode: "7203" });
            await MemoFactory.create(prismaTest, { userId: user2.id, stockCode: "7203" });

            // Act
            const result = await repository.findByUserId(user1.id, { page: 1, limit: 10 });

            // Assert
            expect(result.memos).toHaveLength(1);
            expect(result.memos[0].userId).toBe(user1.id);
        });

        it("非公開と公開のメモが正しく保存・取得される", async () => {
            // Arrange
            const user = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "9984", name: "SoftBank Group" });

            // 非公開メモ
            const privateMemo = Memo.create({
                id: "private-memo",
                userId: user.id,
                stockCode: "9984",
                content: "非公開メモ",
                visibility: "private",
            });
            await repository.save(privateMemo);

            // 公開メモ
            const publicMemo = Memo.create({
                id: "public-memo",
                userId: user.id,
                stockCode: "9984",
                content: "公開メモ",
                visibility: "public",
            });
            await repository.save(publicMemo);

            // Act
            const result = await repository.findByUserId(user.id);

            // Assert
            expect(result.memos).toHaveLength(2);

            const privateMemos = result.memos.filter(m => m.visibility.isPrivate);
            const publicMemos = result.memos.filter(m => m.visibility.isPublic);

            expect(privateMemos).toHaveLength(1);
            expect(publicMemos).toHaveLength(1);
        });
    });

    describe("save", () => {
        it("新規メモを保存できる", async () => {
            // Arrange
            const user = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "7203" });
            const memo = Memo.create({
                id: "new-memo-id",
                userId: user.id,
                stockCode: "7203",
                content: "新規メモ内容",
                title: "新規タイトル",
            });

            // Act
            await repository.save(memo);

            // Assert
            const saved = await prismaTest.memo.findUnique({ where: { id: memo.id } });
            expect(saved).not.toBeNull();
            expect(saved?.content).toBe("新規メモ内容");
        });
    });

    describe("delete", () => {
        it("メモを削除できる", async () => {
            // Arrange
            const user = await UserFactory.create(prismaTest);
            await StockFactory.create(prismaTest, { code: "7203" });
            const memo = await MemoFactory.create(prismaTest, { userId: user.id, stockCode: "7203" });

            // Act
            await repository.delete(memo.id);

            // Assert
            const deleted = await prismaTest.memo.findUnique({ where: { id: memo.id } });
            expect(deleted).toBeNull();
        });
    });
});
