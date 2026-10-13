import { describe, it, expect } from 'vitest';
import { normalizeDate, normalizeGovernmentRecord } from '../src/lib/ingestion/normalizer';

describe('Data Ingestion Normalizer', () => {
  it('normalizes various date formats into ISO YYYY-MM-DD', () => {
    expect(normalizeDate('2026-10-13')).toBe('2026-10-13');
    expect(normalizeDate('13/10/2026')).toBe('2026-10-13');
    expect(normalizeDate('05-10-2026')).toBe('2026-10-05');
  });

  it('normalizes commodity and market aliases', () => {
    const raw = {
      state: 'Telangana',
      district: 'Warangal',
      market: 'Enumamula',
      commodity: 'Paddy(Dhan)(Common)',
      arrival_date: '13/10/2026',
      min_price: 2600,
      max_price: 2750,
      modal_price: 2700,
      arrivals: 3000
    };

    const result = normalizeGovernmentRecord(raw, 'AGMARKNET');
    expect(result.isValid).toBe(true);
    expect(result.observation?.commodityId).toBe('PADDY_COMMON');
    expect(result.observation?.marketId).toBe('TG_MKT_ENUMAMULA');
    expect(result.observation?.observationDate).toBe('2026-10-13');
    expect(result.observation?.modalPricePerKg).toBe(27);
  });

  it('detects min exceeding max and remedies by swapping with flag', () => {
    const raw = {
      state: 'Telangana',
      district: 'Nizamabad',
      market: 'Nizamabad',
      commodity: 'Turmeric',
      arrival_date: '2026-10-13',
      min_price: 15000, // min > max anomaly
      max_price: 13000,
      modal_price: 14000
    };

    const result = normalizeGovernmentRecord(raw, 'DATA_GOV_IN');
    expect(result.isValid).toBe(true);
    expect(result.observation?.minPrice).toBe(13000);
    expect(result.observation?.maxPrice).toBe(15000);
    expect(result.observation?.dataQualityFlags).toContain('MIN_EXCEEDS_MAX');
  });

  it('rejects negative prices outright', () => {
    const raw = {
      state: 'Telangana',
      district: 'Khammam',
      market: 'Khammam',
      commodity: 'Chilli Red',
      arrival_date: '2026-10-13',
      min_price: -500,
      max_price: 18000,
      modal_price: 17000
    };

    const result = normalizeGovernmentRecord(raw, 'AGMARKNET');
    expect(result.isValid).toBe(false);
    expect(result.qualityIssues[0].type).toBe('NEGATIVE_PRICE');
  });
});
