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
  'data.js',
  'app.js',
  'server.js',
  'vercel.json',
  'assets/data/labs.json'
];

let hasErrors = false;

// 1. Check Node.js runtime version
console.log('\n[1/4] Checking Node.js runtime compatibility...');
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0], 10);
if (majorVersion >= 16) {
  console.log(`  ✔ Node.js version ${nodeVersion} meets requirement (>=16.0.0)`);
} else {
  console.warn(`  ⚠ Warning: Node.js version is ${nodeVersion}, recommended >=16.0.0`);
}

// 2. Verify existence of required files
console.log('\n[2/4] Verifying required files and static assets...');
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
console.log('\n[3/4] Validating JavaScript syntax...');
const jsFiles = ['app.js', 'data.js', 'server.js', 'api/health.js', 'api/labs.js'];
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
console.log('\n[4/4] Validating JSON files...');
const jsonFiles = ['package.json', 'vercel.json', 'assets/data/labs.json'];
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

console.log('\n==================================================');
console.log('✔ Build validation succeeded! Ready for Vercel deployment.');
console.log('==================================================');
process.exit(0);
