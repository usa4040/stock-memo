import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RemoveFromWatchlistUseCase, CheckWatchlistUseCase } from "@/application";
import { PrismaWatchlistRepository } from "@/infrastructure";

// リポジトリのインスタンス
const watchlistRepository = new PrismaWatchlistRepository(prisma);

// GET /api/watchlist/[stockCode] - ウォッチ状態確認
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stockCode: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { stockCode } = await params;

        const useCase = new CheckWatchlistUseCase(watchlistRepository);
        const result = await useCase.execute({
            userId: session.user.id,
            stockCode,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error checking watchlist:", error);
        return NextResponse.json(
            { error: "ウォッチ状態の確認に失敗しました" },
            { status: 500 }
        );
    }
}

// DELETE /api/watchlist/[stockCode] - ウォッチリストから削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ stockCode: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { stockCode } = await params;

        const useCase = new RemoveFromWatchlistUseCase(watchlistRepository);

        try {
            await useCase.execute({
                userId: session.user.id,
                stockCode,
            });

            return NextResponse.json({ success: true });
        } catch (domainError) {
            return NextResponse.json(
                { error: (domainError as Error).message },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return NextResponse.json(
            { error: "ウォッチリストからの削除に失敗しました" },
            { status: 500 }
        );
    }
}
