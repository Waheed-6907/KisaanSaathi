import { MarketObservation, RawGovernmentRecord } from '../types';

// Standard Commodity Lookup & Mapping Table
const COMMODITY_ALIASES: Record<string, { id: string; standardName: string }> = {
  'paddy': { id: 'PADDY_COMMON', standardName: 'Paddy(Dhan)(Common)' },
  'paddy(dhan)(common)': { id: 'PADDY_COMMON', standardName: 'Paddy(Dhan)(Common)' },
  'dhan': { id: 'PADDY_COMMON', standardName: 'Paddy(Dhan)(Common)' },
  'paddy grade a': { id: 'PADDY_GRADE_A', standardName: 'Paddy(Dhan)(Grade A)' },
  'paddy(dhan)(grade a)': { id: 'PADDY_GRADE_A', standardName: 'Paddy(Dhan)(Grade A)' },
  'cotton': { id: 'COTTON', standardName: 'Cotton(Kapas)' },
  'kapas': { id: 'COTTON', standardName: 'Cotton(Kapas)' },
  'turmeric': { id: 'TURMERIC', standardName: 'Turmeric(Raw/Finger)' },
  'haldi': { id: 'TURMERIC', standardName: 'Turmeric(Raw/Finger)' },
  'chilli red': { id: 'CHILLI_RED', standardName: 'Chilli Red(Dry)' },
  'red chilli': { id: 'CHILLI_RED', standardName: 'Chilli Red(Dry)' },
  'chilli': { id: 'CHILLI_RED', standardName: 'Chilli Red(Dry)' },
  'maize': { id: 'MAIZE', standardName: 'Maize(Makka)' },
  'makka': { id: 'MAIZE', standardName: 'Maize(Makka)' },
  'bengal gram': { id: 'BENGAL_GRAM', standardName: 'Bengal Gram(Gram)(Whole)' },
  'gram': { id: 'BENGAL_GRAM', standardName: 'Bengal Gram(Gram)(Whole)' },
  'chana': { id: 'BENGAL_GRAM', standardName: 'Bengal Gram(Gram)(Whole)' },
  'red gram': { id: 'RED_GRAM', standardName: 'Red Gram(Arhar/Tur)' },
  'arhar': { id: 'RED_GRAM', standardName: 'Red Gram(Arhar/Tur)' },
  'tur': { id: 'RED_GRAM', standardName: 'Red Gram(Arhar/Tur)' },
  'soyabean': { id: 'SOYABEAN', standardName: 'Soyabean' },
};

// Standard Market & District Lookup Table for Telangana
const MARKET_ALIASES: Record<string, { marketId: string; standardName: string; districtId: string; districtName: string }> = {
  'enumamula': { marketId: 'TG_MKT_ENUMAMULA', standardName: 'Enumamula (Warangal)', districtId: 'TG_WARANGAL', districtName: 'Warangal' },
  'warangal': { marketId: 'TG_MKT_ENUMAMULA', standardName: 'Enumamula (Warangal)', districtId: 'TG_WARANGAL', districtName: 'Warangal' },
  'bowenpally': { marketId: 'TG_MKT_BOWENPALLY', standardName: 'Bowenpally (Secunderabad)', districtId: 'TG_RANGAREDDY', districtName: 'Rangareddy' },
  'secunderabad': { marketId: 'TG_MKT_BOWENPALLY', standardName: 'Bowenpally (Secunderabad)', districtId: 'TG_RANGAREDDY', districtName: 'Rangareddy' },
  'nizamabad': { marketId: 'TG_MKT_NIZAMABAD', standardName: 'Nizamabad APMC', districtId: 'TG_NIZAMABAD', districtName: 'Nizamabad' },
  'khammam': { marketId: 'TG_MKT_KHAMMAM', standardName: 'Khammam Mandi', districtId: 'TG_KHAMMAM', districtName: 'Khammam' },
  'suryapet': { marketId: 'TG_MKT_SURYAPET', standardName: 'Suryapet APMC Yard', districtId: 'TG_SURYAPET', districtName: 'Suryapet' },
  'badepally': { marketId: 'TG_MKT_BADEPALLY', standardName: 'Badepally (Jadcherla)', districtId: 'TG_MAHABUBNAGAR', districtName: 'Mahabubnagar' },
  'jadcherla': { marketId: 'TG_MKT_BADEPALLY', standardName: 'Badepally (Jadcherla)', districtId: 'TG_MAHABUBNAGAR', districtName: 'Mahabubnagar' },
  'karimnagar': { marketId: 'TG_MKT_KARIMNAGAR', standardName: 'Karimnagar APMC', districtId: 'TG_KARIMNAGAR', districtName: 'Karimnagar' },
  'gajwel': { marketId: 'TG_MKT_GAJWEL', standardName: 'Gajwel Integrated Market Yard', districtId: 'TG_MEDAK', districtName: 'Medak' },
};

