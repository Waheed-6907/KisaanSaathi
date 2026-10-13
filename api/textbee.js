/**
 * Unified Vercel Serverless Function: TextBee SMS Gateway Route
 * Route: /api/textbee
 * Routes incoming webhook requests, status inspection, and polling fallbacks.
 */

const webhookHandler = require('./textbee-webhook');
const statusHandler = require('./textbee-status');
const pollHandler = require('./textbee-poll');

module.exports = async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = (urlObj.searchParams.get('action') || '').toLowerCase();

  // Inbound Webhook POST
  if (req.method === 'POST' && (!action || action === 'webhook')) {
    return webhookHandler(req, res);
  }

  // Polling Trigger
  if (action === 'poll') {
    return pollHandler(req, res);
  }

  // Diagnostics & Status
  return statusHandler(req, res);
};
