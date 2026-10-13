const https = require('https');

const options = {
  hostname: 'ytuiolcffxcqnwlefvrr.supabase.co',
  port: 443,
  path: '/rest/v1/todos?select=*',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH',
    'Authorization': 'Bearer sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH'
  }
};

const req = https.request(options, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
