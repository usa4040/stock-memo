/**
 * タグ使用状況 値オブジェクト
 *
 * メモで使用されているタグとその使用回数を表す
 */
export class TagUsage {
    private constructor(
        private readonly _tag: string,
        private readonly _count: number,
    ) { }

    /**
     * タグ使用状況を作成
     */
    static create(props: { tag: string; count: number }): TagUsage {
        // バリデーション: タグ名は必須
        if (!props.tag || props.tag.trim() === "") {
            throw new Error("タグ名は必須です");
        }

        // バリデーション: カウントは0以上
        if (props.count < 0) {
            throw new Error("カウントは0以上である必要があります");
        }

        return new TagUsage(props.tag.trim(), props.count);
    }

    // ========== Getters ==========

    get tag(): string {
        return this._tag;
    }

    get count(): number {
        return this._count;
    }

    // ========== ビジネスロジック ==========

    /**
     * 他のTagUsageと等価かどうか
     */
    equals(other: TagUsage): boolean {
        return this._tag === other._tag && this._count === other._count;
    }

    /**
     * プリミティブなオブジェクトに変換（API用）
     */
    toPrimitive(): { tag: string; count: number } {
        return {
            tag: this._tag,
            count: this._count,
        };
    }
}
