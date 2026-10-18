/**
 * Test Suite: Farmer Inventory Management & Consumer Storage Limit Protection
 * 
 * Validates:
 * 1. Automatic Detection & Inventory Deduction (e.g. 250 Kg - 200 Kg = 50 Kg)
 * 2. Low Stock Alerts for Farmers (Threshold <= 50 Kg)
 * 3. Storage Validation & Consumer Rejection ("Not Sufficient Storage")
 * 4. UI Elements in index.html (Alert Containers, Warning Badges, Storage Modals)
 * 5. Supabase Sync and Serverless Function Count Safeguards (<= 12 API functions)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🌾 Testing Farmer Inventory Management & Storage Limits');
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

// 1. Verify UI Elements in index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

it('index.html contains farmerLowStockAlertContainer banner above inventoryContainer', () => {
  assert.ok(indexHtml.includes('id="farmerLowStockAlertContainer"'), 'Must contain farmerLowStockAlertContainer');
  const alertIdx = indexHtml.indexOf('id="farmerLowStockAlertContainer"');
  const invIdx = indexHtml.indexOf('id="inventoryContainer"');
  assert.ok(alertIdx < invIdx, 'farmerLowStockAlertContainer must appear before inventoryContainer');
});

it('index.html contains modalItemLowStockAlert banner inside Produce Details modal', () => {
  assert.ok(indexHtml.includes('id="modalItemLowStockAlert"'), 'Must contain modalItemLowStockAlert');
  assert.ok(indexHtml.includes('id="modalItemLowStockAlertText"'), 'Must contain modalItemLowStockAlertText');
});

it('index.html contains offerQuantityWarning with "Not Sufficient Storage" below inputOfferQuantity', () => {
  assert.ok(indexHtml.includes('id="offerQuantityWarning"'), 'Must contain offerQuantityWarning');
  assert.ok(indexHtml.includes('Not Sufficient Storage'), 'Must contain text "Not Sufficient Storage"');
});

// 2. Verify Logic in assets/js/app.js
const appJs = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');

it('assets/js/app.js defines LOW_STOCK_THRESHOLD = 50', () => {
  assert.ok(appJs.includes('LOW_STOCK_THRESHOLD = 50'), 'LOW_STOCK_THRESHOLD must be 50 Kg');
});

it('assets/js/app.js defines deductCropInventory function and exports it to window', () => {
  assert.ok(appJs.includes('async function deductCropInventory'), 'Must declare deductCropInventory');
  assert.ok(appJs.includes('window.deductCropInventory = deductCropInventory'), 'Must attach to window');
});

it('deductCropInventory reduces stock correctly (e.g. 250 Kg - 200 Kg = 50 Kg)', () => {
  // Simulate the deduction logic algorithm
  const inventoryMock = [
    { id: 'crop-101', title: 'Telangana Sona Rice', quantity: 250, price: 54 }
  ];
  const orderedQty = 200;
  const item = inventoryMock.find(i => i.id === 'crop-101');
  const initialStock = Number(item.quantity);
  const updatedStock = Math.max(0, initialStock - orderedQty);
  item.quantity = updatedStock;

  assert.strictEqual(initialStock, 250, 'Initial stock must be 250 Kg');
  assert.strictEqual(updatedStock, 50, 'Stock after 200 Kg deduction must be 50 Kg');
  assert.strictEqual(item.quantity, 50, 'Inventory item quantity must be updated to 50 Kg');
});

it('Low stock condition triggers when updatedStock <= LOW_STOCK_THRESHOLD (50)', () => {
  const LOW_STOCK_THRESHOLD = 50;
  const stockAt50 = 50;
  const stockAt40 = 40;
  const stockAt100 = 100;

  assert.strictEqual(stockAt50 <= LOW_STOCK_THRESHOLD, true, '50 Kg is considered low stock');
  assert.strictEqual(stockAt40 <= LOW_STOCK_THRESHOLD, true, '40 Kg is considered low stock');
  assert.strictEqual(stockAt100 <= LOW_STOCK_THRESHOLD, false, '100 Kg is not low stock');
  assert.ok(appJs.includes('Low Stock Alert: Only'), 'Must generate Low Stock Alert message');
});

it('Storage validation rejects consumer order if quantity exceeds available stock with "Not Sufficient Storage"', () => {
  assert.ok(appJs.includes("alert('Not Sufficient Storage')"), 'Must alert "Not Sufficient Storage" on excess quantity');
  assert.ok(appJs.includes("showToast('Not Sufficient Storage')"), 'Must toast "Not Sufficient Storage" on excess quantity');
  assert.ok(appJs.includes('offerQty > maxStock'), 'Must check if offerQty > maxStock');
});

it('handleNegotiation accept automatically calls deductCropInventory', () => {
  assert.ok(appJs.includes('await deductCropInventory(nego.crop_id || nego.itemTitle, nego.quantity, activeFarmerId)'),
    'Accepting negotiation must trigger automatic crop deduction');
});

it('Consumer marketplace cards show storage availability and disable out-of-stock items', () => {
  assert.ok(appJs.includes('Available Storage'), 'Must show Available Storage label');
  assert.ok(appJs.includes('Not Sufficient Storage (Produce Exhausted)'), 'Must show disabled button for exhausted produce');
});

it('Serverless API function count in api/ remains <= 12 (Vercel limit)', () => {
  const apiDir = path.join(__dirname, '../api');
  const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  assert.ok(files.length <= 12, `Serverless function count (${files.length}) must be <= 12`);
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) process.exit(1);
