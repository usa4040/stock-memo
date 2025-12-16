/**
 * 公開設定 バリューオブジェクト
 * 
 * private（非公開）または public（公開）を表す
 */
export type VisibilityValue = "private" | "public";

export class Visibility {
    private readonly _value: VisibilityValue;

    private constructor(value: VisibilityValue) {
        this._value = value;
    }

    /**
     * 非公開で作成（デフォルト）
     */
    static private(): Visibility {
        return new Visibility("private");
    }

    /**
     * 公開で作成
     */
    static public(): Visibility {
        return new Visibility("public");
    }

    /**
     * 文字列から作成
     */
    static fromString(value: string): Visibility {
        if (value === "public") {
            return Visibility.public();
        }
        return Visibility.private();
    }

    get value(): VisibilityValue {
        return this._value;
    }

    get isPublic(): boolean {
        return this._value === "public";
    }

    get isPrivate(): boolean {
        return this._value === "private";
    }

    /**
     * 公開に変更
     */
    publish(): Visibility {
        return Visibility.public();
    }

    /**
     * 非公開に変更
     */
    unpublish(): Visibility {
        return Visibility.private();
    }

    equals(other: Visibility): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}
