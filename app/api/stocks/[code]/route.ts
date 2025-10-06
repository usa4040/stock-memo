import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/stocks/[code]
export async function GET(
    _request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const { code } = params;

        const stock = await prisma.stock.findUnique({
            where: { code },
        });

        if (!stock) {
            return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
        }

        return NextResponse.json(stock);
    } catch (error) {
        console.error('Error fetching stock detail:', error);
        return NextResponse.json({ error: 'Failed to fetch stock detail' }, { status: 500 });
    }
}
