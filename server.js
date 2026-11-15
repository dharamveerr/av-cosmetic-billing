// Tiny local web server for the billing app. Uses only Node's built-in modules (no libraries).
// If the port is busy (for example the server is already running in another Terminal window),
// it tries the next port automatically.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const firstPort = Number(process.env.PORT) || 8080;
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
  let pathname = decodeURIComponent(req.url.split('?')[0]);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.join(root, pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
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
  server.listen(port, () => {
    console.log('AV Cosmetics & Bangle Store billing is running at http://localhost:' + port);
    console.log('Press Ctrl + C to stop.');
  });
}

start(firstPort, 20);
