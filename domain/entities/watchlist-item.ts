import { StockCode } from "../value-objects";

/**
 * ウォッチリストアイテム エンティティ
 * 
 * ユーザーがウォッチしている銘柄を表す
 * IDで識別される
 */
export class WatchlistItem {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _stockCode: StockCode;
    private _note: string | null;
    private readonly _createdAt: Date;

    private constructor(props: {
        id: string;
        userId: string;
        stockCode: StockCode;
        note: string | null;
        createdAt: Date;
    }) {
        this._id = props.id;
        this._userId = props.userId;
        this._stockCode = props.stockCode;
        this._note = props.note;
        this._createdAt = props.createdAt;
    }

    /**
     * 新しいウォッチリストアイテムを作成する
     */
    static create(props: {
        id: string;
        userId: string;
        stockCode: string;
        note?: string;
    }): WatchlistItem {
        return new WatchlistItem({
            id: props.id,
            userId: props.userId,
            stockCode: StockCode.create(props.stockCode),
            note: props.note || null,
            createdAt: new Date(),
        });
    }

    /**
     * DBからウォッチリストアイテムを復元する
     */
    static reconstruct(props: {
        id: string;
        userId: string;
        stockCode: string;
        note: string | null;
        createdAt: Date;
    }): WatchlistItem {
        return new WatchlistItem({
            id: props.id,
            userId: props.userId,
            stockCode: StockCode.reconstruct(props.stockCode),
            note: props.note,
            createdAt: props.createdAt,
        });
    }

    // ========== Getters ==========

    get id(): string {
        return this._id;
    }

    get userId(): string {
        return this._userId;
    }

    get stockCode(): StockCode {
        return this._stockCode;
    }

    get note(): string | null {
        return this._note;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    // ========== ビジネスロジック ==========

    /**
     * 指定したユーザーが所有者かどうか
     */
    isOwnedBy(userId: string): boolean {
        return this._userId === userId;
    }

    /**
     * メモを更新する
     */
    updateNote(note: string | null): void {
        this._note = note;
    }

    /**
     * プリミティブなオブジェクトに変換（API用）
     */
    toPrimitive(): {
        id: string;
        userId: string;
        stockCode: string;
        note: string | null;
        createdAt: Date;
    } {
        return {
            id: this._id,
            userId: this._userId,
            stockCode: this._stockCode.value,
            note: this._note,
            createdAt: this._createdAt,
        };
    }
}
