import { RawGovernmentRecord } from '../types';

export interface ConnectorHealth {
  sourceId: string;
  sourceName: string;
  isOnline: boolean;
  lastCheckedAt: string;
  lastSuccessfulFetchAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface ConnectorFetchOptions {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  limit?: number;
  offset?: number;
  date?: string; // YYYY-MM-DD
}

export abstract class BaseConnector {
  abstract readonly sourceId: 'AGMARKNET' | 'DATA_GOV_IN' | 'ENAM' | 'TG_MARKETING';
  abstract readonly sourceName: string;
  abstract readonly portalUrl: string;

  protected timeoutMs: number = 8000;
  protected maxRetries: number = 3;
  protected minRequestIntervalMs: number = 1000;
  protected lastRequestTime: number = 0;
  protected lastSuccessfulFetchTime?: string;
  protected consecutiveFailures: number = 0;
  protected circuitBreakerThreshold: number = 5;

  /**
   * Enforce rate-limiting interval between calls
   */
  protected async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Resilient HTTP fetcher with exponential backoff and timeout
   */
  protected async fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
    if (this.consecutiveFailures >= this.circuitBreakerThreshold) {
      throw new Error(`[CircuitBreaker] Source ${this.sourceId} is temporarily paused due to ${this.consecutiveFailures} consecutive failures.`);
    }

    await this.enforceRateLimit();

    let attempt = 0;
    let delay = 1000;

    while (attempt < this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            'User-Agent': 'KisanSaathi-MarketIntelligence/1.0 (+https://kisaan-saathi-pi.vercel.app)',
            'Accept': 'application/json, text/plain, */*',
            ...(init?.headers || {})
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.consecutiveFailures = 0;
        this.lastSuccessfulFetchTime = new Date().toISOString();
        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);
        const isLastAttempt = attempt >= this.maxRetries;
        if (isLastAttempt) {
          this.consecutiveFailures++;
          throw new Error(`Failed to fetch from ${this.sourceName} after ${this.maxRetries} attempts: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      }
    }

    throw new Error(`Unreachable retry state for ${this.sourceName}`);
  }

  /**
   * Fetch daily market observations from source
   */
  abstract fetchDailyRecords(options?: ConnectorFetchOptions): Promise<RawGovernmentRecord[]>;

  /**
   * Health status for operational monitoring
   */
  async getHealthStatus(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(this.portalUrl, {
        method: 'HEAD',
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(timeoutId);

      const latency = Date.now() - start;
      const isOnline = res !== null && (res.status >= 200 && res.status < 400);

      return {
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        isOnline: isOnline || (this.consecutiveFailures < 3),
        lastCheckedAt: new Date().toISOString(),
        lastSuccessfulFetchAt: this.lastSuccessfulFetchTime,
        latencyMs: latency,
        errorMessage: isOnline ? undefined : (res ? `Status ${res.status}` : 'Connection timed out')
      };
    } catch (err: any) {
      return {
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        isOnline: false,
        lastCheckedAt: new Date().toISOString(),
        lastSuccessfulFetchAt: this.lastSuccessfulFetchTime,
        latencyMs: Date.now() - start,
        errorMessage: err.message
      };
    }
  }
}
