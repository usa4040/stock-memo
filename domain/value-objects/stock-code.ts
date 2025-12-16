/**
 * 銘柄コード バリューオブジェクト
 * 
 * 4桁の数字で構成される銘柄コードを表す
 * 不変（immutable）で、値で比較される
 */
export class StockCode {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    /**
     * 銘柄コードを作成する
     * @throws 4桁でない場合はエラー
     */
    static create(value: string): StockCode {
        if (!StockCode.isValid(value)) {
            throw new Error("銘柄コードは4桁の数字で入力してください");
        }
        return new StockCode(value);
    }

    /**
     * 既存の銘柄コードから復元する（DBからの読み込み時など）
     * バリデーションをスキップ
     */
    static reconstruct(value: string): StockCode {
        return new StockCode(value);
    }

    /**
     * 銘柄コードの妥当性をチェック
     */
    static isValid(value: string): boolean {
        return /^\d{4}$/.test(value);
    }

    get value(): string {
        return this._value;
    }

    /**
     * 等価性の比較
     */
    equals(other: StockCode): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}
