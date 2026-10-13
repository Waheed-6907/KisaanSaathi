/**
 * Comprehensive Automated Test Suite for KisanSaathi Twilio WhatsApp Webhook
 */

const assert = require('assert');
const querystring = require('querystring');
const crypto = require('crypto');
const whatsappHandler = require('../api/whatsapp.js');
const { getKisanAiResponse } = require('../api/kisan-ai.js');

// Mock HTTP Request & Response Helpers
function createMockReq({ method = 'POST', body = '', headers = {}, url = '/api/whatsapp' } = {}) {
  const reqHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
    'host': 'kisaansaathi.vercel.app',
    'x-forwarded-proto': 'https',
    ...headers
  };

  return {
    method,
    url,
    headers: reqHeaders,
    body
  };
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
      if (this.onFinish) this.onFinish(this);
      return this;
    }
  };
  return res;
}

async function runHandler(req) {
  const res = createMockRes();
  await whatsappHandler(req, res);
  return res;
}

async function runTests() {
  console.log('====================================================');
  console.log('🌾 Testing KisanSaathi Twilio WhatsApp AI Webhook');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✔ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✖ FAIL: ${name}`);
        console.error(`    ${err.message}`);
        failed++;
      });
  }

  // Test 1: GET health check
  await test('GET /api/whatsapp returns 200 with service information', async () => {
    const req = createMockReq({ method: 'GET' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('application/json'));
    const json = JSON.parse(res.body);
    assert.strictEqual(json.status, 'active');
  });

  // Test 2: Method Not Allowed
  await test('PUT /api/whatsapp returns 405 Method Not Allowed', async () => {
    const req = createMockReq({ method: 'PUT' });
    const res = await runHandler(req);
    assert.strictEqual(res.statusCode, 405);
  });

  // Test 3: Greeting message returns valid TwiML
  await test('POST greeting ("Namaste") returns valid TwiML with welcome guidance', async () => {
    const bodyStr = querystring.stringify({
      Body: 'Namaste',
      From: 'whatsapp:+919876543210',
      ProfileName: 'Ramarao'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/xml'));
    assert.ok(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(res.body.includes('<Response>') && res.body.includes('<Message>'));
    assert.ok(res.body.includes('Ramarao'));
    assert.ok(res.body.includes('KisanSaathi') || res.body.includes('किसान साथी'));
  });

  // Test 4: Mandi rate query in English
  await test('POST Mandi rate query returns Telangana Sona and Mandi prices in TwiML', async () => {
    const bodyStr = querystring.stringify({
      Body: 'What is today paddy mandi price in Warangal?',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('Telangana Sona'));
    assert.ok(res.body.includes('Enumamula Mandi'));
    assert.ok(res.body.includes('1800-180-1551'));
  });

  // Test 5: Organic Pest Spray query
  await test('POST Pest spray query returns Neemastra organic recipe', async () => {
    const bodyStr = querystring.stringify({
      Body: 'How to make organic neem spray for pest control?',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('Neemastra'));
    assert.ok(res.body.includes('neem leaves'));
  });

  // Test 6: Hindi query
  await test('POST Hindi query returns Hindi advisory in TwiML', async () => {
    const bodyStr = querystring.stringify({
      Body: 'वारंगल मंडी में धान का भाव क्या है?',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('तेलंगाना सोना धान'));
    assert.ok(res.body.includes('एनाममुला मंडी'));
  });

  // Test 6b: Telugu query (Bilingual Indian language for Telangana)
  await test('POST Telugu query returns Telugu advisory in TwiML', async () => {
    const bodyStr = querystring.stringify({
      Body: 'వరంగల్ మండిలో వరి ధర ఎంత?',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('తెలంగాణ సోనా'));
    assert.ok(res.body.includes('ఎనుమాముల మండి'));
  });

  // Test 7: Empty message handling
  await test('POST empty Body returns friendly guidance without error', async () => {
    const bodyStr = querystring.stringify({
      Body: '   ',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('<Response>') && res.body.includes('<Message>'));
    assert.ok(res.body.includes('KisanSaathi') || res.body.includes('किसान साथी'));
  });

  // Test 8: XML Escaping of special characters
  await test('Proper XML character escaping in TwiML', async () => {
    const bodyStr = querystring.stringify({
      Body: 'rate & price < Warangal >',
      From: 'whatsapp:+919876543210'
    });
    const req = createMockReq({ body: bodyStr });
    const res = await runHandler(req);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    // Verify valid XML structure by checking matched tags
    assert.ok(res.body.includes('<Response>') && res.body.includes('</Response>'));
    assert.ok(res.body.includes('<Message>') && res.body.includes('</Message>'));
    // Verify raw unescaped HTML/XML brackets are not present in message text
    const messageContent = res.body.substring(res.body.indexOf('<Message>') + 9, res.body.indexOf('</Message>'));
    assert.ok(!messageContent.includes('<'));
    assert.ok(!messageContent.includes('>'));
  });

  // Test 9: Twilio Signature Validation (when enabled)
  await test('Twilio Signature Validation: rejects invalid signature when enforced', async () => {
    process.env.TWILIO_AUTH_TOKEN = 'secret_auth_token_12345';
    process.env.TWILIO_VALIDATE_SIGNATURE = 'true';

    const params = {
      Body: 'Hello',
      From: 'whatsapp:+919876543210'
    };
    const bodyStr = querystring.stringify(params);

    // Provide BAD signature
    const badReq = createMockReq({
      body: params,
      headers: {
        'x-twilio-signature': 'invalid_signature_xyz'
      }
    });
    const badRes = await runHandler(badReq);
    assert.strictEqual(badRes.statusCode, 403);

    // Provide VALID signature
    const url = 'https://kisaansaathi.vercel.app/api/whatsapp';
    let dataStr = url;
    const sortedKeys = Object.keys(params).sort();
    for (const k of sortedKeys) {
      dataStr += k + params[k];
    }
    const goodSignature = crypto
      .createHmac('sha1', 'secret_auth_token_12345')
      .update(Buffer.from(dataStr, 'utf-8'))
      .digest('base64');

    const goodReq = createMockReq({
      body: params,
      headers: {
        'x-twilio-signature': goodSignature
      }
    });
    const goodRes = await runHandler(goodReq);
    assert.strictEqual(goodRes.statusCode, 200);

    // Clean up test env
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_VALIDATE_SIGNATURE;
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
