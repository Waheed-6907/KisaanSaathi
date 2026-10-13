import { z } from 'zod';

// ==============================================================================
// 1. Core Geography & Commodity Schemas
// ==============================================================================

export const StateSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});
export type State = z.infer<typeof StateSchema>;

export const DistrictSchema = z.object({
  id: z.string(),
  stateId: z.string(),
  name: z.string(),
});
export type District = z.infer<typeof DistrictSchema>;

export const MarketSchema = z.object({
  id: z.string(),
  districtId: z.string(),
  stateId: z.string(),
  name: z.string(),
  marketType: z.string().default('APMC Mandi'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().default(true),
});
export type Market = z.infer<typeof MarketSchema>;

export const CommoditySchema = z.object({
  id: z.string(),
  name: z.string(),
  teluguName: z.string().optional(),
  hindiName: z.string().optional(),
  category: z.enum(['Cereals', 'Commercial Crops', 'Spices', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits']),
  defaultUnit: z.string().default('Quintal'),
  mspInrPerQuintal: z.number().nullable().optional(),
});
export type Commodity = z.infer<typeof CommoditySchema>;

// ==============================================================================
// 2. Market Price Observation Schema (With Mandatory Provenance & Separation)
// ==============================================================================

export const PriceUnitSchema = z.enum(['Rs/Quintal', 'Rs/Kg', 'Rs/Tonne']);
export type PriceUnit = z.infer<typeof PriceUnitSchema>;

export const MarketObservationSchema = z.object({
  id: z.string().uuid().optional(),
  sourceId: z.enum(['AGMARKNET', 'DATA_GOV_IN', 'ENAM', 'TG_MARKETING']),
  sourceRecordId: z.string().optional(),
  commodityId: z.string(),
  commodityName: z.string(),
  variety: z.string().default('Other'),
  grade: z.string().default('FAQ'),
  stateId: z.string().default('TELANGANA'),
  districtId: z.string(),
  districtName: z.string().optional(),
  marketId: z.string(),
  marketName: z.string(),
  
  // Separation of Observation vs Ingestion Time
  observationDate: z.string(), // ISO YYYY-MM-DD
  ingestedAt: z.string().optional(), // ISO Timestamp
  verifiedAt: z.string().optional(),
  
  // Prices in Rs / Quintal
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  modalPrice: z.number().nonnegative(),
  
  // Normalized Rs / Kg (1 Quintal = 100 Kg)
  minPricePerKg: z.number().nonnegative().optional(),
  maxPricePerKg: z.number().nonnegative().optional(),
  modalPricePerKg: z.number().nonnegative().optional(),
  
  priceUnit: PriceUnitSchema.default('Rs/Quintal'),
  arrivalsQuantity: z.number().default(0),
  arrivalsUnit: z.string().default('Quintal'),
  
  dataQualityFlags: z.array(z.string()).default([]),
  isStale: z.boolean().default(false),
});
export type MarketObservation = z.infer<typeof MarketObservationSchema>;

// Raw inbound record from Government Connectors
export const RawGovernmentRecordSchema = z.object({
  state: z.string(),
  district: z.string(),
  market: z.string(),
  commodity: z.string(),
  variety: z.string().optional(),
  grade: z.string().optional(),
  arrival_date: z.string(),
  min_price: z.union([z.number(), z.string()]),
  max_price: z.union([z.number(), z.string()]),
  modal_price: z.union([z.number(), z.string()]),
  arrivals: z.union([z.number(), z.string()]).optional(),
  source: z.string().optional(),
});
export type RawGovernmentRecord = z.infer<typeof RawGovernmentRecordSchema>;

// ==============================================================================
// 3. Pricing Calculation & Net Return Schemas
// ==============================================================================

export const NetReturnCalculationInputSchema = z.object({
  commodityId: z.string(),
  marketId: z.string(),
  quantity: z.number().positive(),
  quantityUnit: z.enum(['Quintal', 'Kg', 'Tonne']).default('Quintal'),
  customPricePerQuintal: z.number().positive().optional(),
  transportCostPerQuintal: z.number().nonnegative().default(45).optional(),
  baggingLaborCostPerQuintal: z.number().nonnegative().default(25).optional(),
  mandiCessPercent: z.number().nonnegative().default(1.0).optional(),
  otherCostsInr: z.number().nonnegative().default(0).optional(),
});
export type NetReturnCalculationInput = z.infer<typeof NetReturnCalculationInputSchema>;

export const NetReturnCalculationResultSchema = z.object({
  commodityId: z.string(),
  commodityName: z.string(),
  marketId: z.string(),
  marketName: z.string(),
  observationDate: z.string(),
  pricePerQuintal: z.number(),
  pricePerKg: z.number(),
  totalQuantityQuintals: z.number(),
  totalQuantityKg: z.number(),
  
  // Value Calculations
  grossEstimatedValueInr: z.number(),
  transportCostInr: z.number(),
  baggingCostInr: z.number(),
  mandiCessInr: z.number(),
  otherCostsInr: z.number(),
  totalDeductionsInr: z.number(),
  netEstimatedReturnInr: z.number(),
  effectiveNetPricePerQuintal: z.number(),
  effectiveNetPricePerKg: z.number(),
  
  mspComparison: z.object({
    mspInrPerQuintal: z.number().nullable(),
    isAboveMsp: z.boolean().nullable(),
    diffPercent: z.number().nullable(),
  }),
  
  provenance: z.object({
    source: z.string(),
    observedDate: z.string(),
    dataAgeDays: z.number(),
    isStale: z.boolean(),
  }),
});
export type NetReturnCalculationResult = z.infer<typeof NetReturnCalculationResultSchema>;

// ==============================================================================
// 4. Comparison & Trends Schemas
// ==============================================================================

export const MarketComparisonResultSchema = z.object({
  commodityId: z.string(),
  commodityName: z.string(),
  date: z.string(),
  markets: z.array(z.object({
    marketId: z.string(),
    marketName: z.string(),
    districtName: z.string(),
    minPrice: z.number(),
    maxPrice: z.number(),
    modalPrice: z.number(),
    modalPricePerKg: z.number(),
    arrivals: z.number(),
    observationDate: z.string(),
    source: z.string(),
    isStale: z.boolean(),
  })),
  bestModalMarket: z.object({
    marketId: z.string(),
    marketName: z.string(),
    modalPrice: z.number(),
  }).nullable(),
  priceSpreadInr: z.number(),
  priceSpreadPercent: z.number(),
});
export type MarketComparisonResult = z.infer<typeof MarketComparisonResultSchema>;

export const PriceTrendResultSchema = z.object({
  commodityId: z.string(),
  commodityName: z.string(),
  marketId: z.string(),
  marketName: z.string(),
  dataPointsCount: z.number(),
  observations: z.array(z.object({
    date: z.string(),
    modalPrice: z.number(),
    minPrice: z.number(),
    maxPrice: z.number(),
  })),
  change7dPercent: z.number().nullable(),
  change30dPercent: z.number().nullable(),
  trendDirection: z.enum(['UP', 'DOWN', 'STABLE', 'INSUFFICIENT_DATA']),
  highestPriceInPeriod: z.number(),
  lowestPriceInPeriod: z.number(),
  averageModalPrice: z.number(),
});
export type PriceTrendResult = z.infer<typeof PriceTrendResultSchema>;

// ==============================================================================
// 5. Ingestion Pipeline & Quality Schemas
// ==============================================================================

export const IngestionJobResultSchema = z.object({
  jobId: z.string(),
  sourceId: z.string(),
  status: z.enum(['success', 'partial', 'failed']),
  recordsRetrieved: z.number(),
  recordsUpserted: z.number(),
  recordsRejected: z.number(),
  durationMs: z.number(),
  startedAt: z.string(),
  completedAt: z.string(),
  error: z.string().optional(),
  summary: z.record(z.any()).optional(),
});
export type IngestionJobResult = z.infer<typeof IngestionJobResultSchema>;

export const DataQualityIssueSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional(),
  observationId: z.string().optional(),
  issueType: z.enum([
    'MIN_EXCEEDS_MAX',
    'NEGATIVE_PRICE',
    'MODAL_OUT_OF_BOUNDS',
    'ABNORMAL_SPIKE',
    'STALE_DATA',
    'MISSING_MANDATORY_FIELD',
    'ZERO_PRICE'
  ]),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  details: z.record(z.any()),
  detectedAt: z.string(),
});
export type DataQualityIssue = z.infer<typeof DataQualityIssueSchema>;

// ==============================================================================
// 6. AI Agent Tool Call & Response Types
// ==============================================================================

export type AgentToolName =
  | 'search_market_prices'
  | 'get_latest_available_price'
  | 'get_historical_prices'
  | 'compare_markets'
  | 'get_price_trend'
  | 'calculate_gross_value'
  | 'calculate_estimated_net_return'
  | 'get_data_freshness'
  | 'get_source_provenance';

export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    name: AgentToolName;
    arguments: Record<string, any>;
  }>;
  toolResults?: Array<{
    toolCallId: string;
    result: any;
  }>;
}
