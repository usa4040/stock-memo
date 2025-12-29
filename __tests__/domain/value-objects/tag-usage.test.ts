import { TagUsage } from "@/domain/value-objects/tag-usage";

describe("TagUsage", () => {
    describe("create", () => {
        it("正常な値でタグ使用状況を作成できる", () => {
            const tagUsage = TagUsage.create({
                tag: "高配当",
                count: 5,
            });

            expect(tagUsage.tag).toBe("高配当");
            expect(tagUsage.count).toBe(5);
        });

        it("空のタグはエラー", () => {
            expect(() => TagUsage.create({
                tag: "",
                count: 5,
            })).toThrow("タグ名は必須です");
        });

        it("負のカウントはエラー", () => {
            expect(() => TagUsage.create({
                tag: "高配当",
                count: -1,
            })).toThrow("カウントは0以上である必要があります");
        });

        it("空白のみのタグはエラー", () => {
            expect(() => TagUsage.create({
                tag: "   ",
                count: 5,
            })).toThrow("タグ名は必須です");
        });
    });

    describe("toPrimitive", () => {
        it("プリミティブなオブジェクトに変換できる", () => {
            const tagUsage = TagUsage.create({
                tag: "高配当",
                count: 5,
            });

            expect(tagUsage.toPrimitive()).toEqual({
                tag: "高配当",
                count: 5,
            });
        });
    });

    describe("比較", () => {
        it("同じタグと数で等価", () => {
            const tagUsage1 = TagUsage.create({ tag: "高配当", count: 5 });
            const tagUsage2 = TagUsage.create({ tag: "高配当", count: 5 });

            expect(tagUsage1.equals(tagUsage2)).toBe(true);
        });

        it("異なるタグは非等価", () => {
            const tagUsage1 = TagUsage.create({ tag: "高配当", count: 5 });
            const tagUsage2 = TagUsage.create({ tag: "成長株", count: 5 });

            expect(tagUsage1.equals(tagUsage2)).toBe(false);
        });

        it("異なるカウントは非等価", () => {
            const tagUsage1 = TagUsage.create({ tag: "高配当", count: 5 });
            const tagUsage2 = TagUsage.create({ tag: "高配当", count: 10 });

            expect(tagUsage1.equals(tagUsage2)).toBe(false);
        });
    });
});
