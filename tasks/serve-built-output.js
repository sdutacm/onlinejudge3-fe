const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 5050);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.css': 'text/css',
  '.eot': 'application/vnd.ms-fontobject',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

function getPathname(req) {
  return new URL(req.url || '/', `http://${host}:${port}`).pathname;
}

function safeFilePath(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^[/\\]+/, '');
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(root, normalized);
  return filePath.startsWith(root) ? filePath : null;
}

function getSpaIndex(pathname) {
  if (pathname === '/onlinejudge3' || pathname.startsWith('/onlinejudge3/')) {
    return path.join(root, 'onlinejudge3/index.html');
  }
  if (pathname === '/onlinejudge3_cs' || pathname.startsWith('/onlinejudge3_cs/')) {
    return path.join(root, 'onlinejudge3_cs/index.html');
  }
  return null;
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    'content-type': contentType,
    'cache-control': 'no-store',
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    send(res, 200, data, contentTypes[path.extname(filePath)] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const pathname = getPathname(req);

  if (pathname === '/vin.txt' || pathname.endsWith('/vin.txt')) {
    send(res, 200, '', 'text/plain');
    return;
  }

  if (pathname.includes('/socket.io/')) {
    send(res, 204, '', 'text/plain');
    return;
  }

  if (/\/onlinejudge3(?:_cs)?\/api\//.test(pathname)) {
    send(
      res,
      404,
      JSON.stringify({ success: false, message: `No built-output mock for ${pathname}` }),
      'application/json',
    );
    return;
  }

  let filePath = safeFilePath(pathname);
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (filePath && fs.existsSync(filePath)) {
    sendFile(res, filePath);
    return;
  }

  const indexPath = getSpaIndex(pathname);
  if (indexPath && fs.existsSync(indexPath)) {
    sendFile(res, indexPath);
    return;
  }

  send(res, 404, 'Not found', 'text/plain');
});

server.listen(port, host, () => {
  console.log(`Serving built output at http://${host}:${port}`);
});
