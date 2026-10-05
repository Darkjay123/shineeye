import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from './src/check.js';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const PORT = Number(process.env.PORT) || 8080;
const MAX_CHARS = 20_000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_CHARS * 2) throw new Error('too large');
  }
  return JSON.parse(body || '{}');
}

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'content-type': type });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}

export async function handleCheck(text, extra = async () => []) {
  const clean = String(text || '').slice(0, MAX_CHARS);
  const base = check(clean);
  const more = await extra(clean, base.flags);
  return more.length ? check(clean, more) : base;
}

let aiFlags = async () => [];
try {
  ({ aiFlags } = await import('./src/ai.js'));
} catch {}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/check') {
      const { text } = await readBody(req);
      if (!text || String(text).trim().length < 40) return send(res, 400, { error: 'too_short' });
      // The pasted text is never logged or stored.
      return send(res, 200, await handleCheck(text, aiFlags));
    }
    if (req.method === 'GET') {
      const path = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
      const file = normalize(join(root, path));
      if (!file.startsWith(root)) return send(res, 404, 'Not found', 'text/plain');
      const data = await readFile(file);
      return send(res, 200, data, TYPES[extname(file)] || 'application/octet-stream');
    }
    send(res, 404, 'Not found', 'text/plain');
  } catch (e) {
    if (e.code === 'ENOENT') return send(res, 404, 'Not found', 'text/plain');
    send(res, 400, { error: 'bad_request' });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`ShineEye running on http://localhost:${PORT}`));
}
