import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GetStockUseCase } from "@/application";
import { PrismaStockRepository } from "@/infrastructure";

// リポジトリのインスタンス
const stockRepository = new PrismaStockRepository(prisma);

// GET /api/stocks/[code] - 銘柄詳細を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // ユースケースを使用
        const useCase = new GetStockUseCase(stockRepository);

        try {
            const stock = await useCase.execute({ code });

            // 公開メモと統計情報を追加で取得
            const [publicMemos, memoCount] = await Promise.all([
                prisma.memo.findMany({
                    where: {
                        stockCode: code,
                        visibility: "public",
                    },
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
                }),
                prisma.memo.count({
                    where: { stockCode: code },
                }),
            ]);

            return NextResponse.json({
                ...stock.toPrimitive(),
                memos: publicMemos,
                _count: { memos: memoCount },
            });
        } catch (domainError) {
            const message = (domainError as Error).message;
            if (message === "銘柄が見つかりません") {
                return NextResponse.json({ error: message }, { status: 404 });
            }
            throw domainError;
        }
    } catch (error) {
        console.error("Error fetching stock:", error);
        return NextResponse.json(
            { error: "銘柄の取得に失敗しました" },
            { status: 500 }
        );
    }
}
