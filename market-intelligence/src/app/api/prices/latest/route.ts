import { NextRequest, NextResponse } from 'next/server';
import { MarketPriceRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityId = searchParams.get('commodityId') || undefined;
    const districtId = searchParams.get('districtId') || undefined;
    const marketId = searchParams.get('marketId') || undefined;
    const stateId = searchParams.get('stateId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const repo = MarketPriceRepository.getInstance();
    const { records, total } = await repo.getObservations({
      commodityId,
      districtId,
      marketId,
      stateId,
      startDate,
      endDate,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      records,
      metadata: {
        queriedAt: new Date().toISOString(),
        stateScope: 'Telangana',
        dataSourceAttribution: 'Agmarknet / DMI Government of India'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
