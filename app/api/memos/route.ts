import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
    CreateMemoUseCase,
    ListUserMemosUseCase,
    FilterMemosByTagsUseCase,
    SearchMemosUseCase,
} from "@/application";
import { PrismaMemoRepository } from "@/infrastructure";

// リポジトリのインスタンス
const memoRepository = new PrismaMemoRepository(prisma);

// GET /api/memos - メモ一覧を取得（認証必要）
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const tagsParam = searchParams.get("tags");
        const keyword = searchParams.get("q");

        // キーワードで検索する場合
        if (keyword && keyword.trim()) {
            const searchUseCase = new SearchMemosUseCase(memoRepository);
            const result = await searchUseCase.execute({
                userId: session.user.id,
                keyword,
                page,
                limit,
            });

            // 銘柄情報を追加で取得
            const memoIds = result.memos.map((m) => m.id);
            const memosWithStock = await prisma.memo.findMany({
                where: { id: { in: memoIds } },
                include: {
                    stock: { select: { code: true, name: true } },
                },
                orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
            });

            return NextResponse.json({
                data: memosWithStock,
                pagination: result.pagination,
            });
        }

        // タグでフィルタリングする場合
        if (tagsParam) {
            const tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);

            if (tags.length > 0) {
                const filterUseCase = new FilterMemosByTagsUseCase(memoRepository);
                const result = await filterUseCase.execute({
                    userId: session.user.id,
                    tags,
                    page,
                    limit,
                });

                // 銘柄情報を追加で取得
                const memoIds = result.memos.map((m) => m.id);
                const memosWithStock = await prisma.memo.findMany({
                    where: { id: { in: memoIds } },
                    include: {
                        stock: { select: { code: true, name: true } },
                    },
                    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
                });

                return NextResponse.json({
                    data: memosWithStock,
                    pagination: result.pagination,
                });
            }
        }

        // 通常の一覧取得
        const useCase = new ListUserMemosUseCase(memoRepository);
        const result = await useCase.execute({
            userId: session.user.id,
            page,
            limit,
        });

        // 銘柄情報を追加で取得（表示用）
        const memoIds = result.memos.map((m) => m.id);
        const memosWithStock = await prisma.memo.findMany({
            where: { id: { in: memoIds } },
            include: {
                stock: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        });

        return NextResponse.json({
            data: memosWithStock,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Error fetching memos:", error);
        return NextResponse.json(
            { error: "メモの取得に失敗しました" },
            { status: 500 }
        );
    }
}

// POST /api/memos - メモを作成（認証必要）
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const body = await request.json();

        // 銘柄の存在確認
        const stock = await prisma.stock.findUnique({
            where: { code: body.stockCode },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "指定された銘柄が見つかりません" },
                { status: 404 }
            );
        }

        // ユースケースを使用（バリデーションはドメイン層で実行）
        const useCase = new CreateMemoUseCase(memoRepository);

        try {
            const memo = await useCase.execute({
                userId: session.user.id,
                stockCode: body.stockCode,
                content: body.content,
                title: body.title,
                tags: body.tags,
                visibility: body.visibility,
            });

            // 銘柄情報を含めて返す
            const memoWithStock = await prisma.memo.findUnique({
                where: { id: memo.id },
                include: {
                    stock: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            });

            return NextResponse.json(memoWithStock, { status: 201 });
        } catch (domainError) {
            // ドメイン層のバリデーションエラー
            return NextResponse.json(
                { error: (domainError as Error).message },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error creating memo:", error);
        return NextResponse.json(
            { error: "メモの作成に失敗しました" },
            { status: 500 }
        );
    }
}
