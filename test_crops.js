const https = require('https');

// 1. Query crops
function queryCrops() {
  const options = {
    hostname: 'ytuiolcffxcqnwlefvrr.supabase.co',
    port: 443,
    path: '/rest/v1/crops?select=*',
    method: 'GET',
    headers: {
      'apikey': 'sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH',
      'Authorization': 'Bearer sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Query crops status:', res.statusCode);
      console.log('Crops data:', data);
    });
  });
  req.on('error', e => console.error('Query error:', e));
  req.end();
}

queryCrops();
