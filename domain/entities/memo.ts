import { StockCode, MemoContent, Visibility, VisibilityValue } from "../value-objects";

/**
 * メモ エンティティ
 * 
 * ユーザーが銘柄に対して作成するメモを表す
 * IDで識別される
 */
export class Memo {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _stockCode: StockCode;
    private _title: string | null;
    private _content: MemoContent;
    private _tags: string[];
    private _pinned: boolean;
    private _visibility: Visibility;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    private constructor(props: {
        id: string;
        userId: string;
        stockCode: StockCode;
        title: string | null;
        content: MemoContent;
        tags: string[];
        pinned: boolean;
        visibility: Visibility;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this._id = props.id;
        this._userId = props.userId;
        this._stockCode = props.stockCode;
        this._title = props.title;
        this._content = props.content;
        this._tags = [...props.tags];
        this._pinned = props.pinned;
        this._visibility = props.visibility;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
    }

    /**
     * 新しいメモを作成する
     */
    static create(props: {
        id: string;
        userId: string;
        stockCode: string;
        content: string;
        title?: string;
        tags?: string[];
        visibility?: VisibilityValue;
    }): Memo {
        const now = new Date();
        return new Memo({
            id: props.id,
            userId: props.userId,
            stockCode: StockCode.create(props.stockCode),
            title: props.title || null,
            content: MemoContent.create(props.content),
            tags: props.tags || [],
            pinned: false,
            visibility: Visibility.fromString(props.visibility || "private"),
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * DBからメモを復元する
     */
    static reconstruct(props: {
        id: string;
        userId: string;
        stockCode: string;
        title: string | null;
        content: string;
        tags: string[];
        pinned: boolean;
        visibility: string;
        createdAt: Date;
        updatedAt: Date;
    }): Memo {
        return new Memo({
            id: props.id,
            userId: props.userId,
            stockCode: StockCode.reconstruct(props.stockCode),
            title: props.title,
            content: MemoContent.reconstruct(props.content),
            tags: props.tags,
            pinned: props.pinned,
            visibility: Visibility.fromString(props.visibility),
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
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

    get title(): string | null {
        return this._title;
    }

    get content(): MemoContent {
        return this._content;
    }

    get tags(): readonly string[] {
        return this._tags;
    }

    get pinned(): boolean {
        return this._pinned;
    }

    get visibility(): Visibility {
        return this._visibility;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    // ========== ビジネスロジック ==========

    /**
     * このメモの所有者かどうか確認
     */
    isOwnedBy(userId: string): boolean {
        return this._userId === userId;
    }

    /**
     * このユーザーが閲覧可能か確認
     */
    canBeViewedBy(userId: string | null): boolean {
        // 公開メモは誰でも閲覧可能
        if (this._visibility.isPublic) {
            return true;
        }
        // 非公開メモは所有者のみ
        return userId !== null && this.isOwnedBy(userId);
    }

    /**
     * タイトルを更新
     */
    updateTitle(title: string | null): void {
        this._title = title;
        this._updatedAt = new Date();
    }

    /**
     * 内容を更新
     */
    updateContent(content: string): void {
        this._content = MemoContent.create(content);
        this._updatedAt = new Date();
    }

    /**
     * タグを更新
     */
    updateTags(tags: string[]): void {
        if (tags.length > 10) {
            throw new Error("タグは最大10個までです");
        }
        this._tags = [...tags];
        this._updatedAt = new Date();
    }

    /**
     * ピン留めする
     */
    pin(): void {
        this._pinned = true;
        this._updatedAt = new Date();
    }

    /**
     * ピン留めを解除
     */
    unpin(): void {
        this._pinned = false;
        this._updatedAt = new Date();
    }

    /**
     * ピン留め状態を切り替え
     */
    togglePin(): void {
        this._pinned = !this._pinned;
        this._updatedAt = new Date();
    }

    /**
     * 公開する
     */
    publish(): void {
        this._visibility = Visibility.public();
        this._updatedAt = new Date();
    }

    /**
     * 非公開にする
     */
    unpublish(): void {
        this._visibility = Visibility.private();
        this._updatedAt = new Date();
    }

    /**
     * プリミティブなオブジェクトに変換（API/DB用）
     */
    toPrimitive(): {
        id: string;
        userId: string;
        stockCode: string;
        title: string | null;
        content: string;
        tags: string[];
        pinned: boolean;
        visibility: string;
        createdAt: Date;
        updatedAt: Date;
    } {
        return {
            id: this._id,
            userId: this._userId,
            stockCode: this._stockCode.value,
            title: this._title,
            content: this._content.value,
            tags: [...this._tags],
            pinned: this._pinned,
            visibility: this._visibility.value,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
