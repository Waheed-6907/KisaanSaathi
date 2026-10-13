import { MarketPriceRepository } from '../db/repository';
import { PricingEngine, OFFICIAL_MSP_TABLE, convertQuantityToQuintals } from '../pricing/engine';
import { AgentToolName } from '../types';

export interface ToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<any>;
}

export class AgentToolRegistry {
  private repo: MarketPriceRepository;
  private pricing: PricingEngine;
  private tools: Map<AgentToolName, ToolDefinition> = new Map();

  constructor() {
    this.repo = MarketPriceRepository.getInstance();
    this.pricing = new PricingEngine(this.repo);
    this.registerTools();
  }

  private registerTools() {
    // 1. search_market_prices
    this.tools.set('search_market_prices', {
      name: 'search_market_prices',
      description: 'Search official verified market price records by commodity, district, market, or date range.',
      parameters: {
        commodityId: { type: 'string', description: 'Normalized commodity ID (e.g. PADDY_COMMON, COTTON, TURMERIC, CHILLI_RED, MAIZE)' },
        districtId: { type: 'string', description: 'Telangana district ID (e.g. TG_WARANGAL, TG_NIZAMABAD, TG_RANGAREDDY)' },
        marketId: { type: 'string', description: 'APMC Mandi ID (e.g. TG_MKT_ENUMAMULA, TG_MKT_BOWENPALLY)' },
        startDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        limit: { type: 'number', description: 'Maximum records to return (max 20)' }
      },
      execute: async (args) => {
        const { records, total } = await this.repo.getObservations({
          ...args,
          limit: Math.min(args.limit || 10, 20)
        });
        return {
          totalMatches: total,
          returnedCount: records.length,
          records: records.map(r => ({
            commodity: r.commodityName,
            market: r.marketName,
            district: r.districtName,
            observationDate: r.observationDate,
            minPrice: `₹${r.minPrice}/${r.priceUnit}`,
            maxPrice: `₹${r.maxPrice}/${r.priceUnit}`,
            modalPrice: `₹${r.modalPrice}/${r.priceUnit}`,
            modalPricePerKg: `₹${r.modalPricePerKg}/Kg`,
            arrivals: `${r.arrivalsQuantity} ${r.arrivalsUnit}`,
            source: r.sourceId,
            isStale: r.isStale
          }))
        };
      }
    });

    // 2. get_latest_available_price
    this.tools.set('get_latest_available_price', {
      name: 'get_latest_available_price',
      description: 'Get the single latest verified market observation for a crop in a specific market.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: false }
      },
      execute: async (args) => {
        const obs = await this.repo.getLatestPrice(args.commodityId, args.marketId);
        if (!obs) {
          return {
            found: false,
            message: `No verified price observation exists in database for commodity=${args.commodityId} market=${args.marketId || 'any'}.`,
            caveat: 'Official data has not been reported for this specific query.'
          };
        }
        return {
          found: true,
          commodity: obs.commodityName,
          variety: obs.variety,
          market: obs.marketName,
          district: obs.districtName,
          observationDate: obs.observationDate,
          minPrice: obs.minPrice,
          maxPrice: obs.maxPrice,
          modalPrice: obs.modalPrice,
          modalPricePerKg: obs.modalPricePerKg,
          priceUnit: obs.priceUnit,
          arrivals: obs.arrivalsQuantity,
          source: obs.sourceId,
          verifiedAt: obs.verifiedAt,
          mspOfficial: OFFICIAL_MSP_TABLE[obs.commodityId] || null,
          isStale: obs.isStale
        };
      }
    });

