// Lightweight zero-dependency HTTP server & Vercel serverless adapter for KisanSaathi
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Automatically parse and load .env.local / .env into process.env if present
['.env.local', '.env'].forEach(envFile => {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...vParts] = trimmed.split('=');
          const key = k.trim();
          const val = vParts.join('=').trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      });
    } catch (_e) {}
  }
});

// Pre-load and cache index.html so it is bundled by @vercel/nft and instantly available in memory
let cachedIndexHtml = '';
try {
  const candidateIndexPaths = [
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'index.html')
  ];
  for (const p of candidateIndexPaths) {
    if (fs.existsSync(p)) {
      cachedIndexHtml = fs.readFileSync(p, 'utf8');
      break;
    }
  }
} catch (_e) {}

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

// Locate a file across possible Vercel serverless execution roots
function resolveFilePath(relPath) {
  const candidates = [
    path.join(ROOT, relPath),
    path.join(process.cwd(), relPath),
    path.join(__dirname, relPath),
    path.join(__dirname, '..', relPath)
  ];
  for (const cand of candidates) {
    try {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        return cand;
      }
    } catch (_e) {}
  }
  return null;
}

function handleRequest(req, res) {
  let reqPath = decodeURI((req.url || '/').split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath === '/app.js') reqPath = '/assets/js/app.js';
  if (reqPath === '/data.js') reqPath = '/assets/js/data.js';

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
      const labsPath = resolveFilePath('assets/data/labs.json');
      if (labsPath) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return fs.createReadStream(labsPath).pipe(res);
      }
    }
  }

  // API Route: /api/whatsapp (Twilio WhatsApp Webhook)
  if (reqPath === '/api/whatsapp') {
    try {
      const whatsappHandler = require('./api/whatsapp.js');
      return whatsappHandler(req, res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'WhatsApp webhook error', details: err.message }));
    }
  }

  // API Route: /api/logistics (Kisaan Saathi Logistics Network)
  if (reqPath === '/api/logistics') {
    try {
      const logisticsHandler = require('./api/logistics.js');
      return logisticsHandler(req, res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Logistics API error', details: err.message }));
    }
  }

  // API Route: /api/kisan-ai (Gemini AI Assistant Engine)
  if (reqPath === '/api/kisan-ai') {
    try {
      const kisanAiHandler = require('./api/kisan-ai.js');
      return kisanAiHandler(req, res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Kisan AI error', details: err.message }));
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

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
  const foundFile = resolveFilePath(safePath);

  if (foundFile) {
    const ext = path.extname(foundFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(foundFile);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });

    return fs.createReadStream(foundFile).pipe(res);
  }

  // Fallback: If index.html is requested or for any SPA route, serve cachedIndexHtml
  const isSpecificAsset = /\.(css|js|json|png|jpg|jpeg|svg|ico|sqlite|zip)$/i.test(safePath);
  if (!isSpecificAsset && cachedIndexHtml) {
    const buffer = Buffer.from(cachedIndexHtml, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(buffer);
  }

  // Fallback for missing static assets
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found: ' + reqPath);
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
