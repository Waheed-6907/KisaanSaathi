import { NextRequest, NextResponse } from 'next/server';
import { PricingEngine } from '@/lib/pricing/engine';
import { NetReturnCalculationInputSchema } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = NetReturnCalculationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const engine = new PricingEngine();
    const result = await engine.calculateNetReturn(parsed.data);

    return NextResponse.json({
      success: true,
      calculation: result,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
