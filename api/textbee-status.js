/**
 * Vercel Serverless Function: TextBee Integration Status & Diagnostics
 * Route: /api/textbee-status
 * Powers the frontend status screen and diagnostic suite.
 */

const {
  getConfig,
  telemetry,
  fetchDevices,
  fetchIncomingMessages,
  sendSms,
  processKisanSaathiCommand
} = require('./textbee-service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const config = getConfig();
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action') || 'status';

  // 1. Action: Test Outbound SMS
  if (action === 'test-sms') {
    const toPhone = urlObj.searchParams.get('to') || urlObj.searchParams.get('phone');
    if (!toPhone) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Missing "to" parameter with recipient phone number' }));
    }

    try {
      const sendRes = await sendSms({
        recipients: [toPhone],
        message: '🌾 [Kisan Saathi Test] Connectivity established with Vivo Android SMS Gateway via TextBee API!'
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        message: `Test SMS dispatched successfully to ${toPhone}`,
        result: sendRes
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: `Failed to send test SMS: ${err.message}`
      }));
    }
  }

  // 2. Action: Deep Diagnostic Check
  let deviceCheckResult = null;
  let cloudHistoryCheckResult = null;
  let diagnosticVerdict = null;

  if (config.apiKey) {
    try {
      const devices = await fetchDevices();
      deviceCheckResult = {
        success: true,
        devicesCount: Array.isArray(devices) ? devices.length : (devices?.data?.length || 0),
        devices: devices
      };
    } catch (err) {
      deviceCheckResult = { success: false, error: err.message };
    }

    try {
      const history = await fetchIncomingMessages({ limit: 10 });
      const msgs = Array.isArray(history) ? history : (history.data || history.messages || []);
      cloudHistoryCheckResult = {
        success: true,
        recentMessagesCount: msgs.length,
        messages: msgs.map(m => ({
          id: m._id || m.id,
          sender: m.sender || m.from,
          text: (m.message || m.body || '').slice(0, 30),
          receivedAt: m.receivedAt || m.createdAt
        }))
      };

      if (msgs.length === 0) {
        diagnosticVerdict = {
          issue: 'ANDROID_GATEWAY_INGESTION_FAILURE',
          description: 'SMS reached the physical Vivo Messages app, but TextBee Android app did not forward it to the TextBee Cloud Activity.',
          solution: 'Enable Autostart, set Background Power Consumption to "High power usage", grant All-Time SMS permissions in Vivo Funtouch OS settings, and ensure Foreground Service notification is active.'
        };
      } else {
        diagnosticVerdict = {
          issue: 'NONE',
          description: 'Incoming messages are present in TextBee cloud history and ready for processing.'
        };
      }
    } catch (err) {
      cloudHistoryCheckResult = { success: false, error: err.message };
    }
  } else {
    diagnosticVerdict = {
      issue: 'API_KEY_NOT_CONFIGURED',
      description: 'TEXTBEE_API_KEY is not set on the server environment. Add it in Vercel Environment Variables or .env.local.'
    };
  }

  // 3. Return Full Status Report
  const maskedApiKey = config.apiKey ? `${config.apiKey.slice(0, 6)}...${config.apiKey.slice(-4)}` : null;
  const maskedDeviceId = config.deviceId ? `${config.deviceId.slice(0, 8)}...` : null;
  const publicWebhookUrl = `https://${req.headers.host || 'kisaan-saathi-pi.vercel.app'}/api/textbee-webhook`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    service: 'Kisan Saathi TextBee SMS Gateway',
    gateway: {
      isConfigured: config.isConfigured,
      apiKeyMasked: maskedApiKey,
      deviceIdMasked: maskedDeviceId,
      baseUrl: config.baseUrl,
      publicWebhookUrl,
      webhookSecretConfigured: Boolean(config.webhookSecret),
      supportedEvents: ['MESSAGE_RECEIVED']
    },
    telemetry: {
      incomingCount: telemetry.incomingCount,
      outgoingCount: telemetry.outgoingCount,
      webhookEventsCount: telemetry.webhookEventsCount,
      lastIncomingAt: telemetry.lastIncomingAt,
      lastOutgoingAt: telemetry.lastOutgoingAt,
      lastPollAt: telemetry.lastPollAt,
      recentFailures: telemetry.recentFailures
    },
    liveDiagnostics: {
      deviceCheck: deviceCheckResult,
      cloudHistoryCheck: cloudHistoryCheckResult,
      verdict: diagnosticVerdict
    },
    vivoRemediationGuide: [
      '1. Settings > Battery > Background power consumption > TextBee > High background power usage (or Don\'t optimize)',
      '2. Settings > Applications and Permissions > Autostart > TextBee > Enable',
      '3. Settings > Applications and Permissions > App Permissions > SMS > TextBee > Allow all the time',
      '4. Open TextBee app > Settings > Receive SMS > Enable ("Forward incoming SMS to backend")',
      '5. Lock TextBee app in Recent Apps switcher (padlock icon) to prevent Funtouch OS memory kill',
      '6. Verify the persistent Foreground Service notification ("TextBee Gateway is active") remains visible'
    ],
    timestamp: new Date().toISOString()
  }));
};
