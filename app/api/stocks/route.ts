import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SearchStocksUseCase } from "@/application";
import { PrismaStockRepository } from "@/infrastructure";

// リポジトリのインスタンス
const stockRepository = new PrismaStockRepository(prisma);

// GET /api/stocks - 銘柄一覧を取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || undefined;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // ユースケースを使用
        const useCase = new SearchStocksUseCase(stockRepository);
        const result = await useCase.execute({
            query,
            page,
            limit,
        });

        return NextResponse.json({
            data: result.stocks.map((s) => s.toPrimitive()),
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Error fetching stocks:", error);
        return NextResponse.json(
            { error: "銘柄の取得に失敗しました" },
            { status: 500 }
        );
    }
}
