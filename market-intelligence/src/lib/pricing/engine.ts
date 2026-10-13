import { 
  NetReturnCalculationInput, 
  NetReturnCalculationResult,
  MarketObservation 
} from '../types';
import { MarketPriceRepository } from '../db/repository';

// Official Govt MSP Reference (2024-2026 Kharif/Rabi Marketing Season, Rs/Quintal)
export const OFFICIAL_MSP_TABLE: Record<string, number> = {
  'PADDY_COMMON': 2300.00,
  'PADDY_GRADE_A': 2320.00,
  'COTTON': 7121.00,
  'MAIZE': 2225.00,
  'BENGAL_GRAM': 5650.00,
  'RED_GRAM': 7550.00,
  'SOYABEAN': 4892.00,
};

/**
 * Validated Unit Conversion
 */
export function convertQuantityToQuintals(quantity: number, unit: 'Quintal' | 'Kg' | 'Tonne'): number {
  if (quantity < 0) throw new Error('Quantity cannot be negative');
  switch (unit) {
    case 'Quintal':
      return quantity;
    case 'Kg':
      return Number((quantity / 100).toFixed(4));
    case 'Tonne':
      return Number((quantity * 10).toFixed(4));
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

export function convertQuintalsToKg(quintals: number): number {
  return Number((quintals * 100).toFixed(2));
}

export class PricingEngine {
  private repo: MarketPriceRepository;

  constructor(repo?: MarketPriceRepository) {
    this.repo = repo || MarketPriceRepository.getInstance();
  }

  /**
   * Deterministic Net Return & Gross Value Calculation
   */
  async calculateNetReturn(input: NetReturnCalculationInput): Promise<NetReturnCalculationResult> {
    const observation = await this.repo.getLatestPrice(input.commodityId, input.marketId);

    if (!observation) {
      throw new Error(`No verified price observation found for commodity ${input.commodityId} in market ${input.marketId}`);
    }

    const pricePerQuintal = input.customPricePerQuintal || observation.modalPrice;
    const totalQuintals = convertQuantityToQuintals(input.quantity, input.quantityUnit);
    const totalKg = convertQuintalsToKg(totalQuintals);

    // 1. Gross Estimated Value
    const grossEstimatedValueInr = Number((totalQuintals * pricePerQuintal).toFixed(2));

    // 2. Itemized Selling Costs
    const transportCostInr = Number((totalQuintals * (input.transportCostPerQuintal ?? 45)).toFixed(2));
    const baggingCostInr = Number((totalQuintals * (input.baggingLaborCostPerQuintal ?? 25)).toFixed(2));
    const mandiCessInr = Number(((grossEstimatedValueInr * (input.mandiCessPercent ?? 1.0)) / 100).toFixed(2));
    const otherCostsInr = Number((input.otherCostsInr || 0).toFixed(2));

    const totalDeductionsInr = Number((transportCostInr + baggingCostInr + mandiCessInr + otherCostsInr).toFixed(2));
    const netEstimatedReturnInr = Number((grossEstimatedValueInr - totalDeductionsInr).toFixed(2));

    const effectiveNetPricePerQuintal = totalQuintals > 0 
      ? Number((netEstimatedReturnInr / totalQuintals).toFixed(2)) 
      : 0;
    const effectiveNetPricePerKg = Number((effectiveNetPricePerQuintal / 100).toFixed(2));

    // 3. Official MSP Comparison
    const msp = OFFICIAL_MSP_TABLE[input.commodityId] || null;
    let isAboveMsp: boolean | null = null;
    let diffPercent: number | null = null;

    if (msp !== null && msp > 0) {
      isAboveMsp = pricePerQuintal >= msp;
      diffPercent = Number((((pricePerQuintal - msp) / msp) * 100).toFixed(2));
    }

    // 4. Provenance & Freshness metadata
    const obsDate = new Date(observation.observationDate);
    const today = new Date();
    const diffMs = Math.max(0, today.getTime() - obsDate.getTime());
    const dataAgeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isStale = dataAgeDays > 2;

    return {
      commodityId: input.commodityId,
      commodityName: observation.commodityName,
      marketId: input.marketId,
      marketName: observation.marketName,
      observationDate: observation.observationDate,
      pricePerQuintal,
      pricePerKg: Number((pricePerQuintal / 100).toFixed(2)),
      totalQuantityQuintals: totalQuintals,
      totalQuantityKg: totalKg,
      grossEstimatedValueInr,
      transportCostInr,
      baggingCostInr,
      mandiCessInr,
      otherCostsInr,
      totalDeductionsInr,
      netEstimatedReturnInr,
      effectiveNetPricePerQuintal,
      effectiveNetPricePerKg,
      mspComparison: {
        mspInrPerQuintal: msp,
        isAboveMsp,
        diffPercent,
      },
      provenance: {
        source: observation.sourceId,
        observedDate: observation.observationDate,
        dataAgeDays,
        isStale,
      }
    };
  }
}
