import { Memo } from "../entities";

/**
 * メモリポジトリ インターフェース
 * 
 * メモの永続化を抽象化する
 * 実装はインフラ層で行う（Prisma等）
 */
export interface IMemoRepository {
    /**
     * IDでメモを取得
     */
    findById(id: string): Promise<Memo | null>;

    /**
     * ユーザーのメモ一覧を取得
     */
    findByUserId(
        userId: string,
        options?: {
            page?: number;
            limit?: number;
        }
    ): Promise<{
        memos: Memo[];
        total: number;
    }>;

    /**
     * 銘柄コードで公開メモを取得
     */
    findPublicByStockCode(
        stockCode: string,
        options?: {
            page?: number;
            limit?: number;
        }
    ): Promise<{
        memos: Memo[];
        total: number;
    }>;

    /**
     * メモを保存（作成・更新）
     */
    save(memo: Memo): Promise<void>;

    /**
     * メモを削除
     */
    delete(id: string): Promise<void>;

    /**
     * ユーザーのメモ数を取得
     */
    countByUserId(userId: string): Promise<number>;

    /**
     * ユーザーのメモをタグでフィルタリングして取得
     */
    findByUserIdAndTags(
        userId: string,
        tags: string[],
        options?: {
            page?: number;
            limit?: number;
        }
    ): Promise<{
        memos: Memo[];
        total: number;
    }>;

    /**
     * キーワードでメモを検索
     */
    searchByKeyword(
        userId: string,
        keyword: string,
        options?: {
            page?: number;
            limit?: number;
        }
    ): Promise<{
        memos: Memo[];
        total: number;
    }>;
}
