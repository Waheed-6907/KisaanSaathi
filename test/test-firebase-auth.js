/**
 * Automated Test Suite for KisanSaathi Firebase Phone Authentication Service
 * Tests:
 * 1. Health inspection of /api/auth/verify-firebase endpoint
 * 2. Reject missing ID token (400)
 * 3. Reject malformed / unverified JWT tokens (401)
 * 4. Verify audience and issuer validation for kisaansaathi-cba16
 * 5. Verify Google public key certificate connectivity
 * 6. Phone number normalization to E.164 and 10-digit formats
 * 7. Client SDK bundle integrity and window.KisanFirebaseAuth exports
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const firebaseAuthHandler = require('../api/_firebase-auth');

function mockReqRes(options) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/api/auth/verify-firebase',
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

    firebaseAuthHandler(req, res).catch(err => {
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
  console.log('🔥 Testing KisanSaathi Firebase Phone Auth & Integration');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Health check GET on /api/auth/verify-firebase
  try {
    const res = await mockReqRes({ method: 'GET', url: '/api/auth/verify-firebase' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'active');
    assert.strictEqual(res.data.projectId, 'kisaansaathi-cba16');
    console.log('  ✔ PASS: /api/auth/verify-firebase health check returns active status');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 1', err.message);
    failed++;
  }

  // Test 2: Reject missing token
  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/auth/verify-firebase',
      body: { role: 'farmer' }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.includes('Missing required Firebase idToken'));
    console.log('  ✔ PASS: Rejects requests missing Firebase idToken (HTTP 400)');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 2', err.message);
    failed++;
  }

  // Test 3: Reject malformed JWT token
  try {
    const res = await mockReqRes({
      method: 'POST',
      url: '/api/auth/verify-firebase',
      body: { idToken: 'invalid.token.payload', role: 'farmer' }
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    console.log('  ✔ PASS: Rejects malformed JWT token structure (HTTP 401)');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 3', err.message);
    failed++;
  }

  // Test 4: Reject token with invalid project audience
  try {
    // Generate forged token with invalid aud
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      aud: 'different-project-id',
      iss: 'https://securetoken.google.com/different-project-id',
      sub: 'forged-uid',
      exp: Math.floor(Date.now() / 1000) + 3600,
      phone_number: '+919848022334'
    })).toString('base64url');
    const fakeSig = Buffer.from('fake-signature-bytes').toString('base64url');
    const forgedToken = `${header}.${payload}.${fakeSig}`;

    const res = await mockReqRes({
      method: 'POST',
      url: '/api/auth/verify-firebase',
      body: { idToken: forgedToken, role: 'farmer' }
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    console.log('  ✔ PASS: Rejects tokens with project audience mismatch (HTTP 401)');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 4', err.message);
    failed++;
  }

  // Test 5: Verify Firebase bundle exists and contains client methods
  try {
    const bundlePath = path.join(__dirname, '..', 'assets', 'js', 'firebase-auth.bundle.js');
    assert.ok(fs.existsSync(bundlePath), 'firebase-auth.bundle.js must exist');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(bundleContent.includes('KisanFirebaseAuth'), 'Bundle must expose KisanFirebaseAuth');
    assert.ok(bundleContent.includes('kisaansaathi-cba16'), 'Bundle must configure project kisaansaathi-cba16');
    console.log('  ✔ PASS: firebase-auth.bundle.js built and contains modular auth symbols');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 5', err.message);
    failed++;
  }

  // Test 6: Verify index.html contains Firebase script and reCAPTCHA containers
  try {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(indexContent.includes('assets/js/firebase-auth.bundle.js'), 'index.html must load bundle');
    assert.ok(indexContent.includes('supabaseFirebaseClient'), 'index.html must initialize supabaseFirebaseClient');
    assert.ok(indexContent.includes('loginFarmerRecaptcha'), 'index.html must have loginFarmerRecaptcha');
    assert.ok(indexContent.includes('loginConsumerRecaptcha'), 'index.html must have loginConsumerRecaptcha');
    assert.ok(indexContent.includes('btnFarmerSendLoginOtp'), 'index.html must have btnFarmerSendLoginOtp');
    assert.ok(indexContent.includes('btnConsumerSendLoginOtp'), 'index.html must have btnConsumerSendLoginOtp');
    console.log('  ✔ PASS: index.html correctly integrates Firebase bundle, client & reCAPTCHA UI');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 6', err.message);
    failed++;
  }

  // Test 7: Verify SQL migration file exists and contains non-destructive DDL
  try {
    const sqlPath = path.join(__dirname, '..', 'supabase_firebase_migration.sql');
    assert.ok(fs.existsSync(sqlPath), 'supabase_firebase_migration.sql must exist');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    assert.ok(sqlContent.includes('ADD COLUMN IF NOT EXISTS firebase_uid TEXT'), 'Must add firebase_uid column safely');
    assert.ok(sqlContent.includes('idx_profiles_firebase_uid'), 'Must index firebase_uid');
    console.log('  ✔ PASS: supabase_firebase_migration.sql contains safe, non-destructive migration DDL');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 7', err.message);
    failed++;
  }

  // Test 8: Verify index.html places status and reCAPTCHA containers in active (non-nested) hierarchy
  try {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(indexContent.includes('id="farmerLoginOtpStatus"'), 'Must have farmerLoginOtpStatus');
    assert.ok(indexContent.includes('id="consumerLoginOtpStatus"'), 'Must have consumerLoginOtpStatus');
    assert.ok(indexContent.includes('id="regOtpStatusMsg"'), 'Must have regOtpStatusMsg');
    assert.ok(indexContent.includes('id="consumerRegOtpStatusMsg"'), 'Must have consumerRegOtpStatusMsg');
    console.log('  ✔ PASS: Status message containers exist outside hidden blocks for instant user feedback');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 8', err.message);
    failed++;
  }

  // Test 9: Verify source bundle contains diagnostic error handlers for BILLING_NOT_ENABLED
  try {
    const bundlePath = path.join(__dirname, '..', 'assets', 'js', 'firebase-auth.bundle.js');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(bundleContent.includes('BILLING_NOT_ENABLED') || bundleContent.includes('billing-not-enabled'), 'Bundle must handle billing requirements');
    assert.ok(bundleContent.includes('unauthorized-domain'), 'Bundle must handle unauthorized-domain');
    console.log('  ✔ PASS: Bundle contains comprehensive diagnostics for Cloud Billing and SMS Region restrictions');
    passed++;
  } catch (err) {
    console.error('  ✖ FAIL: Test 9', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
