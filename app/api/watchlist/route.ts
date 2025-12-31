import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { AddToWatchlistUseCase, ListWatchlistUseCase } from "@/application";
import { PrismaWatchlistRepository, PrismaStockRepository } from "@/infrastructure";

// リポジトリのインスタンス
const watchlistRepository = new PrismaWatchlistRepository(prisma);
const stockRepository = new PrismaStockRepository(prisma);

// GET /api/watchlist - ウォッチリスト取得
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const useCase = new ListWatchlistUseCase(watchlistRepository);
        const result = await useCase.execute({ userId: session.user.id });

        // 銘柄情報を取得して付与
        const stockCodes = result.items.map((item) => item.stockCode.value);
        const stocks = await prisma.stock.findMany({
            where: { code: { in: stockCodes } },
            select: { code: true, name: true },
        });
        const stockMap = new Map(stocks.map((s) => [s.code, s.name]));

        const data = result.items.map((item) => ({
            ...item.toPrimitive(),
            stockName: stockMap.get(item.stockCode.value) || item.stockCode.value,
        }));

        return NextResponse.json({ data, total: result.total });
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        return NextResponse.json(
            { error: "ウォッチリストの取得に失敗しました" },
            { status: 500 }
        );
    }
}

// POST /api/watchlist - ウォッチリストに追加
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const body = await request.json();

        const useCase = new AddToWatchlistUseCase(watchlistRepository, stockRepository);

        try {
            const item = await useCase.execute({
                userId: session.user.id,
                stockCode: body.stockCode,
                note: body.note,
            });

            // 銘柄情報を取得
            const stock = await prisma.stock.findUnique({
                where: { code: item.stockCode.value },
                select: { name: true },
            });

            return NextResponse.json({
                ...item.toPrimitive(),
                stockName: stock?.name || item.stockCode.value,
            }, { status: 201 });
        } catch (domainError) {
            return NextResponse.json(
                { error: (domainError as Error).message },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return NextResponse.json(
            { error: "ウォッチリストへの追加に失敗しました" },
            { status: 500 }
        );
    }
}
