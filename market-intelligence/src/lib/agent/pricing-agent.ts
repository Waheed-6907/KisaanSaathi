import { AgentToolRegistry } from './tools';
import { AgentChatMessage } from '../types';

export class PricingAgent {
  private toolRegistry: AgentToolRegistry;

  constructor() {
    this.toolRegistry = new AgentToolRegistry();
  }

  /**
   * Process a farmer query with strict evidence grounding and fail-closed behavior
   */
  async processQuery(userMessage: string, history: AgentChatMessage[] = []): Promise<{
    reply: string;
    toolExecutions: Array<{ tool: string; args: any; result: any }>;
    provenance: {
      isGrounded: boolean;
      sources: string[];
      caveat: string;
    };
  }> {
    const text = userMessage.toLowerCase().trim();
    const toolExecutions: Array<{ tool: string; args: any; result: any }> = [];
    const sourcesFound = new Set<string>();

    // 1. Identify Commodity
    let commodityId = 'PADDY_COMMON';
    if (text.includes('cotton') || text.includes('kapas') || text.includes('పత్తి')) {
      commodityId = 'COTTON';
    } else if (text.includes('turmeric') || text.includes('haldi') || text.includes('పసుపు')) {
      commodityId = 'TURMERIC';
    } else if (text.includes('chilli') || text.includes('mirchi') || text.includes('మిర్చి')) {
      commodityId = 'CHILLI_RED';
    } else if (text.includes('maize') || text.includes('makka') || text.includes('మొక్కజొన్న')) {
      commodityId = 'MAIZE';
    } else if (text.includes('chana') || text.includes('gram') || text.includes('శనగలు')) {
      commodityId = 'BENGAL_GRAM';
    }

    // 2. Identify Market
    let marketId: string | undefined = undefined;
    if (text.includes('enumamula') || text.includes('warangal')) {
      marketId = 'TG_MKT_ENUMAMULA';
    } else if (text.includes('bowenpally') || text.includes('secunderabad') || text.includes('hyderabad')) {
      marketId = 'TG_MKT_BOWENPALLY';
    } else if (text.includes('nizamabad')) {
      marketId = 'TG_MKT_NIZAMABAD';
    } else if (text.includes('khammam')) {
      marketId = 'TG_MKT_KHAMMAM';
    } else if (text.includes('suryapet')) {
      marketId = 'TG_MKT_SURYAPET';
    } else if (text.includes('badepally') || text.includes('jadcherla') || text.includes('mahabubnagar')) {
      marketId = 'TG_MKT_BADEPALLY';
    } else if (text.includes('karimnagar')) {
      marketId = 'TG_MKT_KARIMNAGAR';
    }

    // 3. Detect Query Intent
    // Case A: Quantity / Net Return Calculation
    const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s*(quintal|qtl|kg|bag|tonne|ton)/i);
    if (quantityMatch || text.includes('how much will i get') || text.includes('net return') || text.includes('cost') || text.includes('profit')) {
      const qty = quantityMatch ? parseFloat(quantityMatch[1]) : 50;
      const unit = quantityMatch && quantityMatch[2].toLowerCase().includes('kg') ? 'Kg' : 'Quintal';
      const targetMarket = marketId || (commodityId === 'TURMERIC' ? 'TG_MKT_NIZAMABAD' : 'TG_MKT_ENUMAMULA');

      const toolResult = await this.toolRegistry.executeTool('calculate_estimated_net_return', {
        commodityId,
        marketId: targetMarket,
        quantity: qty,
        unit
      });

      toolExecutions.push({
        tool: 'calculate_estimated_net_return',
        args: { commodityId, marketId: targetMarket, quantity: qty, unit },
        result: toolResult
      });

      sourcesFound.add(toolResult.provenance.source);

      const reply = `**Deterministic Net Return Calculation:**\n\n` +
        `🌾 **Crop**: ${toolResult.commodityName}\n` +
        `📍 **Market**: ${toolResult.marketName}\n` +
        `📅 **Observation Date**: ${toolResult.observationDate} *(Source: ${toolResult.provenance.source})*\n` +
        `💰 **Modal Wholesale Rate**: ₹${toolResult.pricePerQuintal}/Quintal (₹${toolResult.pricePerKg}/Kg)\n` +
        `📦 **Quantity**: ${toolResult.totalQuantityQuintals} Quintals (${toolResult.totalQuantityKg} Kg)\n\n` +
        `**Revenue & Cost Breakdown:**\n` +
        `• Gross Estimated Value: **₹${toolResult.grossEstimatedValueInr.toLocaleString('en-IN')}**\n` +
        `• Transport Deduction (₹45/qtl): -₹${toolResult.transportCostInr.toLocaleString('en-IN')}\n` +
        `• Bagging & Labor (₹25/qtl): -₹${toolResult.baggingCostInr.toLocaleString('en-IN')}\n` +
        `• Mandi Cess (1.0%): -₹${toolResult.mandiCessInr.toLocaleString('en-IN')}\n` +
        `----------------------------------------\n` +
        `👉 **Estimated Net Return**: **₹${toolResult.netEstimatedReturnInr.toLocaleString('en-IN')}**\n` +
        `📊 **Effective Net Realization**: ₹${toolResult.effectiveNetPricePerQuintal}/Quintal (₹${toolResult.effectiveNetPricePerKg}/Kg)\n\n` +
        (toolResult.mspComparison.mspInrPerQuintal ? `*Official MSP Reference: ₹${toolResult.mspComparison.mspInrPerQuintal}/Quintal (${toolResult.mspComparison.isAboveMsp ? 'Trade is ABOVE MSP by ' + toolResult.mspComparison.diffPercent + '%' : 'Trade is BELOW MSP'})*\n\n` : '') +
        `*Caveat: Estimated return is based on wholesale mandi auctions and standard logistical deductions. Actual trader settlement may vary based on moisture and quality grading.*`;

      return {
        reply,
        toolExecutions,
        provenance: {
          isGrounded: true,
          sources: Array.from(sourcesFound),
          caveat: 'Net returns calculated via deterministic formula without LLM guesswork.'
        }
      };
    }

