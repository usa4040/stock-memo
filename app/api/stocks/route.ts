import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/stocks - 銘柄一覧を取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where = query
            ? {
                OR: [
                    { code: { contains: query } },
                    { name: { contains: query, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [stocks, total] = await Promise.all([
            prisma.stock.findMany({
                where,
                skip,
                take: limit,
                orderBy: { code: "asc" },
                select: {
                    code: true,
                    name: true,
                    marketSegment: true,
                    industry33Name: true,
                    scaleName: true,
                },
            }),
            prisma.stock.count({ where }),
        ]);

        return NextResponse.json({
            data: stocks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching stocks:", error);
        return NextResponse.json(
            { error: "銘柄の取得に失敗しました" },
            { status: 500 }
        );
    }
}
