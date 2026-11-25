/* server.js — servidor estático simples (sem dependências).
   Uso: node server.js [porta] */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // segurança: impede escape do diretório raiz
  const full = path.normalize(path.join(ROOT, urlPath));
  if (!full.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(full, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback
      const idx = path.join(ROOT, 'index.html');
      fs.readFile(idx, (e2, buf) => {
        if (e2) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' }).end(buf);
      });
      return;
    }
    const ext = path.extname(full).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const headers = {
      'Content-Type': type,
      'Cache-Control': (ext === '.mp3' || ext === '.png' || ext === '.jpg') ? 'public, max-age=3600' : 'no-cache',
      'Accept-Ranges': 'bytes',
    };
    // suporte a Range (necessário para áudio no Safari/iOS)
    const range = req.headers.range;
    if (range && stat.size > 0) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        const start = m[1] ? parseInt(m[1], 10) : 0;
        const end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
        if (start < stat.size && end < stat.size && start <= end) {
          headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
          headers['Content-Length'] = end - start + 1;
          headers['Accept-Ranges'] = 'bytes';
          res.writeHead(206, headers);
          fs.createReadStream(full, { start, end }).pipe(res);
          return;
        }
      }
    }
    headers['Content-Length'] = stat.size;
    if (req.method === 'HEAD') {
      // HEAD nunca carrega corpo: enviar Content-Length do arquivo faz o
      // Chromium abortar a requisição esperando bytes que não chegam.
      const h = Object.assign({}, headers, { 'Content-Length': 0, 'X-Bytes': stat.size });
      delete h['Accept-Ranges'];
      res.writeHead(200, h).end();
      return;
    }
    res.writeHead(200, headers);
    fs.createReadStream(full).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DV PRO → http://0.0.0.0:${PORT}`);
});
