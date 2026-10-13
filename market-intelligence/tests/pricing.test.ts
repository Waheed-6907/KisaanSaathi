import { describe, it, expect } from 'vitest';
import { 
  convertQuantityToQuintals, 
  convertQuintalsToKg, 
  PricingEngine 
} from '../src/lib/pricing/engine';

describe('Pricing Engine & Unit Conversions', () => {
  it('converts units to quintals accurately', () => {
    expect(convertQuantityToQuintals(10, 'Quintal')).toBe(10);
    expect(convertQuantityToQuintals(500, 'Kg')).toBe(5);
    expect(convertQuantityToQuintals(2, 'Tonne')).toBe(20);
  });

  it('converts quintals to kilograms accurately', () => {
    expect(convertQuintalsToKg(15)).toBe(1500);
    expect(convertQuintalsToKg(0.5)).toBe(50);
  });

  it('rejects negative quantities', () => {
    expect(() => convertQuantityToQuintals(-5, 'Quintal')).toThrow('Quantity cannot be negative');
  });

  it('calculates deterministic gross value and net return with itemized deductions', async () => {
    const engine = new PricingEngine();
    const result = await engine.calculateNetReturn({
      commodityId: 'PADDY_COMMON',
      marketId: 'TG_MKT_ENUMAMULA',
      quantity: 50,
      quantityUnit: 'Quintal',
      customPricePerQuintal: 2700,
      transportCostPerQuintal: 45,
      baggingLaborCostPerQuintal: 25,
      mandiCessPercent: 1.0,
      otherCostsInr: 0
    });

    expect(result.grossEstimatedValueInr).toBe(135000); // 50 * 2700
    expect(result.transportCostInr).toBe(2250); // 50 * 45
    expect(result.baggingCostInr).toBe(1250); // 50 * 25
    expect(result.mandiCessInr).toBe(1350); // 1% of 135000
    expect(result.totalDeductionsInr).toBe(4850); // 2250 + 1250 + 1350
    expect(result.netEstimatedReturnInr).toBe(130150); // 135000 - 4850
    expect(result.effectiveNetPricePerQuintal).toBe(2603); // 130150 / 50
    expect(result.effectiveNetPricePerKg).toBe(26.03);
  });
});
