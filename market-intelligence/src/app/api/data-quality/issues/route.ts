import { NextResponse } from 'next/server';
import { MarketPriceRepository } from '@/lib/db/repository';

export async function GET() {
  try {
    const repo = MarketPriceRepository.getInstance();
    const issues = await repo.getQualityIssues();
    const jobs = await repo.getJobs();

    return NextResponse.json({
      success: true,
      totalIssues: issues.length,
      issues,
      recentJobs: jobs.slice(0, 5),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
