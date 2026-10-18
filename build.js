// KisanSaathi Production Build & Validation Script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==================================================');
console.log('🌾 KisanSaathi: Validating Build & Project Integrity');
console.log('==================================================');

const requiredFiles = [
  'index.html',
  'styles.css',
  'assets/js/data.js',
  'assets/js/app.js',
  'assets/js/tutorial-engine.js',
  'assets/js/voice-assistant.js',
  'dev-server.js',
  'vercel.json',
  'assets/data/labs.json',
  'assets/data/logistics.json',
  'assets/data/market_prices.json',
  'assets/data/crop_catalogue_90.json'
];

let hasErrors = false;

// 1. Check Node.js runtime version
console.log('\n[1/5] Checking Node.js runtime compatibility...');
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0], 10);
if (majorVersion >= 16) {
  console.log(`  ✔ Node.js version ${nodeVersion} meets requirement (>=16.0.0)`);
} else {
  console.warn(`  ⚠ Warning: Node.js version is ${nodeVersion}, recommended >=16.0.0`);
}

// 2. Verify existence of required files
console.log('\n[2/5] Verifying required files and static assets...');
for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✔ Found: ${file}`);
  } else {
    console.error(`  ✖ Missing required file: ${file}`);
    hasErrors = true;
  }
}

// 3. Validate JavaScript syntax
console.log('\n[3/5] Validating JavaScript syntax...');
const jsFiles = [
  'assets/js/app.js', 
  'assets/js/data.js', 
  'assets/js/tutorial-engine.js',
  'assets/js/voice-assistant.js',
  'dev-server.js', 
  'api/health.js', 
  'api/labs.js', 
  'api/whatsapp.js', 
  'api/kisan-ai.js', 
  'api/logistics.js', 
  'api/voice-saathi.js',
  'api/market-prices.js',
  'api/credit-assessment.js',
  'api/crop-vision.js',
  'api/daily-market-prices.js',
  'api/_textbee-service.js',
  'api/_textbee-webhook.js',
  'api/_textbee-poll.js',
  'api/_textbee-status.js',
  'api/textbee.js',
  'api/otp.js'
];
for (const jsFile of jsFiles) {
  const fullPath = path.join(__dirname, jsFile);
  if (fs.existsSync(fullPath)) {
    try {
      execSync(`node -c "${fullPath}"`);
      console.log(`  ✔ Syntax OK: ${jsFile}`);
    } catch (err) {
      console.error(`  ✖ Syntax error in ${jsFile}:`, err.message);
      hasErrors = true;
    }
  }
}

// 4. Validate JSON configurations
console.log('\n[4/5] Validating JSON files...');
const jsonFiles = ['package.json', 'vercel.json', 'assets/data/labs.json', 'assets/data/logistics.json', 'assets/data/market_prices.json', 'assets/data/crop_catalogue_90.json'];
for (const jsonFile of jsonFiles) {
  const fullPath = path.join(__dirname, jsonFile);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      JSON.parse(content);
      console.log(`  ✔ JSON Valid: ${jsonFile}`);
    } catch (err) {
      console.error(`  ✖ Invalid JSON in ${jsonFile}:`, err.message);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n✖ Build validation failed with errors.');
  process.exit(1);
}

// 5. Generate public/ distribution directory for Vercel
console.log('\n[5/5] Generating public/ output directory for Vercel CDN...');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(publicDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(publicDir, 'styles.css'));

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(path.join(__dirname, 'assets'), path.join(publicDir, 'assets'));
console.log('  ✔ Created public/ directory containing index.html, styles.css, and assets/');

console.log('\n==================================================');
console.log('✔ Build validation succeeded! Ready for Vercel deployment.');
console.log('==================================================');
process.exit(0);
