import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // prisma.ts を使う

// GET /api/stocks
export async function GET() {
    try {
        const stocks = await prisma.stock.findMany({
            take: 100, // まずは上限100件（後でページング追加）
            orderBy: { code: 'asc' },
        });

        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
    }
}
