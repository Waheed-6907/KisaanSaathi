// Vercel Serverless Function: Health Check Endpoint
module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify({
    status: 'healthy',
    project: 'KisanSaathi',
    version: '3.0.0',
    team: 'Team ForeverKnights',
    region: 'Telangana',
    timestamp: new Date().toISOString()
  }));
};
