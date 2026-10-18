/**
 * Unified Vercel Serverless Function: TextBee SMS Gateway Route
 * Route: /api/textbee
 * Routes incoming webhook requests, status inspection, and polling fallbacks.
 */

const webhookHandler = require('./_textbee-webhook');
const statusHandler = require('./_textbee-status');
const pollHandler = require('./_textbee-poll');
const otpHandler = require('./_otp');
const firebaseAuthHandler = require('./_firebase-auth');

module.exports = async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = (urlObj.searchParams.get('action') || urlObj.searchParams.get('sub') || (urlObj.pathname.includes('webhook') ? 'webhook' : (urlObj.pathname.includes('poll') ? 'poll' : 'status'))).toLowerCase();

  // Firebase Auth Verification & Supabase Profile Mapping Route
  if (action === 'firebase-verify' || action === 'verify-firebase' || action === 'firebase-auth') {
    return firebaseAuthHandler(req, res);
  }

  // OTP SMS & Aadhaar Verification Route
  if (action === 'send-otp' || action === 'verify-otp' || action === 'otp' || action === 'send' || action === 'verify') {
    return otpHandler(req, res);
  }

  // Inbound Webhook POST
  if (req.method === 'POST' || action === 'webhook') {
    return webhookHandler(req, res);
  }

  // Polling Trigger
  if (action === 'poll') {
    return pollHandler(req, res);
  }

  // Diagnostics & Status
  return statusHandler(req, res);
};
