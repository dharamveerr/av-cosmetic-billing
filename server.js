// Tiny local web server for the billing app. Uses only Node's built-in modules (no libraries).
// If the port is busy (for example the server is already running in another Terminal window),
// it tries the next port automatically.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const firstPort = Number(process.env.PORT) || 8080;
// Only these files are served. Everything else (.git history, supabase SQL, server.js, notes) stays private.
const allowed = new Set(['/index.html', '/app.js', '/pdf.js', '/qr.js', '/config.js', '/styles.css']);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  if (!allowed.has(pathname)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
  const file = path.join(root, pathname);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

function start(port, triesLeft) {
  const server = http.createServer(handler);
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && triesLeft > 0) {
      console.log('Port ' + port + ' is already in use (the app may already be running there). Trying ' + (port + 1) + '...');
      start(port + 1, triesLeft - 1);
    } else {
      console.error('Could not start the server: ' + err.message);
      process.exit(1);
    }
  });
  // Bind to this computer only, so other devices on the same Wi-Fi cannot reach the app.
  server.listen(port, '127.0.0.1', () => {
    console.log('AV Cosmetics & Bangle Store billing is running at http://localhost:' + port);
    console.log('Press Ctrl + C to stop.');
  });
}

start(firstPort, 20);
