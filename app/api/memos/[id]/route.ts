import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// メモ更新のバリデーションスキーマ
const updateMemoSchema = z.object({
    title: z.string().max(200, "タイトルは200文字以内で入力してください").optional(),
    content: z.string().min(1, "内容は必須です").max(10000, "内容は10000文字以内で入力してください").optional(),
    tags: z.array(z.string()).max(10, "タグは最大10個までです").optional(),
    pinned: z.boolean().optional(),
    visibility: z.enum(["private", "public"]).optional(),
});

// GET /api/memos/[id] - メモ詳細を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        const memo = await prisma.memo.findUnique({
            where: { id },
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

        if (!memo) {
            return NextResponse.json({ error: "メモが見つかりません" }, { status: 404 });
        }

        // 非公開メモは本人のみ閲覧可能
        if (memo.visibility === "private" && memo.userId !== session?.user?.id) {
            return NextResponse.json({ error: "アクセス権限がありません" }, { status: 403 });
        }

        return NextResponse.json(memo);
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

        // 既存メモの確認
        const existingMemo = await prisma.memo.findUnique({
            where: { id },
        });

        if (!existingMemo) {
            return NextResponse.json({ error: "メモが見つかりません" }, { status: 404 });
        }

        if (existingMemo.userId !== session.user.id) {
            return NextResponse.json({ error: "編集権限がありません" }, { status: 403 });
        }

        const body = await request.json();
        const validationResult = updateMemoSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "入力内容に問題があります", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const memo = await prisma.memo.update({
            where: { id },
            data: validationResult.data,
            include: {
                stock: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(memo);
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

        const existingMemo = await prisma.memo.findUnique({
            where: { id },
        });

        if (!existingMemo) {
            return NextResponse.json({ error: "メモが見つかりません" }, { status: 404 });
        }

        if (existingMemo.userId !== session.user.id) {
            return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
        }

        await prisma.memo.delete({
            where: { id },
        });

        return NextResponse.json({ message: "メモを削除しました" });
    } catch (error) {
        console.error("Error deleting memo:", error);
        return NextResponse.json(
            { error: "メモの削除に失敗しました" },
            { status: 500 }
        );
    }
}
