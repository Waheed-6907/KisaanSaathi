import { describe, it, expect } from 'vitest';
import { MarketPriceRepository } from '../src/lib/db/repository';
import { IngestionPipeline } from '../src/lib/ingestion/pipeline';
import { VERIFIED_TELANGANA_RECORDS } from '../src/lib/ingestion/sample-data';

describe('Ingestion Pipeline & Idempotency', () => {
  it('prevents duplicate observations on repeated upserts (strict idempotency)', async () => {
    const repo = MarketPriceRepository.getInstance();
    const { total: initialCount } = await repo.getObservations({ limit: 1 });

    // Re-upsert the same batch of records
    const result = await repo.upsertObservations(VERIFIED_TELANGANA_RECORDS);
    const { total: countAfterUpsert } = await repo.getObservations({ limit: 1 });

    // The total count must not expand with duplicates!
    expect(countAfterUpsert).toBe(initialCount);
    expect(result.upserted).toBe(VERIFIED_TELANGANA_RECORDS.length);
  });

  it('runs sync pipeline and produces execution summary', async () => {
    const pipeline = new IngestionPipeline();
    const jobResult = await pipeline.runSync('admin_manual');

    expect(jobResult.status).toBe('success');
    expect(jobResult.recordsUpserted).toBeGreaterThan(0);
    expect(jobResult.summary).toBeDefined();
    expect(jobResult.durationMs).toBeGreaterThanOrEqual(0);
  });
});
