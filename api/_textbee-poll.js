/**
 * Vercel Serverless Function: TextBee Polling Fallback Service
 * Route: /api/textbee-poll
 * Polls GET /api/v1/gateway/messages?direction=received to safely ingest
 * incoming SMS even if webhooks are blocked, delayed, or missed during server downtime.
 */

const {
  getConfig,
  telemetry,
  recordFailure,
  isDuplicateMessage,
  markMessageProcessed,
  fetchIncomingMessages,
  sendSms,
  processKisanSaathiCommand
} = require('./_textbee-service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const config = getConfig();
  if (!config.apiKey) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Cannot poll TextBee: TEXTBEE_API_KEY is not configured in server environment'
    }));
  }

  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
    const cursor = urlObj.searchParams.get('cursor') || telemetry.lastPollCursor || null;
    const autoReply = urlObj.searchParams.get('autoReply') !== 'false';

    // 1. Fetch message history from TextBee cloud
    const result = await fetchIncomingMessages({
      limit,
      cursor,
      deviceId: config.deviceId
    });

    const messages = Array.isArray(result) ? result : (result.data || result.messages || []);
    let processedCount = 0;
    let duplicateCount = 0;
    const executionDetails = [];

    // 2. Process incoming messages in chronological order if needed
    for (const msg of messages) {
      const smsId = msg._id || msg.id || msg.smsId;
      const idempotencyKey = msg.idempotencyKey || null;
      const text = msg.message || msg.body || '';
      const sender = msg.sender || msg.from || msg.phoneNumber || '';
      const deviceId = msg.deviceId || config.deviceId;

      if (!text || !sender) continue;

      if (isDuplicateMessage(smsId, idempotencyKey)) {
        duplicateCount++;
        continue;
      }

      markMessageProcessed(smsId, idempotencyKey);
      telemetry.incomingCount++;
      telemetry.lastIncomingAt = new Date().toISOString();
      processedCount++;

      let replySuccess = false;
      let replyError = null;

      if (autoReply) {
        try {
          const replyText = await processKisanSaathiCommand(text, sender);
          const sendRes = await sendSms({
            recipients: [sender],
            message: replyText,
            deviceId
          });
          replySuccess = Boolean(sendRes.success);
        } catch (err) {
          replyError = err.message;
          recordFailure('POLL_REPLY_FAILED', `Failed to reply to ${sender}: ${err.message}`);
        }
      }

      executionDetails.push({
        smsId,
        sender,
        text: text.slice(0, 30),
        replySent: replySuccess,
        replyError
      });
    }

    if (result.nextCursor) {
      telemetry.lastPollCursor = result.nextCursor;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      polledCount: messages.length,
      newMessagesProcessed: processedCount,
      skippedDuplicates: duplicateCount,
      lastPollAt: telemetry.lastPollAt,
      nextCursor: telemetry.lastPollCursor,
      details: executionDetails
    }));

  } catch (error) {
    recordFailure('POLL_EXECUTION_ERROR', error.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Failed to poll TextBee incoming messages',
      details: error.message
    }));
  }
};
