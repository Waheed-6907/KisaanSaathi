/**
 * KisanSaathi Comprehensive Vegetable Test Suite
 * Validates 100% coverage of all 42 Indian vegetables across the 5 categories
 * from the user's chart:
 * 1. Root & Tuber Vegetables (10 crops)
 * 2. Leafy Greens (10 crops)
 * 3. Gourds and Squashes (9 crops)
 * 4. Cruciferous Vegetables (4 crops)
 * 5. Pods, Beans, and Fruiting Vegetables (9 crops)
 */

const assert = require('assert');
const zlib = require('zlib');
const dailyMarketHandler = require('../api/daily-market-prices.js');
const cropVisionHandler = require('../api/crop-vision.js');

function createMockReq(method = 'GET', url = '/', body = null) {
  return {
    method,
    url,
    headers: { host: 'localhost:3000', 'content-type': 'application/json' },
    body
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(data) { this.body = data; }
  };
}

async function invokeDailyMarket(query) {
  const req = createMockReq('GET', query);
  const res = createMockRes();
  await dailyMarketHandler(req, res);
  return { status: res.statusCode, data: JSON.parse(res.body) };
}

// All 42 vegetables across the 5 chart categories
const CHART_VEGETABLES = [
  // 1. Root and Tuber Vegetables
  { name: 'Potato (Aaloo)', query: 'potato', hindi: 'aaloo', group: 'Root & Tuber' },
  { name: 'Sweet Potato (Shakarkandi)', query: 'sweet_potato', hindi: 'shakarkandi', group: 'Root & Tuber' },
  { name: 'Carrot (Gajar)', query: 'carrot', hindi: 'gajar', group: 'Root & Tuber' },
  { name: 'Radish (Mooli)', query: 'radish', hindi: 'mooli', group: 'Root & Tuber' },
  { name: 'Beetroot (Chukandar)', query: 'beetroot', hindi: 'chukandar', group: 'Root & Tuber' },
  { name: 'Turnip (Shaljam)', query: 'turnip', hindi: 'shaljam', group: 'Root & Tuber' },
  { name: 'Ginger (Adrak)', query: 'ginger', hindi: 'adrak', group: 'Root & Tuber' },
  { name: 'Garlic (Lehsan)', query: 'garlic', hindi: 'lehsan', group: 'Root & Tuber' },
  { name: 'Taro / Arum (Arbi)', query: 'taro_arbi', hindi: 'arbi', group: 'Root & Tuber' },
  { name: 'Elephant Yam (Suran)', query: 'elephant_yam', hindi: 'suran', group: 'Root & Tuber' },

  // 2. Leafy Greens
  { name: 'Spinach (Palak)', query: 'spinach', hindi: 'palak', group: 'Leafy Greens' },
  { name: 'Cabbage (Patta Gobhi)', query: 'cabbage', hindi: 'patta gobhi', group: 'Leafy Greens' },
  { name: 'Fenugreek Leaves (Methi)', query: 'fenugreek_leaves', hindi: 'methi', group: 'Leafy Greens' },
  { name: 'Mustard Leaves (Sarson)', query: 'mustard_leaves', hindi: 'sarson', group: 'Leafy Greens' },
  { name: 'Lettuce (Salad Patta)', query: 'lettuce', hindi: 'lettuce', group: 'Leafy Greens' },
  { name: 'Kale', query: 'kale', hindi: 'kale', group: 'Leafy Greens' },
  { name: 'Coriander / Cilantro (Dhania)', query: 'coriander_leaves', hindi: 'dhania', group: 'Leafy Greens' },
  { name: 'Mint (Pudina)', query: 'mint', hindi: 'pudina', group: 'Leafy Greens' },
  { name: 'Curry Leaves (Kadi Patta)', query: 'curry_leaves', hindi: 'kadi patta', group: 'Leafy Greens' },
  { name: 'Bok Choy', query: 'bok_choy', hindi: 'bok choy', group: 'Leafy Greens' },

  // 3. Gourds and Squashes
  { name: 'Bottle Gourd (Lauki)', query: 'bottle_gourd', hindi: 'lauki', group: 'Gourds & Squashes' },
  { name: 'Bitter Gourd (Karela)', query: 'bitter_gourd', hindi: 'karela', group: 'Gourds & Squashes' },
  { name: 'Ridge Gourd (Torai)', query: 'ridge_gourd', hindi: 'torai', group: 'Gourds & Squashes' },
  { name: 'Sponge Gourd (Gilki)', query: 'sponge_gourd', hindi: 'gilki', group: 'Gourds & Squashes' },
  { name: 'Snake Gourd (Chichinda)', query: 'snake_gourd', hindi: 'chichinda', group: 'Gourds & Squashes' },
  { name: 'Ash Gourd (Safed Petha)', query: 'ash_gourd', hindi: 'safed petha', group: 'Gourds & Squashes' },
  { name: 'Pumpkin (Kaddu)', query: 'pumpkin', hindi: 'kaddu', group: 'Gourds & Squashes' },
  { name: 'Zucchini', query: 'zucchini', hindi: 'zucchini', group: 'Gourds & Squashes' },
  { name: 'Apple Gourd / Round Gourd (Tinda)', query: 'round_gourd_tinda', hindi: 'tinda', group: 'Gourds & Squashes' },

  // 4. Cruciferous Vegetables
  { name: 'Cauliflower (Phool Gobhi)', query: 'cauliflower', hindi: 'phool gobhi', group: 'Cruciferous' },
  { name: 'Broccoli', query: 'broccoli', hindi: 'broccoli', group: 'Cruciferous' },
  { name: 'Brussels Sprouts', query: 'brussels_sprouts', hindi: 'brussels sprouts', group: 'Cruciferous' },
  { name: 'Kohlrabi (Ganth Gobhi)', query: 'kohlrabi', hindi: 'ganth gobhi', group: 'Cruciferous' },

  // 5. Pods, Beans, and Fruiting Vegetables
  { name: 'Tomato (Tamatar)', query: 'tomato', hindi: 'tamatar', group: 'Pods & Fruiting' },
  { name: 'Brinjal / Eggplant (Baingan)', query: 'brinjal', hindi: 'baingan', group: 'Pods & Fruiting' },
  { name: 'Okra / Lady Finger (Bhindi)', query: 'okra', hindi: 'bhindi', group: 'Pods & Fruiting' },
  { name: 'Green Peas (Matar)', query: 'green_peas', hindi: 'matar', group: 'Pods & Fruiting' },
  { name: 'Green Beans / French Beans', query: 'french_beans', hindi: 'french beans', group: 'Pods & Fruiting' },
  { name: 'Capsicum / Bell Pepper (Shimla Mirch)', query: 'capsicum', hindi: 'shimla mirch', group: 'Pods & Fruiting' },
  { name: 'Green Chili (Hari Mirch)', query: 'green_chilli', hindi: 'hari mirch', group: 'Pods & Fruiting' },
  { name: 'Cucumber (Kheera)', query: 'cucumber', hindi: 'kheera', group: 'Pods & Fruiting' },
  { name: 'Corn / Sweet Corn (Makai)', query: 'sweet_corn', hindi: 'makai', group: 'Pods & Fruiting' }
];

