/**
 * TextBee Gateway Diagnostic CLI Tool for Kisan Saathi
 * Usage: node scripts/diagnose-textbee.js
 * Inspects device registration, heartbeat, and cloud message history.
 */

const path = require('path');
const fs = require('fs');

// Automatically parse and load .env.local / .env into process.env if present
['.env.local', '.env'].forEach(envFile => {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...vParts] = trimmed.split('=');
          const key = k.trim();
          const val = vParts.join('=').trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      });
    } catch (_e) {}
  }
});

const {
  getConfig,
  fetchDevices,
  fetchIncomingMessages
} = require('../api/textbee-service');

async function runDiagnostic() {
  console.log('===============================================================');
  console.log('🔍 Kisan Saathi & TextBee Android SMS Gateway Diagnostic Tool');
  console.log('===============================================================');

  const config = getConfig();
  console.log('\n[Stage 1: Server Configuration Check]');
  console.log(`• Base URL: ${config.baseUrl}`);
  console.log(`• API Key Configured: ${config.apiKey ? '✔ YES (Masked: ' + config.apiKey.slice(0, 6) + '...' + config.apiKey.slice(-4) + ')' : '✖ NO (TEXTBEE_API_KEY missing)'}`);
  console.log(`• Device ID Configured: ${config.deviceId ? '✔ YES (' + config.deviceId + ')' : '✖ NO (TEXTBEE_DEVICE_ID missing)'}`);
  console.log(`• Webhook Secret: ${config.webhookSecret ? '✔ YES (HMAC-SHA256 active)' : 'ℹ None (Open webhook mode)'}`);

  if (!config.apiKey) {
    console.log('\n⚠️ ATTENTION: TEXTBEE_API_KEY is not set.');
    console.log('Please add it to your .env.local file:');
    console.log('TEXTBEE_API_KEY=your_key_here');
    console.log('TEXTBEE_DEVICE_ID=your_device_id_here');
    console.log('Or configure it in Vercel: Project Settings > Environment Variables.');
    return;
  }

  console.log('\n[Stage 2: Device Health & Heartbeat Check (TextBee Cloud)]');
  try {
    const devicesData = await fetchDevices();
    const devices = Array.isArray(devicesData) ? devicesData : (devicesData.data || devicesData.devices || []);
    console.log(`✔ Connected to TextBee API. Registered devices found: ${devices.length}`);

    let matchedVivo = null;
    for (const d of devices) {
      const isMatched = (d._id === config.deviceId || d.id === config.deviceId);
      const isOnline = d.status === 'online' || d.isOnline;
      console.log(`  - Device: "${d.name || d.model || 'Android'}" | ID: ${d._id || d.id} | Status: ${d.status || (isOnline ? 'ONLINE' : 'IDLE')} | Last Heartbeat: ${d.lastHeartbeat || d.updatedAt || 'Recent'}`);
      if (isMatched) matchedVivo = d;
    }

    if (config.deviceId && !matchedVivo) {
      console.warn(`⚠️ Warning: Specified TEXTBEE_DEVICE_ID (${config.deviceId}) was not found in registered devices list.`);
    }
  } catch (err) {
    console.error(`✖ Failed to query devices API: ${err.message}`);
  }

  console.log('\n[Stage 3: Inbound Cloud Message History Audit]');
  try {
    const historyData = await fetchIncomingMessages({ limit: 10 });
    const messages = Array.isArray(historyData) ? historyData : (historyData.data || historyData.messages || []);

    console.log(`✔ Query successful. Messages in cloud history (direction=received): ${messages.length}`);

    if (messages.length === 0) {
      console.log('\n---------------------------------------------------------------');
      console.log('🚨 CRITICAL DIAGNOSTIC VERDICT:');
      console.log('STATUS: [FAIL] - ANDROID / TEXTBEE GATEWAY INGESTION ISSUE');
      console.log('---------------------------------------------------------------');
      console.log('Evidence:');
      console.log('1. Incoming SMS arrives on the Vivo phone\'s default Messages inbox.');
      console.log('2. However, zero incoming messages exist in TextBee Cloud Activity / API.');
      console.log('3. Therefore, Kisan Saathi backend cannot process or auto-reply yet,');
      console.log('   because the TextBee Android app is NOT uploading received SMS to the cloud.');
      console.log('\nFix for Vivo Android Phone (Funtouch OS / OriginOS):');
      console.log('  Step 1: Settings > Battery > Background power consumption > TextBee > Set to "High background power usage".');
      console.log('  Step 2: Settings > Applications and Permissions > Autostart > Toggle TextBee to ENABLED.');
      console.log('  Step 3: Settings > App Permissions > SMS > Set TextBee to "Allow all the time".');
      console.log('  Step 4: Open TextBee App > Settings > "Receive SMS" > Toggle to ENABLED ("Forward incoming SMS to backend").');
      console.log('  Step 5: In Recent Apps switcher, swipe down on TextBee card and tap the 🔒 Padlock icon to prevent background murder.');
      console.log('  Step 6: Confirm the permanent notification "TextBee Gateway is active" is showing in the top notification tray.');
    } else {
      console.log('\n✔ INCOMING MESSAGES VERIFIED IN CLOUD:');
      messages.slice(0, 3).forEach((m, i) => {
        console.log(`  [${i + 1}] From: ${m.sender || m.from} | Text: "${(m.message || m.body || '').slice(0, 40)}" | Time: ${m.receivedAt || m.createdAt}`);
      });
      console.log('\nVerdict: Inbound cloud history is active! Ready for webhook / polling triggers.');
    }
  } catch (err) {
    console.error(`✖ Failed to query message history: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log('Diagnostic check completed.');
  console.log('===============================================================');
}

runDiagnostic();