    // 3. get_historical_prices
    this.tools.set('get_historical_prices', {
      name: 'get_historical_prices',
      description: 'Get historical price observations chronologically for time series analysis.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: false },
        limit: { type: 'number', default: 14 }
      },
      execute: async (args) => {
        const { records } = await this.repo.getObservations({
          commodityId: args.commodityId,
          marketId: args.marketId,
          limit: Math.min(args.limit || 14, 30)
        });
        return {
          commodityId: args.commodityId,
          recordsCount: records.length,
          dataPoints: records.map(r => ({
            date: r.observationDate,
            market: r.marketName,
            modalPrice: r.modalPrice,
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            source: r.sourceId
          }))
        };
      }
    });

    // 4. compare_markets
    this.tools.set('compare_markets', {
      name: 'compare_markets',
      description: 'Compare price observations across Telangana APMC mandis on a target date to identify price spreads.',
      parameters: {
        commodityId: { type: 'string', required: true },
        date: { type: 'string', required: false }
      },
      execute: async (args) => {
        return this.repo.compareMarkets(args.commodityId, args.date);
      }
    });

    // 5. get_price_trend
    this.tools.set('get_price_trend', {
      name: 'get_price_trend',
      description: 'Calculate deterministic 7-day trend, direction, volatility, and percentage change for a market.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: true }
      },
      execute: async (args) => {
        return this.repo.getPriceTrend(args.commodityId, args.marketId);
      }
    });

    // 6. calculate_gross_value
    this.tools.set('calculate_gross_value', {
      name: 'calculate_gross_value',
      description: 'Perform deterministic gross revenue calculation: Quantity × Verified Market Price.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: true },
        quantity: { type: 'number', required: true },
        unit: { type: 'string', default: 'Quintal' }
      },
      execute: async (args) => {
        const obs = await this.repo.getLatestPrice(args.commodityId, args.marketId);
        if (!obs) throw new Error(`Price not found for ${args.commodityId} at ${args.marketId}`);
        const qQuintals = convertQuantityToQuintals(args.quantity, args.unit || 'Quintal');
        const grossValue = Number((qQuintals * obs.modalPrice).toFixed(2));
        return {
          commodity: obs.commodityName,
          market: obs.marketName,
          quantityEntered: `${args.quantity} ${args.unit}`,
          normalizedQuintals: qQuintals,
          priceUsed: `₹${obs.modalPrice}/Quintal (Modal Price on ${obs.observationDate})`,
          grossEstimatedValueInr: grossValue
        };
      }
    });

    // 7. calculate_estimated_net_return
    this.tools.set('calculate_estimated_net_return', {
      name: 'calculate_estimated_net_return',
      description: 'Calculate net farmer take-home return deducting transportation, bagging labor, and mandi cess.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: true },
        quantity: { type: 'number', required: true },
        unit: { type: 'string', default: 'Quintal' },
        transportCostPerQuintal: { type: 'number', default: 45 },
        baggingLaborCostPerQuintal: { type: 'number', default: 25 },
        mandiCessPercent: { type: 'number', default: 1.0 }
      },
      execute: async (args) => {
        return this.pricing.calculateNetReturn({
          commodityId: args.commodityId,
          marketId: args.marketId,
          quantity: args.quantity,
          quantityUnit: args.unit || 'Quintal',
          transportCostPerQuintal: args.transportCostPerQuintal || 45,
          baggingLaborCostPerQuintal: args.baggingLaborCostPerQuintal || 25,
          mandiCessPercent: args.mandiCessPercent || 1.0
        });
      }
    });

    // 8. get_data_freshness
    this.tools.set('get_data_freshness', {
      name: 'get_data_freshness',
      description: 'Audit the freshness, observation date vs ingestion timestamp, and staleness of market data.',
      parameters: {
        commodityId: { type: 'string', required: true },
        marketId: { type: 'string', required: true }
      },
      execute: async (args) => {
        const obs = await this.repo.getLatestPrice(args.commodityId, args.marketId);
        if (!obs) return { error: 'No data found' };
        const now = new Date();
        const obsDate = new Date(obs.observationDate);
        const daysOld = Math.floor((now.getTime() - obsDate.getTime()) / (1000 * 3600 * 24));
        return {
          commodity: obs.commodityName,
          market: obs.marketName,
          source: obs.sourceId,
          observationDate: obs.observationDate,
          ingestedAt: obs.ingestedAt,
          verifiedAt: obs.verifiedAt,
          dataAgeDays: daysOld,
          freshnessStatus: daysOld <= 1 ? 'FRESH' : daysOld <= 3 ? 'MODERATE' : 'STALE',
          warning: daysOld > 2 ? 'Price data is older than 48 hours. Transact with caution.' : null
        };
      }
    });

    // 9. get_source_provenance
    this.tools.set('get_source_provenance', {
      name: 'get_source_provenance',
      description: 'Get verified source authority, portal URL, and verification details for an observation.',
      parameters: {
        sourceId: { type: 'string', required: true }
      },
      execute: async (args) => {
        const sources: Record<string, any> = {
          'AGMARKNET': {
            officialName: 'Agricultural Marketing Information Network (Agmarknet)',
            authority: 'Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, Govt of India',
            portalUrl: 'https://agmarknet.gov.in',
            verificationType: 'Official APMC Mandi Daily Bulletins'
          },
          'DATA_GOV_IN': {
            officialName: 'Open Government Data (OGD) Platform India',
            authority: 'National Informatics Centre (NIC) / MeitY, Govt of India',
            portalUrl: 'https://data.gov.in',
            verificationType: 'OGD Standardized REST API'
          },
          'ENAM': {
            officialName: 'National Agriculture Market (e-NAM)',
            authority: 'Small Farmers Agribusiness Consortium (SFAC), Govt of India',
            portalUrl: 'https://enam.gov.in',
            verificationType: 'Integrated Electronic Mandi Auction Records'
          }
        };
        return sources[args.sourceId] || { error: 'Unknown source ID' };
      }
    });
  }

  getTool(name: AgentToolName): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: AgentToolName, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} is not recognized or not authorized.`);
    }
    return tool.execute(args);
  }
}
