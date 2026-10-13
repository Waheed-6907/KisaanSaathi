import { MarketObservation, DataQualityIssue } from '../types';

export class DataQualityAuditor {
  /**
   * Run comprehensive sanity and boundary checks on market price observations
   */
  static auditObservation(obs: MarketObservation): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const now = new Date().toISOString();

    // 1. Min exceeds Max
    if (obs.minPrice > obs.maxPrice) {
      issues.push({
        id: `dqi-${Date.now()}-1`,
        sourceId: obs.sourceId,
        issueType: 'MIN_EXCEEDS_MAX',
        severity: 'error',
        details: {
          minPrice: obs.minPrice,
          maxPrice: obs.maxPrice,
          market: obs.marketName
        },
        detectedAt: now
      });
    }

    // 2. Negative Price
    if (obs.minPrice < 0 || obs.maxPrice < 0 || obs.modalPrice < 0) {
      issues.push({
        id: `dqi-${Date.now()}-2`,
        sourceId: obs.sourceId,
        issueType: 'NEGATIVE_PRICE',
        severity: 'critical',
        details: {
          minPrice: obs.minPrice,
          maxPrice: obs.maxPrice,
          modalPrice: obs.modalPrice
        },
        detectedAt: now
      });
    }

    // 3. Modal Out of Bounds
    if (obs.modalPrice < obs.minPrice || obs.modalPrice > obs.maxPrice) {
      issues.push({
        id: `dqi-${Date.now()}-3`,
        sourceId: obs.sourceId,
        issueType: 'MODAL_OUT_OF_BOUNDS',
        severity: 'warning',
        details: {
          modalPrice: obs.modalPrice,
          bounds: [obs.minPrice, obs.maxPrice]
        },
        detectedAt: now
      });
    }

    // 4. Stale Data
    const obsDate = new Date(obs.observationDate);
    const today = new Date();
    const ageDays = Math.floor((today.getTime() - obsDate.getTime()) / (1000 * 3600 * 24));
    if (ageDays > 3) {
      issues.push({
        id: `dqi-${Date.now()}-4`,
        sourceId: obs.sourceId,
        issueType: 'STALE_DATA',
        severity: 'info',
        details: {
          observationDate: obs.observationDate,
          ageDays
        },
        detectedAt: now
      });
    }

    return issues;
  }
}
