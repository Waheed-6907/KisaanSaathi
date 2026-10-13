const https = require('https');

const postData = JSON.stringify({
  crop_name: 'Test Crop Insert via Rest',
  category: 'Paddy / Grains',
  variety: 'RNR 15048',
  quantity_kg: 500,
  ai_grade: 'Elite',
  price_per_kg: 29.50,
  description: 'Test description',
  image_url: 'assets/raw/paddy.png'
});

const options = {
  hostname: 'ytuiolcffxcqnwlefvrr.supabase.co',
  port: 443,
  path: '/rest/v1/crops',
  method: 'POST',
  headers: {
    'apikey': 'sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH',
    'Authorization': 'Bearer sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Insert status:', res.statusCode);
    console.log('Response body:', data);
  });
});
req.on('error', e => console.error('Insert error:', e));
req.write(postData);
req.end();
