/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');

const payload = JSON.stringify({
  product_name: 'Bluetooth Kulaklık',
  category: 'Elektronik',
  language: 'tr',
  country: 'TR',
  platforms: ['trendyol', 'hepsiburada'],
  tone: 'professional',
  extra_keywords: 'uzun pil ömrü, gürültü engelleme'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length,
    'Authorization': 'Bearer test-key'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write('.');
  });
  
  res.on('end', () => {
    console.log('\n\nResponse (first 500 chars):');
    console.log(data.slice(0, 500));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
  process.exit(1);
});

req.write(payload);
req.end();

setTimeout(() => {
  console.error('Request timeout');
  process.exit(1);
}, 10000);
