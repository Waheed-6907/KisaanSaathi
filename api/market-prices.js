// Vercel Serverless Function: Kisan Saathi Market Intelligence API
// Authentic agricultural market pricing data, inter-mandi comparison, and deterministic net return calculation
const fs = require('fs');
const path = require('path');

function getMarketPriceData() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'data', 'market_prices.json'),
    path.join(process.cwd(), 'assets', 'data', 'market_prices.json'),
    path.join(__dirname, 'assets', 'data', 'market_prices.json')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (_e) {}
    }
  }
  return { commodities: [], markets: [], observations: [] };
}

// Official MSP Table (Rs/Quintal)
const OFFICIAL_MSP_TABLE = {
  'PADDY_COMMON': 2300.00,
  'COTTON': 7121.00,
  'MAIZE': 2225.00,
  'BENGAL_GRAM': 5650.00,
  'WHEAT': 2425.00,
  'RED_GRAM': 7550.00
};

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_e) { return {}; }
  }
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', chunk => buf += chunk);
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch (_e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const dataset = getMarketPriceData();
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = (urlObj.searchParams.get('action') || 'latest').toLowerCase();

  // POST: Net Return Calculation
  if (req.method === 'POST' || action === 'calculate') {
    try {
      const body = await parseBody(req);
      const commodityId = body.commodityId || urlObj.searchParams.get('commodityId') || 'PADDY_COMMON';
      const marketId = body.marketId || urlObj.searchParams.get('marketId') || 'TG_MKT_ENUMAMULA';
      let quantity = parseFloat(body.quantity || urlObj.searchParams.get('quantity') || 50);
      const unit = body.unit || urlObj.searchParams.get('unit') || 'Quintal';
      const transportCost = parseFloat(body.transportCostPerQuintal || urlObj.searchParams.get('transportCostPerQuintal') || 45);
      const baggingCost = parseFloat(body.baggingLaborCostPerQuintal || urlObj.searchParams.get('baggingLaborCostPerQuintal') || 25);
      const cessPercent = parseFloat(body.mandiCessPercent || urlObj.searchParams.get('mandiCessPercent') || 1.0);
      const customPrice = body.customPricePerQuintal ? parseFloat(body.customPricePerQuintal) : null;

      // Find matching observation
      const obs = dataset.observations.find(o => o.commodityId === commodityId && o.marketId === marketId) ||
                  dataset.observations.find(o => o.commodityId === commodityId) ||
                  dataset.observations[0];

      if (!obs) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'No price record found for calculation' }));
      }

      // Convert unit to quintals
      let totalQuintals = quantity;
      if (unit.toLowerCase().includes('kg')) totalQuintals = quantity / 100;
      else if (unit.toLowerCase().includes('ton')) totalQuintals = quantity * 10;

      const ratePerQuintal = customPrice || obs.modalPrice;
      const grossValue = Math.round(totalQuintals * ratePerQuintal * 100) / 100;

      const totalTransport = Math.round(totalQuintals * transportCost * 100) / 100;
      const totalBagging = Math.round(totalQuintals * baggingCost * 100) / 100;
      const totalCess = Math.round((grossValue * (cessPercent / 100)) * 100) / 100;

      const totalDeductions = Math.round((totalTransport + totalBagging + totalCess) * 100) / 100;
      const netReturn = Math.round((grossValue - totalDeductions) * 100) / 100;

      const effectiveNetPerQtl = totalQuintals > 0 ? Math.round((netReturn / totalQuintals) * 100) / 100 : 0;
      const effectiveNetPerKg = Math.round((effectiveNetPerQtl / 100) * 100) / 100;

      const msp = OFFICIAL_MSP_TABLE[commodityId] || null;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        calculation: {
          commodityName: obs.commodityName,
          marketName: obs.marketName,
          observationDate: obs.observationDate,
          pricePerQuintal: ratePerQuintal,
          pricePerKg: Math.round((ratePerQuintal / 100) * 100) / 100,
          totalQuintals,
          totalKg: Math.round(totalQuintals * 100),
          grossEstimatedValueInr: grossValue,
          transportCostInr: totalTransport,
          baggingCostInr: totalBagging,
          mandiCessInr: totalCess,
          totalDeductionsInr: totalDeductions,
          netEstimatedReturnInr: netReturn,
          effectiveNetPricePerQuintal: effectiveNetPerQtl,
          effectiveNetPricePerKg: effectiveNetPerKg,
          mspComparison: {
            mspInrPerQuintal: msp,
            isAboveMsp: msp ? ratePerQuintal >= msp : null,
            diffPercent: msp ? Math.round(((ratePerQuintal - msp) / msp) * 1000) / 10 : null
          },
          provenance: {
            source: obs.sourceId,
            observationDate: obs.observationDate
          }
        }
      }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET: Compare Mandis
  if (action === 'compare') {
    const commodityId = urlObj.searchParams.get('commodityId') || 'PADDY_COMMON';
    const matched = dataset.observations.filter(o => o.commodityId === commodityId);

    const mapByMarket = new Map();
    for (const m of matched) {
      if (!mapByMarket.has(m.marketId)) {
        mapByMarket.set(m.marketId, m);
      }
    }

    const list = Array.from(mapByMarket.values()).sort((a, b) => b.modalPrice - a.modalPrice);
    let bestModalMarket = null;
    let spread = 0;
    let spreadPercent = 0;

    if (list.length > 0) {
      bestModalMarket = { marketName: list[0].marketName, modalPrice: list[0].modalPrice };
      const lowest = list[list.length - 1].modalPrice;
      const highest = list[0].modalPrice;
      spread = highest - lowest;
      spreadPercent = lowest > 0 ? Math.round((spread / lowest) * 1000) / 10 : 0;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      comparison: {
        commodityId,
        commodityName: matched.length > 0 ? matched[0].commodityName : commodityId,
        date: matched.length > 0 ? matched[0].observationDate : '2026-10-13',
        markets: list,
        bestModalMarket,
        priceSpreadInr: spread,
        priceSpreadPercent: spreadPercent
      }
    }));
  }

  // GET: Historical Trend
  if (action === 'history') {
    const commodityId = urlObj.searchParams.get('commodityId') || 'PADDY_COMMON';
    const marketId = urlObj.searchParams.get('marketId') || 'TG_MKT_ENUMAMULA';

    const records = dataset.observations.filter(o => o.commodityId === commodityId && o.marketId === marketId);
    records.sort((a, b) => a.observationDate.localeCompare(b.observationDate));

    const prices = records.map(r => r.modalPrice);
    const highest = prices.length ? Math.max(...prices) : 0;
    const lowest = prices.length ? Math.min(...prices) : 0;
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    let change7d = null;
    if (prices.length >= 2) {
      change7d = Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 1000) / 10;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      data: {
        commodityId,
        marketId,
        commodityName: records.length ? records[0].commodityName : commodityId,
        marketName: records.length ? records[0].marketName : marketId,
        dataPointsCount: records.length,
        observations: records,
        highestPriceInPeriod: highest,
        lowestPriceInPeriod: lowest,
        averageModalPrice: avg,
        change7dPercent: change7d,
        trendDirection: change7d > 1 ? 'UP' : change7d < -1 ? 'DOWN' : 'STABLE'
      }
    }));
  }

  // GET: Latest / Filtered Records
  const commodityId = urlObj.searchParams.get('commodityId') || '';
  const districtId = urlObj.searchParams.get('districtId') || '';
  const marketId = urlObj.searchParams.get('marketId') || '';
  const search = (urlObj.searchParams.get('q') || '').toLowerCase();

  // Day, Date, Year preference filter
  let dateQuery = urlObj.searchParams.get('date') || '';
  const dayQuery = urlObj.searchParams.get('day');
  const monthQuery = urlObj.searchParams.get('month');
  const yearQuery = urlObj.searchParams.get('year');

  if (!dateQuery && dayQuery && monthQuery && yearQuery) {
    const mm = String(monthQuery).padStart(2, '0');
    const dd = String(dayQuery).padStart(2, '0');
    dateQuery = `${yearQuery}-${mm}-${dd}`;
  }

  let results = [...dataset.observations];

  if (commodityId) results = results.filter(r => r.commodityId === commodityId);
  if (districtId) results = results.filter(r => r.districtId === districtId);
  if (marketId) results = results.filter(r => r.marketId === marketId);
  if (search) {
    results = results.filter(r =>
      r.commodityName.toLowerCase().includes(search) ||
      r.marketName.toLowerCase().includes(search) ||
      r.variety.toLowerCase().includes(search)
    );
  }

  let matchedDate = dateQuery || '2026-10-14';
  let isExactDate = true;

  if (dateQuery) {
    const exactMatches = results.filter(r => r.observationDate === dateQuery);
    if (exactMatches.length > 0) {
      results = exactMatches;
      matchedDate = dateQuery;
      isExactDate = true;
    } else {
      // Find closest available observation date in the dataset
      const allDates = Array.from(new Set(results.map(r => r.observationDate))).sort();
      if (allDates.length > 0) {
        // Find nearest date
        const targetMs = new Date(dateQuery).getTime();
        let closest = allDates[0];
        let minDiff = Infinity;
        for (const d of allDates) {
          const diff = Math.abs(new Date(d).getTime() - targetMs);
          if (diff < minDiff) {
            minDiff = diff;
            closest = d;
          }
        }
        matchedDate = closest;
        isExactDate = false;
        results = results.filter(r => r.observationDate === closest);
      }
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    total: results.length,
    requestedDate: dateQuery || null,
    matchedDate: matchedDate,
    isExactDate: isExactDate,
    records: results,
    sources: dataset.sources,
    commodities: dataset.commodities,
    markets: dataset.markets,
    timestamp: new Date().toISOString()
  }));
};

