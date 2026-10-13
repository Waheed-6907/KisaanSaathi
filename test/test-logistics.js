/**
 * Comprehensive Automated Test Suite for Kisaan Saathi Logistics Network
 * Verifies zero-hallucination compliance, schema integrity, OSRM routing, tracking portals, and middleman transparency
 */

const assert = require('assert');
const logisticsHandler = require('../api/logistics.js');

function createMockReq({ method = 'GET', url = '/api/logistics', body = null } = {}) {
  let bodyBuffer = null;
  if (body) {
    bodyBuffer = Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  }

  const req = {
    method,
    url,
    headers: {
      'host': 'kisaan-saathi-pi.vercel.app',
      'user-agent': 'KisanSaathi-TestRunner/3.5'
    },
    async *[Symbol.asyncIterator]() {
      if (bodyBuffer) {
        yield bodyBuffer;
      }
    }
  };

  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
    },
    end(data) {
      this.body = data || '';
      return this;
    }
  };
  return res;
}

async function runHandler(req) {
  const res = createMockRes();
  await logisticsHandler(req, res);
  return res;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚚 Testing Kisaan Saathi Logistics Network API');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // TEST 1: Basic GET /api/logistics returns HTTP 200 and verified list
  await test('GET /api/logistics returns HTTP 200 with verified providers list', async () => {
    const req = createMockReq({ url: '/api/logistics' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.total_verified_records >= 15, `Expected >= 15 records, got ${data.total_verified_records}`);
    assert.ok(Array.isArray(data.providers));
  });

  // TEST 2: Schema compliance for every provider record
  await test('Every provider record strictly satisfies the full data architecture schema', async () => {
    const req = createMockReq({ url: '/api/logistics' });
    const res = await runHandler(req);
    const data = JSON.parse(res.body);

    const requiredFields = [
      'provider_id',
      'business_name',
      'service_categories',
      'phone',
      'address',
      'state',
      'district',
      'pin_code',
      'service_areas',
      'official_website',
      'tracking_url',
      'tracking_api_status',
      'source_urls',
      'verification_status',
      'last_verified_at',
      'is_active',
      'notes'
    ];

    for (const p of data.providers) {
      for (const field of requiredFields) {
        assert.ok(p[field] !== undefined, `Provider ${p.provider_id} missing field '${field}'`);
      }
      assert.ok(Array.isArray(p.service_categories), `service_categories must be an array for ${p.provider_id}`);
      assert.ok(Array.isArray(p.source_urls) && p.source_urls.length > 0, `source_urls must be non-empty array for ${p.provider_id}`);
      assert.ok(typeof p.is_active === 'boolean', `is_active must be boolean for ${p.provider_id}`);
      assert.ok(p.official_website.startsWith('http'), `official_website must start with http for ${p.provider_id}`);
    }
  });

  // TEST 3: Zero-hallucination verification citations
  await test('All records have authoritative government or corporate source citations', async () => {
    const req = createMockReq({ url: '/api/logistics' });
    const res = await runHandler(req);
    const data = JSON.parse(res.body);

    const trustedDomains = [
      'enam.gov.in',
      'cewacor.nic.in',
      'cwceportal.com',
      'tgswc.telangana.gov.in',
      'eagrimarket.telangana.gov.in',
      'concorindia.co.in',
      'transin.in',
      'trucksuvidha.com',
      'relay.rivigo.com',
      'tcifreight.in',
      'vtransgroup.com',
      'allcargologistics.com',
      'safexpress.com'
    ];

    for (const p of data.providers) {
      const hasTrustedSource = p.source_urls.some(url =>
        trustedDomains.some(domain => url.includes(domain))
      );
      assert.ok(hasTrustedSource, `Provider ${p.provider_id} (${p.business_name}) lacks an authoritative source in ${p.source_urls.join(', ')}`);
    }
  });

  // TEST 4: Filter by service category (cold_storage)
  await test('Filter by service=cold_storage returns only verified cold chain facilities', async () => {
    const req = createMockReq({ url: '/api/logistics?service=cold_storage' });
    const res = await runHandler(req);
    const data = JSON.parse(res.body);
    assert.ok(data.providers.length > 0);
    for (const p of data.providers) {
      assert.strictEqual(p.cold_storage_available, true, `Provider ${p.provider_id} does not have cold_storage_available=true`);
    }
  });

  // TEST 5: Filter by district (Warangal)
  await test('Filter by district=Warangal returns Enumamula AMC and TGSWC Warangal', async () => {
    const req = createMockReq({ url: '/api/logistics?district=Warangal' });
    const res = await runHandler(req);
    const data = JSON.parse(res.body);
    assert.ok(data.providers.length >= 2, 'Expected at least Enumamula AMC and TGSWC Warangal');
    const names = data.providers.map(p => p.business_name);
    assert.ok(names.some(n => n.includes('Enumamula') || n.includes('Warangal')));
  });

  // TEST 6: Mandi-to-Market Route Planner (Enumamula to Bowenpally)
  await test('Mandi-to-Market route planning returns distance, time, and routing engine notice', async () => {
    const req = createMockReq({ url: '/api/logistics?action=route&origin=enumamula&destination=bowenpally' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.routing.distanceKm > 100, `Distance should be > 100km, got ${data.routing.distanceKm}`);
    assert.ok(data.routing.durationMinutes > 60, `Duration should be > 60 mins, got ${data.routing.durationMinutes}`);
    assert.ok(['osrm_real_driving', 'geodesic_haversine'].includes(data.routing.engine));
    assert.ok(data.routing.disclaimer.length > 10);
    assert.ok(data.anti_hallucination_notice);
  });

  // TEST 7: Route Planner handles invalid locations gracefully
  await test('Route Planner rejects missing or invalid endpoints with HTTP 400', async () => {
    const req = createMockReq({ url: '/api/logistics?action=route&origin=unknown_place' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 400);
    const data = JSON.parse(res.body);
    assert.ok(data.error);
    assert.ok(Array.isArray(data.available_presets));
  });

  // TEST 8: Shipment Tracking redirects to verified portal without fabricated GPS
  await test('Shipment tracking validates waybill and routes to verified official carrier portal', async () => {
    const req = createMockReq({
      url: '/api/logistics?action=track&provider_id=PROV-ENAM-001&tracking_id=TR-78210'
    });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.status, 'verified_portal_redirect');
    assert.strictEqual(data.tracking_id, 'TR-78210');
    assert.strictEqual(data.official_tracking_url, 'https://www.transin.in');
    assert.ok(data.instructions.includes('TransIn Logistics'));
    assert.ok(data.disclaimer.includes('Zero-hallucination'));
  });

  // TEST 9: Middleman & Cost Transparency Calculator
  await test('Middleman Cost Transparency Calculator computes exact deductions and net realization', async () => {
    const payload = {
      gross_sale: 100000,
      quantity_kg: 2000,
      transport_charge: 4500,
      commission_rate_percent: 2.0, // 2% of ₹100,000 = ₹2,000
      handling_charge: 1500,
      mandi_fee_percent: 1.0, // 1% of ₹100,000 = ₹1,000
      other_deductions: 500
    };
    const req = createMockReq({
      method: 'POST',
      url: '/api/logistics?action=transparency',
      body: payload
    });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.status, 'success');

    // Expected:
    // Commission = ₹2000
    // Mandi fee = ₹1000
    // Transport = ₹4500
    // Handling = ₹1500
    // Other = ₹500
    // Total deductions = ₹9500
    // Net received = ₹90500
    // Net per kg = ₹90500 / 2000 = ₹45.25/kg
    assert.strictEqual(data.input_charges.commission_amount, 2000);
    assert.strictEqual(data.input_charges.mandi_fee_amount, 1000);
    assert.strictEqual(data.results.total_deductions, 9500);
    assert.strictEqual(data.results.net_received_by_farmer, 90500);
    assert.strictEqual(data.results.deductions_percentage_of_gross, 9.5);
    assert.strictEqual(data.results.net_realized_price_per_kg, 45.25);
    assert.ok(data.results.estimated_savings_via_direct_or_fpo > 0);
  });

  // TEST 10: Empty state when search query matches nothing
  await test('Empty search returns matched_records=0 and empty array', async () => {
    const req = createMockReq({ url: '/api/logistics?search=nonexistent_query_xyz999' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.matched_records, 0);
    assert.strictEqual(data.providers.length, 0);
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}

module.exports = runTests;
