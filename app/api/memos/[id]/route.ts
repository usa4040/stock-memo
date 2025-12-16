import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
    GetMemoUseCase,
    UpdateMemoUseCase,
    DeleteMemoUseCase,
} from "@/application";
import { PrismaMemoRepository } from "@/infrastructure";

// リポジトリのインスタンス
const memoRepository = new PrismaMemoRepository(prisma);

// GET /api/memos/[id] - メモ詳細を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        // ユースケースを使用（権限チェックはドメイン層で実行）
        const useCase = new GetMemoUseCase(memoRepository);

        try {
            const memo = await useCase.execute({
                memoId: id,
                userId: session?.user?.id || null,
            });

            // 銘柄・ユーザー情報を含めて返す
            const memoWithDetails = await prisma.memo.findUnique({
                where: { id: memo.id },
                include: {
                    stock: {
                        select: {
                            code: true,
                            name: true,
                            marketSegment: true,
                            industry33Name: true,
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
            });

            return NextResponse.json(memoWithDetails);
        } catch (domainError) {
            const message = (domainError as Error).message;
            if (message === "メモが見つかりません") {
                return NextResponse.json({ error: message }, { status: 404 });
            }
            if (message === "アクセス権限がありません") {
                return NextResponse.json({ error: message }, { status: 403 });
            }
            throw domainError;
        }
    } catch (error) {
        console.error("Error fetching memo:", error);
        return NextResponse.json(
            { error: "メモの取得に失敗しました" },
            { status: 500 }
        );
    }
}

// PATCH /api/memos/[id] - メモを更新
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // ユースケースを使用（権限チェック・バリデーションはドメイン層で実行）
        const useCase = new UpdateMemoUseCase(memoRepository);

        try {
            const memo = await useCase.execute({
                memoId: id,
                userId: session.user.id,
                title: body.title,
                content: body.content,
                tags: body.tags,
                pinned: body.pinned,
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

            return NextResponse.json(memoWithStock);
        } catch (domainError) {
            const message = (domainError as Error).message;
            if (message === "メモが見つかりません") {
                return NextResponse.json({ error: message }, { status: 404 });
            }
            if (message === "編集権限がありません") {
                return NextResponse.json({ error: message }, { status: 403 });
            }
            // バリデーションエラー
            return NextResponse.json({ error: message }, { status: 400 });
        }
    } catch (error) {
        console.error("Error updating memo:", error);
        return NextResponse.json(
            { error: "メモの更新に失敗しました" },
            { status: 500 }
        );
    }
}

// DELETE /api/memos/[id] - メモを削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { id } = await params;

        // ユースケースを使用（権限チェックはドメイン層で実行）
        const useCase = new DeleteMemoUseCase(memoRepository);

        try {
            await useCase.execute({
                memoId: id,
                userId: session.user.id,
            });

            return NextResponse.json({ message: "メモを削除しました" });
        } catch (domainError) {
            const message = (domainError as Error).message;
            if (message === "メモが見つかりません") {
                return NextResponse.json({ error: message }, { status: 404 });
            }
            if (message === "削除権限がありません") {
                return NextResponse.json({ error: message }, { status: 403 });
            }
            throw domainError;
        }
    } catch (error) {
        console.error("Error deleting memo:", error);
        return NextResponse.json(
            { error: "メモの削除に失敗しました" },
            { status: 500 }
        );
    }
}
