// Vercel Serverless Function: Telangana Soil Testing Labs Directory
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const labsFilePath = path.join(__dirname, '..', 'assets', 'data', 'labs.json');
  fs.readFile(labsFilePath, 'utf8', (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unable to load labs data', details: err.message }));
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(data);
  });
};
