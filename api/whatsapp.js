/**
 * Vercel Serverless Function: Twilio WhatsApp Webhook Endpoint
 * Route: /api/whatsapp
 * Method: POST (Receives Twilio WhatsApp messages, replies with TwiML XML)
 */

const querystring = require('querystring');
const crypto = require('crypto');
const { getKisanAiResponse } = require('./kisan-ai');

/**
 * Escapes characters for safe inclusion in TwiML XML
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Constructs a valid TwiML XML response for Twilio WhatsApp
 */
function createTwiMLResponse(text) {
  const cleanBody = escapeXml(text);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${cleanBody}</Message>\n</Response>`;
}

/**
 * Extracts and parses body from Vercel Serverless Function or Node.js runtime
 */
async function getParsedBody(req) {
  // If already parsed as an object (Vercel automatic body parser)
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  // If provided as a string
  if (typeof req.body === 'string') {
    try {
      const isJson = (req.headers['content-type'] || '').includes('application/json');
      return isJson ? JSON.parse(req.body) : querystring.parse(req.body);
    } catch (_e) {
      return querystring.parse(req.body);
    }
  }

  // If incoming as a readable stream
  return new Promise((resolve) => {
    let rawData = '';
    req.on('data', (chunk) => { rawData += chunk; });
    req.on('end', () => {
      if (!rawData) return resolve({});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          return resolve(JSON.parse(rawData));
        } catch (_e) {}
      }
      return resolve(querystring.parse(rawData));
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Validates the Twilio request signature using HMAC-SHA1
 */
function verifyTwilioSignature(req, params, authToken) {
  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;

  const proto = req.headers['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const fullUrl = `${proto}://${host}${req.url.split('?')[0]}`;

  let data = fullUrl;
  const sortedKeys = Object.keys(params).sort();
  for (const k of sortedKeys) {
    data += k + params[k];
  }

  const expected = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return signature === expected;
}

module.exports = async (req, res) => {
  // 1. Handle GET request as health / informational endpoint
  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'active',
      service: 'KisanSaathi Twilio WhatsApp AI Webhook',
      endpoint: '/api/whatsapp',
      method: 'POST',
      region: 'Telangana',
      timestamp: new Date().toISOString()
    }));
  }

  // 2. Only allow POST requests for Twilio Webhooks
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Allow', 'GET, POST');
    return res.end(JSON.stringify({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] }));
  }

  try {
    // 3. Parse incoming Twilio payload
    const payload = await getParsedBody(req);
    
    // Twilio WhatsApp form fields:
    // Body: The text content of the message
    // From: Sender WhatsApp ID (e.g. "whatsapp:+919876543210")
    // To: Twilio Sandbox number (e.g. "whatsapp:+14155238886")
    // ProfileName: Sender's display name
    // WaId: WhatsApp phone number without prefix
    const incomingBody = (payload.Body || payload.body || '').trim();
    const fromNumber = payload.From || payload.from || '';
    const profileName = payload.ProfileName || payload.profileName || '';

    // 4. Twilio Webhook Signature Validation (if enabled)
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const enforceValidation = process.env.TWILIO_VALIDATE_SIGNATURE === 'true';

    if (enforceValidation && authToken) {
      const isValid = verifyTwilioSignature(req, payload, authToken);
      if (!isValid) {
        console.warn('[Twilio Webhook] Rejected unauthorized request: invalid x-twilio-signature');
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        return res.end(createTwiMLResponse('Unauthorized: Invalid Twilio Webhook Signature.'));
      }
    }

    // 5. Query KisanSaathi AI Engine
    console.log(`[Twilio WhatsApp] Incoming message from "${profileName || fromNumber}": "${incomingBody}"`);
    const aiResponse = await getKisanAiResponse(incomingBody, {
      profileName,
      fromNumber
    });

    // 6. Return TwiML XML Response
    const twimlXml = createTwiMLResponse(aiResponse);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.end(twimlXml);

  } catch (error) {
    console.error('[Twilio WhatsApp Error]', error);

    // Graceful fallback TwiML so the WhatsApp user receives a helpful response rather than silence
    const errorReply = "🌾 *KisanSaathi Support*\n\n" +
      "We experienced a temporary glitch while processing your request. Please try again shortly or contact the Telangana Kisan Call Center directly:\n\n" +
      "📞 *Toll-Free Helpline:* 1800-180-1551";

    const twimlXml = createTwiMLResponse(errorReply);

    res.statusCode = 200; // Return 200 with TwiML to ensure Twilio delivers the fallback message
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.end(twimlXml);
  }
};