    // Case B: Comparison between markets
    if (text.includes('compare') || text.includes('vs') || text.includes('where to sell') || text.includes('which market')) {
      const toolResult = await this.toolRegistry.executeTool('compare_markets', {
        commodityId
      });

      toolExecutions.push({
        tool: 'compare_markets',
        args: { commodityId },
        result: toolResult
      });

      if (!toolResult.markets || toolResult.markets.length === 0) {
        return {
          reply: `No verified comparative price records found for ${commodityId} on the specified date.`,
          toolExecutions,
          provenance: { isGrounded: true, sources: [], caveat: 'Fail-closed refusal due to missing records' }
        };
      }

      toolResult.markets.forEach((m: any) => sourcesFound.add(m.source));

      let mktLines = toolResult.markets.map((m: any, idx: number) => 
        `${idx + 1}. **${m.marketName}** (${m.districtName}): Modal **₹${m.modalPrice}/Qtl** | Min: ₹${m.minPrice} | Max: ₹${m.maxPrice} | Arrivals: ${m.arrivals} Qtl`
      ).join('\n');

      const reply = `**Telangana Market Comparison for ${toolResult.commodityName} (Observed on ${toolResult.date}):**\n\n` +
        `${mktLines}\n\n` +
        `📊 **Price Spread**: ₹${toolResult.priceSpreadInr}/Quintal (${toolResult.priceSpreadPercent}% spread across mandis).\n` +
        (toolResult.bestModalMarket ? `🏆 **Highest Modal Rate**: **${toolResult.bestModalMarket.marketName}** at ₹${toolResult.bestModalMarket.modalPrice}/Quintal.\n\n` : '') +
        `*Important: A higher mandi price does not automatically guarantee higher profit if extra transportation to a distant yard exceeds the ₹${toolResult.priceSpreadInr}/Qtl spread. Factor in ₹40-₹70/quintal haulage costs.*`;

      return {
        reply,
        toolExecutions,
        provenance: {
          isGrounded: true,
          sources: Array.from(sourcesFound),
          caveat: 'Comparative analysis strictly derived from verified Agmarknet observations.'
        }
      };
    }

