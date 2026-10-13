import { NextResponse } from 'next/server';
import { ConnectorRegistry } from '@/lib/connectors';
import { MarketPriceRepository } from '@/lib/db/repository';

export async function GET() {
  const startTime = Date.now();
  const repo = MarketPriceRepository.getInstance();
  const connectors = ConnectorRegistry.getInstance();

  const connectorHealths = await connectors.checkAllHealth();
  const { total } = await repo.getObservations({ limit: 1 });
  const jobs = await repo.getJobs();
  const latestJob = jobs.length > 0 ? jobs[0] : null;

  return NextResponse.json({
    status: 'healthy',
    service: 'Kisan Sathi Market Intelligence',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Supabase PostgreSQL' : 'Resilient In-Memory Buffer',
      totalObservationsTracked: total,
      lastSyncAt: latestJob?.completedAt || null,
      lastSyncStatus: latestJob?.status || null
    },
    connectors: connectorHealths,
    latencyMs: Date.now() - startTime,
    timestamp: new Date().toISOString()
  });
}
