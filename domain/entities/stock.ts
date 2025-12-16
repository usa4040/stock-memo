/**
 * 銘柄 エンティティ
 * 
 * 日本株の銘柄情報を表す
 * 銘柄コードで識別される
 */
export class Stock {
    private readonly _code: string;
    private readonly _name: string;
    private readonly _marketSegment: string | null;
    private readonly _industry33Code: string | null;
    private readonly _industry33Name: string | null;
    private readonly _industry17Code: string | null;
    private readonly _industry17Name: string | null;
    private readonly _scaleCode: string | null;
    private readonly _scaleName: string | null;

    private constructor(props: {
        code: string;
        name: string;
        marketSegment: string | null;
        industry33Code: string | null;
        industry33Name: string | null;
        industry17Code: string | null;
        industry17Name: string | null;
        scaleCode: string | null;
        scaleName: string | null;
    }) {
        this._code = props.code;
        this._name = props.name;
        this._marketSegment = props.marketSegment;
        this._industry33Code = props.industry33Code;
        this._industry33Name = props.industry33Name;
        this._industry17Code = props.industry17Code;
        this._industry17Name = props.industry17Name;
        this._scaleCode = props.scaleCode;
        this._scaleName = props.scaleName;
    }

    /**
     * DBから銘柄を復元する
     */
    static reconstruct(props: {
        code: string;
        name: string;
        marketSegment: string | null;
        industry33Code: string | null;
        industry33Name: string | null;
        industry17Code: string | null;
        industry17Name: string | null;
        scaleCode: string | null;
        scaleName: string | null;
    }): Stock {
        return new Stock(props);
    }

    // ========== Getters ==========

    get code(): string {
        return this._code;
    }

    get name(): string {
        return this._name;
    }

    get marketSegment(): string | null {
        return this._marketSegment;
    }

    get industry33Code(): string | null {
        return this._industry33Code;
    }

    get industry33Name(): string | null {
        return this._industry33Name;
    }

    get industry17Code(): string | null {
        return this._industry17Code;
    }

    get industry17Name(): string | null {
        return this._industry17Name;
    }

    get scaleCode(): string | null {
        return this._scaleCode;
    }

    get scaleName(): string | null {
        return this._scaleName;
    }

    // ========== ビジネスロジック ==========

    /**
     * 銘柄名または銘柄コードが検索クエリにマッチするか
     */
    matchesQuery(query: string): boolean {
        const lowerQuery = query.toLowerCase();
        return (
            this._code.includes(query) ||
            this._name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * プリミティブなオブジェクトに変換（API用）
     */
    toPrimitive(): {
        code: string;
        name: string;
        marketSegment: string | null;
        industry33Code: string | null;
        industry33Name: string | null;
        industry17Code: string | null;
        industry17Name: string | null;
        scaleCode: string | null;
        scaleName: string | null;
    } {
        return {
            code: this._code,
            name: this._name,
            marketSegment: this._marketSegment,
            industry33Code: this._industry33Code,
            industry33Name: this._industry33Name,
            industry17Code: this._industry17Code,
            industry17Name: this._industry17Name,
            scaleCode: this._scaleCode,
            scaleName: this._scaleName,
        };
    }
}