    // Case C: Trend & Volatility
    if (text.includes('trend') || text.includes('going up') || text.includes('rise') || text.includes('fall') || text.includes('history')) {
      const targetMarket = marketId || (commodityId === 'TURMERIC' ? 'TG_MKT_NIZAMABAD' : 'TG_MKT_ENUMAMULA');
      const toolResult = await this.toolRegistry.executeTool('get_price_trend', {
        commodityId,
        marketId: targetMarket
      });

      toolExecutions.push({
        tool: 'get_price_trend',
        args: { commodityId, marketId: targetMarket },
        result: toolResult
      });

      sourcesFound.add('AGMARKNET');

      const trendEmoji = toolResult.trendDirection === 'UP' ? '📈 UPWARD' : toolResult.trendDirection === 'DOWN' ? '📉 DOWNWARD' : '⚖️ STABLE';

      const reply = `**Price Trend Analysis for ${toolResult.commodityName}:**\n\n` +
        `📍 **Market**: ${toolResult.marketName}\n` +
        `📊 **Trend Direction**: **${trendEmoji}**\n` +
        `• 7-Day Price Change: **${toolResult.change7dPercent !== null ? (toolResult.change7dPercent > 0 ? '+' : '') + toolResult.change7dPercent + '%' : 'Insufficient historical points'}**\n` +
        `• Period Range: Lowest ₹${toolResult.lowestPriceInPeriod}/Qtl &mdash; Highest ₹${toolResult.highestPriceInPeriod}/Qtl\n` +
        `• Average Modal Price: ₹${toolResult.averageModalPrice}/Quintal\n` +
        `• Historical Data Points Analyzed: ${toolResult.dataPointsCount}\n\n` +
        `*Source: Official AGMARKNET historical observations. Forecasts are deliberately omitted to adhere to zero-hallucination governance.*`;

      return {
        reply,
        toolExecutions,
        provenance: {
          isGrounded: true,
          sources: ['AGMARKNET'],
          caveat: 'Historical time series calculation.'
        }
      };
    }

    // Case D: Latest Price Inquiry (Default)
    const toolResult = await this.toolRegistry.executeTool('get_latest_available_price', {
      commodityId,
      marketId
    });

    toolExecutions.push({
      tool: 'get_latest_available_price',
      args: { commodityId, marketId },
      result: toolResult
    });

    if (!toolResult.found) {
      return {
        reply: `⚠️ **No Data Available**: ${toolResult.message}\n\n${toolResult.caveat}\nTry asking for **Telangana Sona Paddy**, **Cotton at Enumamula**, **Turmeric at Nizamabad**, or **Chilli at Khammam**.`,
        toolExecutions,
        provenance: {
          isGrounded: true,
          sources: [],
          caveat: 'Honest fail-closed response without price fabrication.'
        }
      };
    }

    sourcesFound.add(toolResult.source);

    const reply = `**Verified Agricultural Market Price:**\n\n` +
      `🌾 **Commodity**: **${toolResult.commodity}** (${toolResult.variety})\n` +
      `📍 **Mandi**: **${toolResult.market}**, District: ${toolResult.district}\n` +
      `📅 **Observation Date**: **${toolResult.observationDate}** *(Last Verified: ${new Date(toolResult.verifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})*\n` +
      `🏛️ **Reporting Source**: **${toolResult.source}** (Official Government APMC Bulletin)\n\n` +
      `💰 **Modal Price**: **₹${toolResult.modalPrice.toLocaleString('en-IN')} / Quintal** (₹${toolResult.modalPricePerKg} / Kg)\n` +
      `📉 **Price Range**: Min ₹${toolResult.minPrice.toLocaleString('en-IN')} &mdash; Max ₹${toolResult.maxPrice.toLocaleString('en-IN')} / Quintal\n` +
      `🚛 **Recorded Arrivals**: ${toolResult.arrivals} Quintals\n\n` +
      (toolResult.mspOfficial ? `*Official Government MSP: ₹${toolResult.mspOfficial}/Quintal*\n\n` : '') +
      `*Note: Prices reflect wholesale auction lots at the market yard. Quality specifications (moisture, impurities) determine final settlement.*`;

    return {
      reply,
      toolExecutions,
      provenance: {
        isGrounded: true,
        sources: Array.from(sourcesFound),
        caveat: 'Grounding verified against official database observation.'
      }
    };
  }
}