/**
 * Parse heterogeneous date strings into strict ISO YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = dateStr.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Normalization & data quality validation result
 */
export interface NormalizationResult {
  isValid: boolean;
  observation?: MarketObservation;
  qualityIssues: Array<{
    type: string;
    severity: 'warning' | 'error' | 'critical';
    message: string;
  }>;
}

/**
 * Normalizes raw inbound government record into strictly typed MarketObservation
 */
export function normalizeGovernmentRecord(
  raw: RawGovernmentRecord,
  sourceId: 'AGMARKNET' | 'DATA_GOV_IN' | 'ENAM' | 'TG_MARKETING'
): NormalizationResult {
  const issues: NormalizationResult['qualityIssues'] = [];

  // 1. Commodity normalization
  const rawComm = (raw.commodity || '').trim().toLowerCase();
  let commodityId = 'PADDY_COMMON';
  let commodityName = raw.commodity || 'Paddy(Dhan)(Common)';

  for (const [alias, mapped] of Object.entries(COMMODITY_ALIASES)) {
    if (rawComm.includes(alias)) {
      commodityId = mapped.id;
      commodityName = mapped.standardName;
      break;
    }
  }

  // 2. Market & District normalization
  const rawMkt = (raw.market || '').trim().toLowerCase();
  let marketId = 'TG_MKT_ENUMAMULA';
  let marketName = raw.market || 'Enumamula (Warangal)';
  let districtId = 'TG_WARANGAL';
  let districtName = raw.district || 'Warangal';

  for (const [alias, mapped] of Object.entries(MARKET_ALIASES)) {
    if (rawMkt.includes(alias)) {
      marketId = mapped.marketId;
      marketName = mapped.standardName;
      districtId = mapped.districtId;
      districtName = mapped.districtName;
      break;
    }
  }

  // 3. Date Normalization
  const observationDate = normalizeDate(raw.arrival_date);

  // 4. Numeric Price validation & parsing
  const min = typeof raw.min_price === 'number' ? raw.min_price : parseFloat(String(raw.min_price).replace(/[^0-9.]/g, '')) || 0;
  const max = typeof raw.max_price === 'number' ? raw.max_price : parseFloat(String(raw.max_price).replace(/[^0-9.]/g, '')) || 0;
  let modal = typeof raw.modal_price === 'number' ? raw.modal_price : parseFloat(String(raw.modal_price).replace(/[^0-9.]/g, '')) || 0;

  // Quality Checks
  if (min < 0 || max < 0 || modal < 0) {
    issues.push({
      type: 'NEGATIVE_PRICE',
      severity: 'critical',
      message: `Negative price detected: min=${min}, max=${max}, modal=${modal}`
    });
    return { isValid: false, qualityIssues: issues };
  }

  if (min === 0 && max === 0 && modal === 0) {
    issues.push({
      type: 'ZERO_PRICE',
      severity: 'error',
      message: 'Record contains all zero prices'
    });
    return { isValid: false, qualityIssues: issues };
  }

  let finalMin = min;
  let finalMax = max;

  if (finalMin > finalMax) {
    issues.push({
      type: 'MIN_EXCEEDS_MAX',
      severity: 'error',
      message: `Minimum price (₹${min}) exceeds maximum price (₹${max}). Swapping values.`
    });
    // Auto-remedy by swapping
    finalMin = max;
    finalMax = min;
  }

  if (modal < finalMin || modal > finalMax) {
    issues.push({
      type: 'MODAL_OUT_OF_BOUNDS',
      severity: 'warning',
      message: `Modal price (₹${modal}) was outside [${finalMin}, ${finalMax}]. Adjusting to average.`
    });
    modal = Math.round((finalMin + finalMax) / 2);
  }

  const arrivals = typeof raw.arrivals === 'number' ? raw.arrivals : parseFloat(String(raw.arrivals || 0).replace(/[^0-9.]/g, '')) || 0;

  // Normalization to Rs / Kg
  const minPricePerKg = Number((finalMin / 100).toFixed(2));
  const maxPricePerKg = Number((finalMax / 100).toFixed(2));
  const modalPricePerKg = Number((modal / 100).toFixed(2));

  const observation: MarketObservation = {
    sourceId,
    commodityId,
    commodityName,
    variety: raw.variety?.trim() || 'Other',
    grade: raw.grade?.trim() || 'FAQ',
    stateId: 'TELANGANA',
    districtId,
    districtName,
    marketId,
    marketName,
    observationDate,
    ingestedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    minPrice: finalMin,
    maxPrice: finalMax,
    modalPrice: modal,
    minPricePerKg,
    maxPricePerKg,
    modalPricePerKg,
    priceUnit: 'Rs/Quintal',
    arrivalsQuantity: arrivals,
    arrivalsUnit: 'Quintal',
    dataQualityFlags: issues.map(i => i.type),
    isStale: false,
  };

  return {
    isValid: true,
    observation,
    qualityIssues: issues
  };
}
