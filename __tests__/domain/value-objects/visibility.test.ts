import { Visibility } from "@/domain/value-objects/visibility";

describe("Visibility Value Object", () => {
    describe("static factory methods", () => {
        it("private()で非公開を作成できる", () => {
            const visibility = Visibility.private();
            expect(visibility.value).toBe("private");
            expect(visibility.isPrivate).toBe(true);
            expect(visibility.isPublic).toBe(false);
        });

        it("public()で公開を作成できる", () => {
            const visibility = Visibility.public();
            expect(visibility.value).toBe("public");
            expect(visibility.isPublic).toBe(true);
            expect(visibility.isPrivate).toBe(false);
        });
    });

    describe("fromString", () => {
        it("'public'文字列から公開Visibilityを作成できる", () => {
            const visibility = Visibility.fromString("public");
            expect(visibility.isPublic).toBe(true);
        });

        it("'private'文字列から非公開Visibilityを作成できる", () => {
            const visibility = Visibility.fromString("private");
            expect(visibility.isPrivate).toBe(true);
        });

        it("不正な文字列は非公開にフォールバックする", () => {
            const visibility = Visibility.fromString("invalid");
            expect(visibility.isPrivate).toBe(true);
        });

        it("空文字列は非公開にフォールバックする", () => {
            const visibility = Visibility.fromString("");
            expect(visibility.isPrivate).toBe(true);
        });
    });

    describe("isPublic / isPrivate", () => {
        it("公開時はisPublicがtrue、isPrivateがfalse", () => {
            const visibility = Visibility.public();
            expect(visibility.isPublic).toBe(true);
            expect(visibility.isPrivate).toBe(false);
        });

        it("非公開時はisPrivateがtrue、isPublicがfalse", () => {
            const visibility = Visibility.private();
            expect(visibility.isPrivate).toBe(true);
            expect(visibility.isPublic).toBe(false);
        });
    });

    describe("publish", () => {
        it("非公開から公開に変更できる", () => {
            const visibility = Visibility.private();
            const published = visibility.publish();

            expect(published.isPublic).toBe(true);
            // 元のオブジェクトは変更されない（イミュータブル）
            expect(visibility.isPrivate).toBe(true);
        });

        it("既に公開の場合はそのまま公開", () => {
            const visibility = Visibility.public();
            const published = visibility.publish();

            expect(published.isPublic).toBe(true);
        });
    });

    describe("unpublish", () => {
        it("公開から非公開に変更できる", () => {
            const visibility = Visibility.public();
            const unpublished = visibility.unpublish();

            expect(unpublished.isPrivate).toBe(true);
            // 元のオブジェクトは変更されない（イミュータブル）
            expect(visibility.isPublic).toBe(true);
        });

        it("既に非公開の場合はそのまま非公開", () => {
            const visibility = Visibility.private();
            const unpublished = visibility.unpublish();

            expect(unpublished.isPrivate).toBe(true);
        });
    });

    describe("equals", () => {
        it("同じ状態はtrueを返す", () => {
            const v1 = Visibility.public();
            const v2 = Visibility.public();
            expect(v1.equals(v2)).toBe(true);
        });

        it("異なる状態はfalseを返す", () => {
            const v1 = Visibility.public();
            const v2 = Visibility.private();
            expect(v1.equals(v2)).toBe(false);
        });
    });

    describe("toString", () => {
        it("公開時は'public'を返す", () => {
            const visibility = Visibility.public();
            expect(visibility.toString()).toBe("public");
        });

        it("非公開時は'private'を返す", () => {
            const visibility = Visibility.private();
            expect(visibility.toString()).toBe("private");
        });
    });
});
