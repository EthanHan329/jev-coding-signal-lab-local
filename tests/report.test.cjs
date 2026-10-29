const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'app.js'), 'utf8');

function setup(responses = []) {
  const elements = new Map();
  const downloads = [];
  const blobs = new Map();
  const storage = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      value: '', style: {}, classList: { toggle() {} }, addEventListener() {}, focus() {},
    });
    return elements.get(id);
  };
  element('apiKey').value = 'test-key';
  element('sampleCount').value = 'all';
  element('repeatCount').value = '1';
  element('callDelay').value = '0';
  const context = vm.createContext({
    AbortController, Blob, DOMException, performance,
    setTimeout: () => 0, clearTimeout() {},
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    location: { origin: 'http://localhost:8000' },
    URL: {
      createObjectURL(blob) { const url = `blob:${blobs.size}`; blobs.set(url, blob); return url; },
      revokeObjectURL() {},
    },
    document: {
      getElementById: element,
      querySelectorAll(selector) {
        if (selector === '.case-check:checked') return [{ dataset: { id: 'C01' } }];
        if (selector === '.classifier-check:checked') return [{ value: 'jev' }];
        return [];
      },
      createElement(tag) {
        assert.equal(tag, 'a');
        return { click() { downloads.push({ filename: this.download, blob: blobs.get(this.href) }); } };
      },
    },
    async fetch() {
      const response = responses.shift();
      assert.ok(response, 'Unexpected API request');
      if (response instanceof Error) throw response;
      return response;
    },
  });
  vm.runInContext(source, context);
  return { context, downloads, storage, element, run: () => vm.runInContext('runBenchmark()', context) };
}

function success() {
  const answers = Object.fromEntries(Object.entries({
    intent: 'bug_fix', complexity: 'simple', complexity_numeric: '2', risk: 'low',
  }).map(([key, choice]) => [key, { type: 'choice', choice }]));
  return { ok: true, status: 200, text: async () => JSON.stringify({ answers, usage: { cost: 0.001 } }) };
}

function failure() {
  return { ok: false, status: 401, text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }) };
}

test('completed benchmark downloads one timestamped report with its summary', async () => {
  const app = setup([success()]);
  await app.run();
  assert.equal(app.downloads.length, 1);
  const { filename, blob } = app.downloads[0];
  assert.match(filename, /^jev-coding-signal-report-\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d-\d{3}Z\.md$/);
  assert.equal(blob.type, 'text/markdown');
  const report = await blob.text();
  assert.match(report, /\| Jev 1\.13 \| 1 \| 100% \| 100% \| 100% \| 100% \| 100% \|/);
  assert.match(report, /Failed results: 0/);
  assert.match(report, /## Detailed results/);
  assert.match(report, /## Dataset/);
  assert.ok(!report.includes('test-key'));
  assert.equal(app.storage.size, 0);
  assert.equal(app.element('runAll').disabled, false);
});

test('completed benchmark with failures still downloads a report', async () => {
  const app = setup([failure()]);
  await app.run();
  assert.equal(app.downloads.length, 1);
  const report = await app.downloads[0].blob.text();
  assert.match(report, /Failed results: 1/);
  assert.match(report, /## Failures and partial results/);
  assert.match(report, /Invalid API key/);
  assert.equal(app.storage.size, 1);
});

test('partial repeated results appear in the automatic report', async () => {
  const app = setup([success(), failure()]);
  app.element('repeatCount').value = '2';
  vm.runInContext('waitBetweenCalls = async () => {}', app.context);
  await app.run();
  assert.equal(app.downloads.length, 1);
  assert.match(await app.downloads[0].blob.text(), /Partial results: 1/);
});

test('stopped benchmark keeps its checkpoint without downloading a completion report', async () => {
  const app = setup([new DOMException('Stopped', 'AbortError')]);
  await app.run();
  assert.equal(app.downloads.length, 0);
  assert.equal(app.storage.size, 1);
  assert.equal(app.element('toast').textContent, 'Run stopped.');
  assert.equal(app.element('runAll').disabled, false);
});

test('validation failure does not generate a report', async () => {
  const app = setup();
  app.element('apiKey').value = '';
  await app.run();
  assert.equal(app.downloads.length, 0);
  assert.equal(app.storage.size, 0);
});

test('manual export remains available after an automatic report', async () => {
  const app = setup([success()]);
  await app.run();
  app.element('exportReport').onclick();
  assert.equal(app.downloads.length, 2);
  assert.match(await app.downloads[1].blob.text(), /# Jev Coding Signal Lab Report/);
});

test('each subsequent benchmark generates its own report', async () => {
  const app = setup([success(), success()]);
  await app.run();
  await app.run();
  assert.equal(app.downloads.length, 2);
  for (const download of app.downloads) {
    assert.match(await download.blob.text(), /Model–case results: 1/);
  }
});

test('resumed benchmark includes checkpoint results in its automatic report', async () => {
  const app = setup([success()]);
  await app.run();
  vm.runInContext('saveCheckpoint(runSignature(getSelectedCases(), getSelectedModels(), 1), results)', app.context);
  await app.run();
  assert.equal(app.downloads.length, 2);
  assert.match(await app.downloads[1].blob.text(), /\| Jev 1\.13 \| 1 \| 100%/);
  assert.equal(app.storage.size, 0);
});

test('download errors preserve benchmark completion and allow manual retry', async () => {
  const app = setup([success()]);
  vm.runInContext('URL.createObjectURL = () => { throw new Error("Download unavailable"); }', app.context);
  await app.run();
  assert.equal(app.element('runAll').disabled, false);
  assert.equal(app.element('exportReport').disabled, false);
  assert.equal(app.storage.size, 0);
  assert.match(app.element('toast').textContent, /Benchmark complete, but the report download could not start/);
});

test('hosted distribution matches the app source', () => {
  assert.equal(readFileSync(resolve(root, 'dist/app.js'), 'utf8'), source);
});
