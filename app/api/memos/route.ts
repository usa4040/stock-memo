import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// メモ作成のバリデーションスキーマ
const createMemoSchema = z.object({
    stockCode: z.string().min(1, "銘柄コードは必須です"),
    title: z.string().max(200, "タイトルは200文字以内で入力してください").optional(),
    content: z.string().min(1, "内容は必須です").max(10000, "内容は10000文字以内で入力してください"),
    tags: z.array(z.string()).max(10, "タグは最大10個までです").optional(),
    visibility: z.enum(["private", "public"]).optional(),
});

// GET /api/memos - メモ一覧を取得（認証必要）
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const stockCode = searchParams.get("stockCode");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const pinned = searchParams.get("pinned");
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            userId: session.user.id,
        };

        if (stockCode) {
            where.stockCode = stockCode;
        }

        if (pinned === "true") {
            where.pinned = true;
        }

        const [memos, total] = await Promise.all([
            prisma.memo.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
                include: {
                    stock: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.memo.count({ where }),
        ]);

        return NextResponse.json({
            data: memos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
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
        const validationResult = createMemoSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "入力内容に問題があります", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { stockCode, title, content, tags, visibility } = validationResult.data;

        // 銘柄の存在確認
        const stock = await prisma.stock.findUnique({
            where: { code: stockCode },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "指定された銘柄が見つかりません" },
                { status: 404 }
            );
        }

        const memo = await prisma.memo.create({
            data: {
                userId: session.user.id,
                stockCode,
                title,
                content,
                tags: tags || [],
                visibility: visibility || "private",
            },
            include: {
                stock: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(memo, { status: 201 });
    } catch (error) {
        console.error("Error creating memo:", error);
        return NextResponse.json(
            { error: "メモの作成に失敗しました" },
            { status: 500 }
        );
    }
}
