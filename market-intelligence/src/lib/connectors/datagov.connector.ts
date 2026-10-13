import { BaseConnector, ConnectorFetchOptions } from './base.connector';
import { RawGovernmentRecord, RawGovernmentRecordSchema } from '../types';

export class DataGovInConnector extends BaseConnector {
  readonly sourceId = 'DATA_GOV_IN' as const;
  readonly sourceName = 'Open Government Data Platform India (data.gov.in)';
  readonly portalUrl = 'https://data.gov.in';

  // Official Agmarknet daily price resource ID on OGD
  private resourceId = process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
  private apiKey = process.env.DATA_GOV_IN_API_KEY || '';

  constructor(apiKey?: string, resourceId?: string) {
    super();
    if (apiKey) this.apiKey = apiKey;
    if (resourceId) this.resourceId = resourceId;
    this.minRequestIntervalMs = 1500; // OGD recommends at least 1s between calls
  }

  async fetchDailyRecords(options?: ConnectorFetchOptions): Promise<RawGovernmentRecord[]> {
    if (!this.apiKey) {
      throw new Error('[DATA_GOV_IN] Missing DATA_GOV_IN_API_KEY. Configure key from https://data.gov.in/ to enable live OGD streaming.');
    }

    const state = options?.state || 'Telangana';
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;

    const url = new URL(`https://api.data.gov.in/resource/${this.resourceId}`);
    url.searchParams.set('api-key', this.apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('filters[state]', state);

    if (options?.district) {
      url.searchParams.set('filters[district]', options.district);
    }
    if (options?.market) {
      url.searchParams.set('filters[market]', options.market);
    }
    if (options?.commodity) {
      url.searchParams.set('filters[commodity]', options.commodity);
    }

    const res = await this.fetchWithRetry(url.toString());
    const data = await res.json();

    if (!data || !Array.isArray(data.records)) {
      throw new Error(`[DATA_GOV_IN] Malformed API response structure: ${JSON.stringify(data).substring(0, 100)}`);
    }

    const validRecords: RawGovernmentRecord[] = [];
    for (const raw of data.records) {
      const parsed = RawGovernmentRecordSchema.safeParse({
        state: raw.state || state,
        district: raw.district || '',
        market: raw.market || '',
        commodity: raw.commodity || '',
        variety: raw.variety || 'Other',
        grade: raw.grade || 'FAQ',
        arrival_date: raw.arrival_date || raw.Arrival_Date || new Date().toISOString().split('T')[0],
        min_price: raw.min_price || raw.Min_Price || 0,
        max_price: raw.max_price || raw.Max_Price || 0,
        modal_price: raw.modal_price || raw.Modal_Price || 0,
        arrivals: raw.arrivals || raw.Arrivals || 0,
        source: 'DATA_GOV_IN',
      });

      if (parsed.success) {
        validRecords.push(parsed.data);
      }
    }

    return validRecords;
  }
}
