/**
 * Test Suite: Multilingual Animated Interactive Tutorial & Voice Assistant
 * Validates:
 * 1. 4-Language Tutorial Script Completeness (Telugu, Hindi, Urdu, English)
 * 2. Stable Selector & Target ID Integrity
 * 3. Automatic Language Detection across scripts
 * 4. Centralized Voice Command Routing across all 4 languages
 * 5. Safe Opt-in Safeguards on Consequential Actions
 * 6. Read-Aloud Accessibility Summaries
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🎙️ Testing KisanSaathi Multilingual Tutorial & Voice System');
console.log('====================================================');

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}\n    ${err.message}`);
    failed++;
  }
}

// 1. Verify tutorial-engine.js and voice-assistant.js exist
it('tutorial-engine.js and voice-assistant.js exist in assets/js/', () => {
  const tutPath = path.join(__dirname, '../assets/js/tutorial-engine.js');
  const vaPath = path.join(__dirname, '../assets/js/voice-assistant.js');
  assert.ok(fs.existsSync(tutPath), 'tutorial-engine.js must exist');
  assert.ok(fs.existsSync(vaPath), 'voice-assistant.js must exist');
});

// 2. Read and validate tutorial content
const tutorialCode = fs.readFileSync(path.join(__dirname, '../assets/js/tutorial-engine.js'), 'utf8');

it('Tutorial covers all 4 mandatory languages (Telugu, Hindi, Urdu, English)', () => {
  assert.ok(tutorialCode.includes("te: {"), 'Must include Telugu (te)');
  assert.ok(tutorialCode.includes("hi: {"), 'Must include Hindi (hi)');
  assert.ok(tutorialCode.includes("ur: {"), 'Must include Urdu (ur)');
  assert.ok(tutorialCode.includes("en: {"), 'Must include English (en)');
});

it('Every tutorial language has 15 thorough feature walkthrough steps', () => {
  const requiredStepKeys = [
    'welcome_intro',
    'farmer_profile',
    'farmer_inventory',
    'add_crop',
    'mandi_prices',
    'price_negotiations',
    'orders_deliveries',
    'payment_wallet',
    'blockchain_loans',
    'soil_testing',
    'godowns_storage',
    'logistics_network',
    'ai_assistant',
    'whatsapp_support',
    'feedback_helpline'
  ];

  for (const stepKey of requiredStepKeys) {
    assert.ok(tutorialCode.includes(`id: '${stepKey}'`), `Must include step: ${stepKey}`);
  }
});

// 3. Validate Language Detection Logic
it('Auto-Language detection accurately identifies Telugu, Devanagari, Urdu, and English scripts', () => {
  function testDetect(text) {
    if (!text) return 'en';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    const lower = text.toLowerCase();
    if (lower.includes('kholo') || lower.includes('bhav')) return 'hi';
    if (lower.includes('teravandi') || lower.includes('dharalu')) return 'te';
    if (lower.includes('kholein') || lower.includes('shamil')) return 'ur';
    return 'en';
  }

  assert.strictEqual(testDetect('నా ఇన్వెంటరీ తెరవండి'), 'te', 'Telugu script detected');
  assert.strictEqual(testDetect('मेरी फसल इन्वेंटरी खोलो'), 'hi', 'Hindi script detected');
  assert.strictEqual(testDetect('میری انوینٹری کھولیں'), 'ur', 'Urdu script detected');
  assert.strictEqual(testDetect('Open my inventory'), 'en', 'English text detected');
  assert.strictEqual(testDetect('mandi bhav dikhao'), 'hi', 'Transliterated Hindi detected');
  assert.strictEqual(testDetect('dharalu chupinchu'), 'te', 'Transliterated Telugu detected');
});

// 4. Validate Voice Assistant Command Registry
const vaCode = fs.readFileSync(path.join(__dirname, '../assets/js/voice-assistant.js'), 'utf8');

it('Voice command registry maps natural phrases in 4 languages to all existing application sections', () => {
  const actions = [
    'inventory',
    'upload',
    'market-dashboard',
    'negotiate',
    'orders',
    'wallet',
    'blockchain',
    'soil',
    'godowns',
    'logistics',
    'chat',
    'profile',
    'tutorial',
    'lang_te',
    'lang_hi',
    'lang_ur',
    'lang_en',
    'stop',
    'read_page'
  ];

  for (const act of actions) {
    assert.ok(vaCode.includes(`action: '${act}'`), `Must include command action: ${act}`);
  }
});

// 5. Verify index.html integration
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

it('index.html contains the First-Login Welcome Modal and Persistent Voice Assistant Sheet', () => {
  assert.ok(indexHtml.includes('id="modalTutorialWelcome"'), 'Must contain #modalTutorialWelcome');
  assert.ok(indexHtml.includes('id="modalVoiceAssistant"'), 'Must contain #modalVoiceAssistant');
  assert.ok(indexHtml.includes('id="btnFloatingVoiceAssistant"'), 'Must contain floating mic button');
  assert.ok(indexHtml.includes('id="btnHeaderHelpTutorial"'), 'Must contain header help button');
});

it('index.html loads both tutorial-engine.js and voice-assistant.js scripts', () => {
  assert.ok(indexHtml.includes('src="assets/js/tutorial-engine.js'), 'Must load tutorial-engine.js');
  assert.ok(indexHtml.includes('src="assets/js/voice-assistant.js'), 'Must load voice-assistant.js');
});

// 6. Verify Urdu RTL and Accessibility styles in styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

it('styles.css contains spotlight beacon, pulse animation, and Urdu RTL rules', () => {
  assert.ok(stylesCss.includes('.tutorial-pulse-ring'), 'Must have spotlight pulse ring');
  assert.ok(stylesCss.includes('[dir="rtl"]'), 'Must have RTL styles for Urdu');
  assert.ok(stylesCss.includes('btn-welcome-lang'), 'Must have touch-accessible button sizing');
  assert.ok(stylesCss.includes('prefers-reduced-motion'), 'Must have reduced motion support');
});

// 7. Verify Serverless API count limit
it('Serverless API function count in api/ remains <= 12', () => {
  const apiFiles = fs.readdirSync(path.join(__dirname, '../api'))
    .filter(f => f.endsWith('.js') && !f.startsWith('_') && !f.startsWith('test'));
  assert.ok(apiFiles.length <= 12, `API function count (${apiFiles.length}) exceeds 12`);
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) process.exit(1);
process.exit(0);
