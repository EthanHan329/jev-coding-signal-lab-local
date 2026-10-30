const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
function readKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  try {
    const line = fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/).find(line => /^\s*OPENROUTER_API_KEY\s*=/.test(line));
    return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2') : '';
  } catch (error) {
    if (error.code === 'ENOENT') return '';
    throw error;
  }
}
function createServer({ getKey = readKey, upstream = fetch } = {}) {
  return http.createServer(async (req, res) => {
    const host = req.headers.host;
    if (!/^127\.0\.0\.1(?::\d+)?$/.test(host || '') && !/^localhost(?::\d+)?$/.test(host || '')) {
      res.writeHead(403).end('Forbidden'); return;
    }
    const routes = { '/api/systemone': 'systemone', '/api/chat/completions': 'chat/completions' };
    if (req.method === 'POST' && routes[req.url]) {
      if (req.headers.origin !== `http://${host}` || !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
        res.writeHead(403).end('Forbidden'); return;
      }
      const key = getKey();
      if (!key) { res.writeHead(503, { 'content-type': 'application/json' }).end(JSON.stringify({error:{message:'Set OPENROUTER_API_KEY in .env.local or the server environment.'}})); return; }
      try {
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 2_000_000) { res.writeHead(413).end('Request too large'); return; }
        }
        JSON.parse(body);
        const response = await upstream(`https://openrouter.ai/api/v1/${routes[req.url]}`, {method:'POST', headers:{'authorization':`Bearer ${key}`,'content-type':'application/json','x-openrouter-title':'Jev Coding Signal Lab'}, body, signal:AbortSignal.timeout(120000)});
        res.writeHead(response.status, {'content-type':'application/json', 'cache-control':'no-store'}).end(await response.text());
      } catch (error) {
        res.writeHead(error instanceof SyntaxError ? 400 : 502, {'content-type':'application/json'}).end(JSON.stringify({error:{message: error instanceof SyntaxError ? 'Invalid JSON' : 'Unable to reach OpenRouter.'}}));
      }
      return;
    }
    const files = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'};
    if (req.method !== 'GET' || !files[req.url]) { res.writeHead(404).end('Not found'); return; }
    const file = files[req.url];
    const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
    try { res.writeHead(200, {'content-type':types[path.extname(file)], 'cache-control':'no-cache'}).end(fs.readFileSync(path.join(root, 'dist', file))); }
    catch { res.writeHead(500).end('Unable to load app'); }
  });
}
if (require.main === module) createServer().listen(8000, '127.0.0.1', () => console.log('Open http://127.0.0.1:8000'));
module.exports = { createServer };
