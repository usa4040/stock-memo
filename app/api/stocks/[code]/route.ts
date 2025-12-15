import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/stocks/[code] - 銘柄詳細を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const stock = await prisma.stock.findUnique({
            where: { code },
            include: {
                memos: {
                    where: { visibility: "public" },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        tags: true,
                        createdAt: true,
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { memos: true },
                },
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "銘柄が見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json(stock);
    } catch (error) {
        console.error("Error fetching stock:", error);
        return NextResponse.json(
            { error: "銘柄の取得に失敗しました" },
            { status: 500 }
        );
    }
}
