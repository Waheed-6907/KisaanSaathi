// Lightweight zero-dependency HTTP server & Vercel serverless adapter for KisanSaathi
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.sqlite': 'application/octet-stream',
  '.zip': 'application/zip'
};

function handleRequest(req, res) {
  let reqPath = decodeURI((req.url || '/').split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // API Route: /api/health
  if (reqPath === '/api/health') {
    try {
      const healthHandler = require('./api/health.js');
      return healthHandler(req, res);
    } catch (_e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'healthy', project: 'KisanSaathi' }));
    }
  }

  // API Route: /api/labs
  if (reqPath === '/api/labs') {
    try {
      const labsHandler = require('./api/labs.js');
      return labsHandler(req, res);
    } catch (_e) {
      const labsPath = path.join(ROOT, 'assets/data/labs.json');
      if (fs.existsSync(labsPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return fs.createReadStream(labsPath).pipe(res);
      }
    }
  }

  // Support communication with bound internal service 'web-platform' via WEB_PLATFORM_URL if present
  if (process.env.WEB_PLATFORM_URL && (reqPath.startsWith('/platform') || reqPath.startsWith('/api/platform'))) {
    try {
      const subPath = reqPath.replace(/^\/(?:api\/)?platform/, '') || '/';
      const search = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const targetUrl = new URL(subPath.replace(/^\//, '') + search, process.env.WEB_PLATFORM_URL);

      const proxyReq = http.request(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host
        }
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`502 Bad Gateway: Unable to reach internal service (${err.message})`);
      });

      req.pipe(proxyReq);
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error: ' + err.message);
      return;
    }
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: If requested route is not an asset, fallback to index.html
      const isAsset = /\.(html|css|js|json|png|jpg|jpeg|svg|ico|sqlite|zip)$/i.test(safePath);
      if (!isAsset) {
        const indexPath = path.join(ROOT, 'index.html');
        return fs.readFile(indexPath, (readErr, content) => {
          if (!readErr) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: ' + reqPath);
          }
        });
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(handleRequest);

// Standalone local execution
if (require.main === module) {
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`=======================================================`);
    console.log(`🌾 KisanSaathi Web Platform is LIVE!`);
    console.log(`🌐 Server running at: ${url}`);
    console.log(`📁 Serving from: ${ROOT}`);
    console.log(`Press Ctrl+C to stop.`);
    console.log(`=======================================================`);
  });
}

// Export for Vercel Serverless Function & testing
module.exports = handleRequest;
