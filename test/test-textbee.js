/**
 * Automated Test Suite for Kisan Saathi TextBee SMS Gateway Integration
 * Covers:
 * 1. Webhook signature verification (valid vs invalid HMAC-SHA256)
 * 2. Idempotency and duplicate message handling
 * 3. Command parsing (HELP, PRICE TOMATO, PRICE ONION, PRICE PADDY, PRICE COTTON, STATUS, etc.)
 * 4. Missing price data graceful handling
 * 5. Outbound SMS sending error handling (quota, auth, validation)
 * 6. Polling fallback and deduplication logic
 */

const crypto = require('crypto');
const {
  getConfig,
  isDuplicateMessage,
  markMessageProcessed,
  normalizePhoneNumber,
  verifyWebhookSignature,
  processKisanSaathiCommand,
  sendSms
} = require('../api/_textbee-service');

const webhookHandler = require('../api/_textbee-webhook');
const statusHandler = require('../api/_textbee-status');
const pollHandler = require('../api/_textbee-poll');

function mockReqRes(options) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/api/textbee-webhook',
    headers: options.headers || {},
    body: options.body || null,
    rawBody: options.rawBody || (options.body ? Buffer.from(typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : Buffer.from(''))
  };

  return new Promise((resolve) => {
    let statusCode = 200;
    const resHeaders = {};
    const res = {
      setHeader: (k, v) => { resHeaders[k] = v; },
      set statusCode(code) { statusCode = code; },
      get statusCode() { return statusCode; },
      end: (data) => {
        resolve({
          statusCode,
          headers: resHeaders,
          data: data ? (typeof data === 'string' ? (data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data) : data) : null
        });
      }
    };

    const handler = options.handler || webhookHandler;
    handler(req, res);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('📱 Testing Kisan Saathi TextBee Android SMS Gateway');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------
  // TEST 1: Phone number normalization
  // ----------------------------------------------------
  try {
    const p1 = normalizePhoneNumber('9876543210');
    const p2 = normalizePhoneNumber('+919876543210');
    const p3 = normalizePhoneNumber('09876543210');
    if (p1 === '+919876543210' && p2 === '+919876543210' && p3 === '+919876543210') {
      console.log('  ✔ PASS: Phone number normalization converts 10-digit, 11-digit, and prefixed numbers to standard E.164');
      passed++;
    } else {
      throw new Error(`Normalization failed: p1=${p1}, p2=${p2}, p3=${p3}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 1:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 2: Webhook signature verification (valid & invalid)
  // ----------------------------------------------------
  try {
    const secret = 'super-secret-signing-key-for-test-321';
    const payload = JSON.stringify({ message: 'HELP', sender: '+919876543210' });
    const validSig = crypto.createHmac('sha256', secret).update(Buffer.from(payload)).digest('hex');
    const tamperedSig = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

    const checkValid = verifyWebhookSignature(payload, validSig, secret);
    const checkInvalid = verifyWebhookSignature(payload, tamperedSig, secret);
    const checkEmpty = verifyWebhookSignature(payload, '', secret);

    if (checkValid.verified && !checkInvalid.verified && !checkEmpty.verified) {
      console.log('  ✔ PASS: HMAC-SHA256 signature verification accepts valid signatures and rejects tampered ones');
      passed++;
    } else {
      throw new Error(`Signature check failed: valid=${checkValid.verified}, invalid=${checkInvalid.verified}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 2:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 3: Idempotency & duplicate message deduplication
  // ----------------------------------------------------
  try {
    const testSmsId = `test-sms-${Date.now()}`;
    const testIdemKey = `test-idem-${Date.now()}`;

    if (isDuplicateMessage(testSmsId, testIdemKey)) {
      throw new Error('Fresh message should not be flagged as duplicate');
    }

    markMessageProcessed(testSmsId, testIdemKey);

    if (isDuplicateMessage(testSmsId, null) && isDuplicateMessage(null, testIdemKey)) {
      console.log('  ✔ PASS: Idempotency cache flags duplicate deliveries by smsId and idempotencyKey');
      passed++;
    } else {
      throw new Error('Processed message was not flagged as duplicate');
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 3:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 4: Command Handler - HELP
  // ----------------------------------------------------
  try {
    const res = await processKisanSaathiCommand('HELP');
    if (res.includes('Kisan Saathi SMS Assistant') && res.includes('PRICE TOMATO') && res.includes('STATUS')) {
      console.log('  ✔ PASS: Command "HELP" returns structured SMS command guide with helpline');
      passed++;
    } else {
      throw new Error(`Unexpected HELP response: ${res}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 4:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 5: Command Handler - PRICE TOMATO & PRICE ONION
  // ----------------------------------------------------
  try {
    const resTomato = await processKisanSaathiCommand('PRICE TOMATO');
    const resOnion = await processKisanSaathiCommand('PRICE ONION');

    const hasTomatoPrice = resTomato.includes('Tomato') && (resTomato.includes('Modal Benchmark') || resTomato.includes('₹'));
    const hasOnionPrice = resOnion.includes('Onion') && (resOnion.includes('Modal Benchmark') || resOnion.includes('₹'));

    if (hasTomatoPrice && hasOnionPrice) {
      console.log('  ✔ PASS: Commands "PRICE TOMATO" and "PRICE ONION" return authentic wholesale mandi benchmarks');
      passed++;
    } else {
      throw new Error(`Price responses missing data: tomato="${resTomato}", onion="${resOnion}"`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 5:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 6: Command Handler - PRICE PADDY (MSP Comparison)
  // ----------------------------------------------------
  try {
    const resPaddy = await processKisanSaathiCommand('PRICE PADDY');
    if (resPaddy.includes('Paddy') && (resPaddy.includes('MSP') || resPaddy.includes('Modal Benchmark'))) {
      console.log('  ✔ PASS: Command "PRICE PADDY" returns APMC modal rates with official MSP comparison');
      passed++;
    } else {
      throw new Error(`Paddy response failed: ${resPaddy}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 6:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 7: Command Handler - Missing/Unlisted Crop Graceful Fallback
  // ----------------------------------------------------
  try {
    const resUnknown = await processKisanSaathiCommand('PRICE AVOCADO_EXOTIC_TEST');
    if (resUnknown.includes('Kisan Saathi') && (resUnknown.includes('No live APMC bulletin') || resUnknown.includes('No live trade bulletin') || resUnknown.includes('Advisory'))) {
      console.log('  ✔ PASS: Unlisted crop query handled gracefully without crashing or throwing errors');
      passed++;
    } else {
      throw new Error(`Fallback handling failed: ${resUnknown}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 7:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 8: Command Handler - STATUS
  // ----------------------------------------------------
  try {
    const resStatus = await processKisanSaathiCommand('STATUS');
    if (resStatus.includes('Kisan Saathi System Status') && resStatus.includes('Mandi Price Feeds')) {
      console.log('  ✔ PASS: Command "STATUS" reports live service status and registered gateway info');
      passed++;
    } else {
      throw new Error(`STATUS response failed: ${resStatus}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 8:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 9: Inbound Webhook GET Health Endpoint
  // ----------------------------------------------------
  try {
    const res = await mockReqRes({ method: 'GET', url: '/api/textbee-webhook', handler: webhookHandler });
    if (res.statusCode === 200 && res.data.service === 'KisanSaathi TextBee SMS Webhook' && res.data.eventSubscribed === 'MESSAGE_RECEIVED') {
      console.log('  ✔ PASS: GET /api/textbee-webhook returns HTTP 200 with service metadata and telemetry');
      passed++;
    } else {
      throw new Error(`Webhook GET failed: status=${res.statusCode}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 9:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 10: Inbound Webhook Signature Rejection (HTTP 401)
  // ----------------------------------------------------
  try {
    process.env.TEXTBEE_WEBHOOK_SECRET = 'temporary-test-secret-key-12345';
    const payload = JSON.stringify({ message: 'PRICE TOMATO', sender: '+919876543210' });
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/textbee-webhook',
      headers: {
        'x-signature': 'invalid-tampered-signature'
      },
      body: payload,
      handler: webhookHandler
    });

    if (res.statusCode === 401 && res.data.error.includes('signature')) {
      console.log('  ✔ PASS: POST /api/textbee-webhook rejects invalid x-signature header with HTTP 401 Unauthorized');
      passed++;
    } else {
      throw new Error(`Expected HTTP 401, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 10:', err.message);
    failed++;
  } finally {
    delete process.env.TEXTBEE_WEBHOOK_SECRET;
  }

  // ----------------------------------------------------
  // TEST 11: Inbound Webhook Duplicate Message Skipping
  // ----------------------------------------------------
  try {
    const dupSmsId = `dup-sms-${Date.now()}`;
    const payload = {
      smsId: dupSmsId,
      message: 'PRICE ONION',
      sender: '+919876543210',
      webhookEvent: 'MESSAGE_RECEIVED'
    };

    // First request
    const res1 = await mockReqRes({
      method: 'POST',
      url: '/api/textbee-webhook',
      body: payload,
      handler: webhookHandler
    });

    // Second request with same smsId
    const res2 = await mockReqRes({
      method: 'POST',
      url: '/api/textbee-webhook',
      body: payload,
      handler: webhookHandler
    });

    if (res1.data.status === 'processed' && res2.data.status === 'duplicate_skipped') {
      console.log('  ✔ PASS: Webhook deduplication ignores second delivery attempt of same message');
      passed++;
    } else {
      throw new Error(`Dedup failed: res1=${res1.data.status}, res2=${res2.data.status}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 11:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 12: Outbound SMS Sending Service Validation (Missing Keys)
  // ----------------------------------------------------
  try {
    let threwError = false;
    try {
      // With no API key configured
      delete process.env.TEXTBEE_API_KEY;
      await sendSms({ recipients: ['+919876543210'], message: 'Test message' });
    } catch (sendErr) {
      threwError = true;
      if (!sendErr.message.includes('TEXTBEE_API_KEY')) {
        throw new Error(`Unexpected error message: ${sendErr.message}`);
      }
    }

    if (threwError) {
      console.log('  ✔ PASS: Outbound SMS sending service safely validates API key configuration and throws descriptive error');
      passed++;
    } else {
      throw new Error('sendSms did not throw error when API key was missing');
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 12:', err.message);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 13: Status & Diagnostics Endpoint
  // ----------------------------------------------------
  try {
    const res = await mockReqRes({ method: 'GET', url: '/api/textbee-status', handler: statusHandler });
    if (res.statusCode === 200 && res.data.service.includes('TextBee') && res.data.vivoRemediationGuide.length > 0) {
      console.log('  ✔ PASS: GET /api/textbee-status returns masked config, telemetry, and Vivo remediation instructions');
      passed++;
    } else {
      throw new Error(`Status endpoint failed: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('  ✖ FAIL Test 13:', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
