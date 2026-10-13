import { NextRequest, NextResponse } from 'next/server';
import { MarketPriceRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityId = searchParams.get('commodityId') || 'PADDY_COMMON';
    const date = searchParams.get('date') || undefined;

    const repo = MarketPriceRepository.getInstance();
    const comparison = await repo.compareMarkets(commodityId, date);

    return NextResponse.json({
      success: true,
      comparison,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
