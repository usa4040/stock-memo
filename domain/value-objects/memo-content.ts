/**
 * メモ内容 バリューオブジェクト
 * 
 * 1〜10000文字のメモ内容を表す
 * 不変（immutable）
 */
export class MemoContent {
    private readonly _value: string;

    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 10000;

    private constructor(value: string) {
        this._value = value;
    }

    /**
     * メモ内容を作成する
     * @throws 空または10000文字超の場合はエラー
     */
    static create(value: string): MemoContent {
        const trimmed = value.trim();

        if (trimmed.length < MemoContent.MIN_LENGTH) {
            throw new Error("メモ内容は必須です");
        }

        if (trimmed.length > MemoContent.MAX_LENGTH) {
            throw new Error(`メモ内容は${MemoContent.MAX_LENGTH}文字以内で入力してください`);
        }

        return new MemoContent(trimmed);
    }

    /**
     * 既存のメモ内容から復元する
     */
    static reconstruct(value: string): MemoContent {
        return new MemoContent(value);
    }

    get value(): string {
        return this._value;
    }

    get length(): number {
        return this._value.length;
    }

    /**
     * 内容の一部を取得（プレビュー用）
     */
    preview(maxLength: number = 150): string {
        if (this._value.length <= maxLength) {
            return this._value;
        }
        return this._value.slice(0, maxLength) + "...";
    }

    equals(other: MemoContent): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}
