// Test Suite: Kisan Saathi APMC Market Pricing & Day-Date-Year Preference Filter
const handler = require('../api/market-prices.js');

function mockReqRes(method, url, body = null) {
  const req = {
    method,
    url,
    headers: { host: 'localhost' },
    body
  };
  return new Promise((resolve) => {
    let statusCode = 200;
    const headers = {};
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      set statusCode(code) { statusCode = code; },
      get statusCode() { return statusCode; },
      end: (data) => {
        resolve({
          statusCode,
          headers,
          data: data ? JSON.parse(data) : null
        });
      }
    };
    handler(req, res);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🌾 Testing APMC Mandi Pricing & Day-Date-Year Filter');
  console.log('====================================================');
  let passed = 0;
  let failed = 0;

  // Test 1: Real-time query for today (2026-10-14)
  try {
    const res = await mockReqRes('GET', '/api/market-prices?date=2026-10-14&commodityId=PADDY_COMMON');
    if (res.statusCode === 200 && res.data.matchedDate === '2026-10-14' && res.data.isExactDate === true) {
      console.log('  ✔ PASS: Real-time query for today (2026-10-14) returns exact date observations');
      passed++;
    } else {
      throw new Error(`Expected 2026-10-14 exact match, got ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 1:', err.message);
    failed++;
  }

  // Test 2: Preference query via day, month, year params (2024-10-14)
  try {
    const res = await mockReqRes('GET', '/api/market-prices?day=14&month=10&year=2024&commodityId=COTTON');
    if (res.statusCode === 200 && res.data.matchedDate === '2024-10-14' && res.data.records.length > 0) {
      console.log('  ✔ PASS: Preference filter using day=14, month=10, year=2024 returns historical rates');
      passed++;
    } else {
      throw new Error(`Expected 2024-10-14 match, got ${res.data.matchedDate}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 2:', err.message);
    failed++;
  }

  // Test 3: Nearest trading day fallback when date has no exact records
  try {
    const res = await mockReqRes('GET', '/api/market-prices?date=2026-10-11&commodityId=MAIZE');
    if (res.statusCode === 200 && res.data.isExactDate === false && res.data.matchedDate) {
      console.log(`  ✔ PASS: Weekend/closed date fallback returned nearest trading day (${res.data.matchedDate})`);
      passed++;
    } else {
      throw new Error('Fallback failed');
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 3:', err.message);
    failed++;
  }

  // Test 4: Net return calculation for farmer inventory
  try {
    const res = await mockReqRes('POST', '/api/market-prices?action=calculate', {
      commodityId: 'PADDY_COMMON',
      marketId: 'TG_MKT_ENUMAMULA',
      quantity: 50,
      unit: 'Quintal',
      transportCostPerQuintal: 45,
      baggingLaborCostPerQuintal: 25
    });
    const c = res.data.calculation;
    if (res.statusCode === 200 && c.grossEstimatedValueInr > 0 && c.netEstimatedReturnInr < c.grossEstimatedValueInr) {
      console.log(`  ✔ PASS: Net return calculation: Gross ₹${c.grossEstimatedValueInr} -> Net ₹${c.netEstimatedReturnInr}`);
      passed++;
    } else {
      throw new Error('Calculation error');
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 4:', err.message);
    failed++;
  }

  // Test 5: Inter-mandi comparison
  try {
    const res = await mockReqRes('GET', '/api/market-prices?action=compare&commodityId=TURMERIC');
    if (res.statusCode === 200 && res.data.comparison.markets.length >= 2) {
      console.log(`  ✔ PASS: Inter-mandi comparison returned ${res.data.comparison.markets.length} mandis with spread ₹${res.data.comparison.priceSpreadInr}/Qtl`);
      passed++;
    } else {
      throw new Error('Comparison failed');
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 5:', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');
  if (failed > 0) process.exit(1);
}

runTests();
