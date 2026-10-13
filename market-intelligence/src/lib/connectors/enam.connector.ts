import { BaseConnector, ConnectorFetchOptions } from './base.connector';
import { RawGovernmentRecord, RawGovernmentRecordSchema } from '../types';

export class EnamConnector extends BaseConnector {
  readonly sourceId = 'ENAM' as const;
  readonly sourceName = 'National Agriculture Market (e-NAM, SFAC)';
  readonly portalUrl = 'https://www.enam.gov.in';

  constructor() {
    super();
    this.minRequestIntervalMs = 2000;
  }

  async fetchDailyRecords(options?: ConnectorFetchOptions): Promise<RawGovernmentRecord[]> {
    const url = 'https://www.enam.gov.in/web/dashboard/agmarknet';
    try {
      const res = await this.fetchWithRetry(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`[e-NAM] HTTP ${res.status}`);
      }
      return [];
    } catch (err: any) {
      console.warn(`[e-NAM Connector Warning] ${err.message}`);
      throw err;
    }
  }
}
