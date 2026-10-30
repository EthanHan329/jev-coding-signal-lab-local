const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server.cjs');

async function withServer(options, run) {
  const server = createServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('proxy keeps credentials on the server and forwards both API routes', async () => {
  const calls = [];
  await withServer({ getKey: () => 'local-secret', upstream: async (url, options) => {
    calls.push({ url, options });
    return new Response('{"answers":{}}', {status:200});
  } }, async origin => {
    for (const route of ['/api/systemone', '/api/chat/completions']) {
      const response = await fetch(origin + route, {method:'POST', headers:{origin,'content-type':'application/json'}, body:'{"model":"example"}'});
      assert.equal(response.status, 200);
      assert.doesNotMatch(await response.text(), /local-secret/);
    }
    assert.deepEqual(calls.map(c => c.url), ['https://openrouter.ai/api/v1/systemone', 'https://openrouter.ai/api/v1/chat/completions']);
    assert.equal(calls[0].options.headers.authorization, 'Bearer local-secret');
    const page = await fetch(origin + '/');
    assert.doesNotMatch(await page.text(), /local-secret/);
    assert.equal((await fetch(origin + '/.env.local')).status, 404);
    assert.equal((await fetch(origin + '/api/systemone', {method:'POST',headers:{origin:'https://example.com','content-type':'application/json'},body:'{}'})).status, 403);
    assert.equal(calls.length, 2);
  });
});

test('missing key produces an actionable error', async () => {
  await withServer({ getKey: () => '' }, async origin => {
    const response = await fetch(origin + '/api/systemone', {method:'POST', headers:{origin,'content-type':'application/json'}, body:'{}'});
    assert.equal(response.status, 503);
    assert.match(await response.text(), /OPENROUTER_API_KEY/);
  });
});