async function runVegetableTests() {
  console.log('================================================================');
  console.log('🥦 KisanSaathi Comprehensive 42-Vegetable Multi-Class Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Verify all 42 vegetables exist in daily market pricing
  console.log('--- Phase 1: Validating Market Pricing for all 42 Vegetables ---');
  for (const veg of CHART_VEGETABLES) {
    try {
      const res = await invokeDailyMarket(`/api/daily-market-prices?crop=${encodeURIComponent(veg.query)}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.found, true, `Crop '${veg.name}' must be found in market price directory`);
      assert.strictEqual(res.data.crop.category, 'vegetable');
      assert.ok(res.data.pricing.todayWholesalePrice > 0, `Crop '${veg.name}' must have valid wholesale price`);
      console.log(`  ✔ [${veg.group}] ${veg.name} -> ₹${res.data.pricing.todayWholesalePrice}/kg (${res.data.pricing.market})`);
      passed++;
    } catch (err) {
      console.error(`  ✖ FAILED for ${veg.name}: ${err.message}`);
      failed++;
    }
  }

  // Test 2: Verify Hindi alias lookup for all 42 vegetables
  console.log('\n--- Phase 2: Validating Hindi Aliases & Farmer Transliterations ---');
  for (const veg of CHART_VEGETABLES) {
    try {
      const res = await invokeDailyMarket(`/api/daily-market-prices?crop=${encodeURIComponent(veg.hindi)}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.found, true, `Hindi query '${veg.hindi}' must resolve to produce`);
      console.log(`  ✔ Hindi '${veg.hindi}' resolved to: ${res.data.crop.name}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ Hindi alias FAILED for '${veg.hindi}': ${err.message}`);
      failed++;
    }
  }

  // Test 3: Vision API Recognition for Root, Leafy, Gourd, Cruciferous & Fruiting
  console.log('\n--- Phase 3: Validating Vision Recognition Signatures across Groups ---');
  function generateColorPng(r, g, b) {
    const width = 100, height = 100;
    const rawData = Buffer.alloc(height * (1 + width * 3));
    for (let y = 0; y < height; y++) {
      const rowStart = y * (1 + width * 3);
      rawData[rowStart] = 0;
      for (let x = 0; x < width; x++) {
        const px = rowStart + 1 + x * 3;
        const dx = x - 50, dy = y - 50;
        if (dx * dx + dy * dy < 38 * 38) {
          rawData[px] = r; rawData[px + 1] = g; rawData[px + 2] = b;
        } else {
          rawData[px] = 230; rawData[px + 1] = 230; rawData[px + 2] = 230;
        }
      }
    }
    const compressed = zlib.deflateSync(rawData);
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = Buffer.alloc(25);
    ihdr.writeUInt32BE(13, 0); ihdr.write('IHDR', 4); ihdr.writeUInt32BE(width, 8); ihdr.writeUInt32BE(height, 12);
    ihdr[16] = 8; ihdr[17] = 2; ihdr[18] = 0; ihdr[19] = 0; ihdr[20] = 0;
    ihdr.writeUInt32BE(zlib.crc32(ihdr.slice(4, 21)), 21);
    const idat = Buffer.alloc(12 + compressed.length);
    idat.writeUInt32BE(compressed.length, 0); idat.write('IDAT', 4); compressed.copy(idat, 8);
    idat.writeUInt32BE(zlib.crc32(idat.slice(4, 8 + compressed.length)), 8 + compressed.length);
    const iend = Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    return Buffer.concat([signature, ihdr, idat, iend]);
  }

  const visionTestSamples = [
    { name: 'Red Solanaceous (Tomato)', rgb: [225, 40, 30], expectedCat: 'vegetable' },
    { name: 'Vivid Orange Root (Carrot)', rgb: [230, 110, 25], expectedCat: 'vegetable' },
    { name: 'Deep Violet Fruiting (Brinjal)', rgb: [70, 20, 80], expectedCat: 'vegetable' },
    { name: 'Deep Magenta Tuber (Beetroot)', rgb: [130, 20, 65], expectedCat: 'vegetable' },
    { name: 'Chlorophyll Foliage (Spinach)', rgb: [35, 145, 35], expectedCat: 'vegetable' }
  ];

  for (const sample of visionTestSamples) {
    try {
      const png = generateColorPng(sample.rgb[0], sample.rgb[1], sample.rgb[2]);
      const res = createMockRes();
      await cropVisionHandler(createMockReq('POST', '/api/crop-vision', { imageBase64: png.toString('base64') }), res);
      const body = JSON.parse(res.body);
      assert.strictEqual(body.is_supported_produce, true);
      assert.strictEqual(body.crop_category, sample.expectedCat);
      assert.ok(body.crop_name.length > 0);
      assert.ok(body.market_price && body.market_price.available, 'Market price must be enriched');
      console.log(`  ✔ Sample ${sample.name} classified as: ${body.crop_name} (Category: ${body.crop_category}, Rate: ₹${body.market_price.modalPricePerKg}/kg)`);
      passed++;
    } catch (err) {
      console.error(`  ✖ Vision sample FAILED for ${sample.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed out of ${CHART_VEGETABLES.length * 2 + visionTestSamples.length} tests.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runVegetableTests();
