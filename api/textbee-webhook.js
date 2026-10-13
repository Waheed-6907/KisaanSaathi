/**
 * Vercel Serverless Function: TextBee Incoming SMS Webhook
 * Route: /api/textbee-webhook (and /api/textbee)
 * Handles "MESSAGE_RECEIVED" webhook event with HMAC-SHA256 signature verification,
 * deduplication, command parsing, and automatic reply dispatch via TextBee.
 */

const {
  getConfig,
  telemetry,
  recordFailure,
  isDuplicateMessage,
  markMessageProcessed,
  verifyWebhookSignature,
  sendSms,
  processKisanSaathiCommand
} = require('./textbee-service');

/**
 * Extracts raw body buffer from request for HMAC-SHA256 verification
 */
async function getRawBody(req) {
  if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
    return req.rawBody;
  }
  if (req.body && Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => resolve(Buffer.from('')));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-signature');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // 1. GET: Health check & diagnostic info
  if (req.method === 'GET') {
    const config = getConfig();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'active',
      service: 'KisanSaathi TextBee SMS Webhook',
      endpoint: '/api/textbee-webhook',
      eventSubscribed: 'MESSAGE_RECEIVED',
      gatewayDeviceConfigured: Boolean(config.deviceId),
      apiKeyConfigured: Boolean(config.apiKey),
      signatureValidationActive: Boolean(config.webhookSecret),
      telemetry: {
        incomingCount: telemetry.incomingCount,
        outgoingCount: telemetry.outgoingCount,
        webhookEventsCount: telemetry.webhookEventsCount,
        lastIncomingAt: telemetry.lastIncomingAt,
        lastOutgoingAt: telemetry.lastOutgoingAt
      },
      timestamp: new Date().toISOString()
    }));
  }

  // 2. Only allow POST for webhooks
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Allow', 'GET, POST');
    return res.end(JSON.stringify({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] }));
  }

  try {
    const config = getConfig();
    const rawBodyBuffer = await getRawBody(req);
    const rawBodyStr = rawBodyBuffer.toString('utf8');

    let payload = {};
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      payload = req.body;
    } else {
      try {
        payload = rawBodyStr ? JSON.parse(rawBodyStr) : {};
      } catch (_e) {
        payload = {};
      }
    }

    // 3. Webhook Signature Verification
    const signature = req.headers['x-signature'] || req.headers['X-Signature'];
    if (config.webhookSecret) {
      const sigCheck = verifyWebhookSignature(rawBodyBuffer, signature, config.webhookSecret);
      if (!sigCheck.verified) {
        const warnMsg = `Rejected webhook request: Invalid x-signature (${sigCheck.reason})`;
        recordFailure('INVALID_SIGNATURE', warnMsg);
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          error: 'Unauthorized: Invalid webhook signature',
          reason: sigCheck.reason
        }));
      }
    }

    // 4. Validate Event Type
    const event = payload.webhookEvent || payload.event || 'MESSAGE_RECEIVED';
    if (event !== 'MESSAGE_RECEIVED' && payload.direction !== 'received') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        status: 'ignored',
        reason: `Unsupported event: ${event}`
      }));
    }

    // 5. Extract Inbound Message Fields
    const smsId = payload.smsId || payload._id || payload.id || null;
    const idempotencyKey = payload.idempotencyKey || null;
    const incomingMessage = (payload.message || payload.body || '').trim();
    const sender = payload.sender || payload.from || payload.phoneNumber || '';
    const deviceId = payload.deviceId || config.deviceId || null;

    if (!incomingMessage || !sender) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        status: 'skipped',
        reason: 'Empty message content or missing sender phone number'
      }));
    }

    // 6. Idempotency & Deduplication
    if (isDuplicateMessage(smsId, idempotencyKey)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        status: 'duplicate_skipped',
        smsId,
        idempotencyKey,
        message: 'Message already processed successfully'
      }));
    }

    // Mark as processed immediately
    markMessageProcessed(smsId, idempotencyKey);
    telemetry.incomingCount++;
    telemetry.webhookEventsCount++;
    telemetry.lastIncomingAt = new Date().toISOString();

    // 7. Process Kisan Saathi Agricultural Command
    const replyText = await processKisanSaathiCommand(incomingMessage, sender);

    // 8. Dispatch Reply SMS back to sender through the same gateway device
    let replyResult = null;
    let replyError = null;

    if (config.apiKey) {
      try {
        replyResult = await sendSms({
          recipients: [sender],
          message: replyText,
          deviceId: deviceId || config.deviceId
        });
      } catch (sendErr) {
        replyError = sendErr.message;
        recordFailure('REPLY_SEND_FAILED', `Failed to send SMS reply to ${sender}: ${sendErr.message}`);
      }
    } else {
      replyError = 'TEXTBEE_API_KEY not configured on server';
      recordFailure('CONFIG_MISSING', replyError);
    }

    // 9. Respond with HTTP 200 OK
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      status: 'processed',
      smsId,
      sender,
      commandProcessed: incomingMessage.slice(0, 30),
      replyGenerated: Boolean(replyText),
      replySent: Boolean(replyResult?.success),
      replyError: replyError || null,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    recordFailure('WEBHOOK_EXCEPTION', error.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Internal error processing TextBee webhook',
      details: error.message
    }));
  }
};
