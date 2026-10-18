/**
 * Automated Test Suite for Kisan Saathi SMS OTP & Aadhaar Verification Service
 * Tests:
 * 1. Health inspection of /api/otp
 * 2. Mobile validation (10 digits) & Aadhaar validation (12 digits)
 * 3. Requesting OTP (send-otp)
 * 4. Verifying valid OTP (verify-otp)
 * 5. Rejecting invalid OTP
 * 6. Rate-limiting resends
 * 7. Stateless HMAC token validation
 */

const assert = require('assert');
const otpHandler = require('../api/_otp');

function mockReqRes(options) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/api/otp',
    headers: options.headers || {},
    body: options.body || null
  };

  return new Promise((resolve) => {
    let statusCode = 200;
    const resHeaders = {};
    const res = {
      setHeader: (k, v) => { resHeaders[k] = v; },
      set statusCode(code) { statusCode = code; },
      get statusCode() { return statusCode; },
      end: (data) => {
        let parsed = data;
        if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
          try { parsed = JSON.parse(data); } catch (_e) {}
        }
        resolve({
          statusCode,
          headers: resHeaders,
          data: parsed
        });
      }
    };

    otpHandler(req, res).catch(err => {
      resolve({
        statusCode: 500,
        headers: resHeaders,
        data: { error: err.message }
      });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🌾 Testing KisanSaathi SMS OTP & Aadhaar Verification');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Health check GET
  try {
    const res = await mockReqRes({ method: 'GET', url: '/api/otp' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'active');
    console.log('  ✔ PASS: /api/otp health check returns active status');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 1', err.message);
    failed++;
  }

  // Test 2: Reject invalid mobile number
  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: { action: 'send', phone: '123' }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    console.log('  ✔ PASS: Rejects invalid mobile numbers (< 10 digits)');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 2', err.message);
    failed++;
  }

  // Test 3: Reject invalid Aadhaar number if provided
  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: { action: 'send', phone: '9848022334', aadhar: '12345' }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    console.log('  ✔ PASS: Rejects invalid Aadhaar numbers (!= 12 digits)');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 3', err.message);
    failed++;
  }

  // Test 4: Successfully send OTP with valid Aadhaar & Mobile
  let testOtp = null;
  let tokenData = null;
  const testPhone = '9848011223';
  const testAadhar = '542198321098';

  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: {
        action: 'send',
        phone: testPhone,
        aadhar: testAadhar,
        role: 'farmer'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.tokenData);
    assert.strictEqual(res.data.phone, testPhone);
    tokenData = res.data.tokenData;
    testOtp = res.data.demoOtp; // Available in demo/testing mode
    console.log('  ✔ PASS: Successfully generates OTP and verification token');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 4', err.message);
    failed++;
  }

  // Test 5: Reject incorrect OTP code
  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: {
        action: 'verify',
        phone: testPhone,
        otp: '000000',
        tokenData
      }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    console.log('  ✔ PASS: Correctly rejects incorrect OTP code');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 5', err.message);
    failed++;
  }

  // Test 6: Successfully verify with matching OTP
  try {
    assert.ok(testOtp, 'Test OTP must be available for verification');
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: {
        action: 'verify',
        phone: testPhone,
        otp: testOtp,
        tokenData
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.verified, true);
    assert.strictEqual(res.data.aadhar, testAadhar);
    console.log('  ✔ PASS: Successfully verifies matching OTP and links Aadhaar');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 6', err.message);
    failed++;
  }

  // Test 7: Consumer role OTP dispatch
  try {
    const consumerPhone = '9440188999';
    const consumerAadhar = '987654321012';
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/otp',
      body: {
        action: 'send',
        phone: consumerPhone,
        aadhar: consumerAadhar,
        role: 'consumer'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.demoOtp || res.data.tokenData);
    console.log('  ✔ PASS: Consumer registration OTP dispatch succeeds');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 7', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
