import { NextRequest, NextResponse } from 'next/server';
import { IngestionPipeline } from '@/lib/ingestion/pipeline';

export async function POST(req: NextRequest) {
  try {
    const pipeline = new IngestionPipeline();
    const result = await pipeline.runSync('admin_manual');

    return NextResponse.json({
      success: true,
      job: result,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
