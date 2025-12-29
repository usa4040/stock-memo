import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GetDashboardUseCase } from "@/application";
import { PrismaMemoRepository, PrismaStockRepository } from "@/infrastructure";

// リポジトリのインスタンス
const memoRepository = new PrismaMemoRepository(prisma);
const stockRepository = new PrismaStockRepository(prisma);

// GET /api/dashboard - ダッシュボードデータを取得（認証必要）
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        // ユースケースを使用
        const useCase = new GetDashboardUseCase(memoRepository, stockRepository);
        const result = await useCase.execute({
            userId: session.user.id,
        });

        // レスポンスを整形
        return NextResponse.json({
            statistics: result.statistics.toPrimitive(),
            pinnedMemos: result.pinnedMemos,
            recentMemos: result.recentMemos,
            topTags: result.topTags,
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return NextResponse.json(
            { error: "ダッシュボードの取得に失敗しました" },
            { status: 500 }
        );
    }
}
