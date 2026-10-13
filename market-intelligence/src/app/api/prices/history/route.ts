import { NextRequest, NextResponse } from 'next/server';
import { MarketPriceRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityId = searchParams.get('commodityId') || 'PADDY_COMMON';
    const marketId = searchParams.get('marketId') || 'TG_MKT_ENUMAMULA';

    const repo = MarketPriceRepository.getInstance();
    const trend = await repo.getPriceTrend(commodityId, marketId);

    return NextResponse.json({
      success: true,
      data: trend,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
