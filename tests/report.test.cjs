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
    intent: 'bug_fix', complexity: 'simple', risk: 'low',
  }).map(([key, choice]) => [key, { type: 'choice', choice }]));
  return { ok: true, status: 200, text: async () => JSON.stringify({ answers, usage: { cost: 0.001 } }) };
}

function failure() {
  return { ok: false, status: 401, text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }) };
}

test('completed benchmark displays its report and downloads only on request', async () => {
  const app = setup([success()]);
  await app.run();
  assert.equal(app.downloads.length, 0);
  assert.match(app.element('reportContent').innerHTML, /Jev Coding Signal Lab Report/);
  assert.match(app.element('reportContent').innerHTML, /Detailed results/);
  assert.equal(app.element('exportReport').disabled, false);
  app.element('exportReport').onclick();
  assert.equal(app.downloads.length, 1);
  const { filename, blob } = app.downloads[0];
  assert.match(filename, /^jev-coding-signal-report-.*\.md$/);
  const report = await blob.text();
  assert.match(report, /\| Jev 1\.13 \| 1 \| 100%/);
  assert.match(report, /Failed results: 0/);
  assert.equal(report, vm.runInContext('completedReport.markdown', app.context));
  assert.equal(app.storage.size, 0);
});

test('failed and partial runs appear in the displayed report', async () => {
  const failed = setup([failure()]);
  await failed.run();
  assert.equal(failed.downloads.length, 0);
  assert.match(failed.element('reportContent').innerHTML, /Invalid API key/);
  assert.equal(failed.storage.size, 1);
  const partial = setup([success(), failure()]);
  partial.element('repeatCount').value = '2';
  vm.runInContext('waitBetweenCalls = async () => {}', partial.context);
  await partial.run();
  assert.match(partial.element('reportContent').innerHTML, /Partial results: 1/);
});

test('stopped or invalid runs do not download a report', async () => {
  const stopped = setup([new DOMException('Stopped', 'AbortError')]);
  await stopped.run();
  assert.equal(stopped.downloads.length, 0);
  assert.equal(stopped.storage.size, 1);
  assert.equal(stopped.element('exportReport').disabled, true);
  const invalid = setup();
  invalid.context.document.querySelectorAll = () => [];
  await invalid.run();
  assert.equal(invalid.downloads.length, 0);
});

test('resumed benchmark shows checkpoint results without downloading', async () => {
  const app = setup([success()]);
  await app.run();
  vm.runInContext('saveCheckpoint(runSignature(getSelectedCases(), getSelectedModels(), 1), results)', app.context);
  await app.run();
  assert.equal(app.downloads.length, 0);
  assert.match(app.element('reportContent').innerHTML, /Jev 1\.13/);
  assert.equal(app.storage.size, 0);
});

test('report escapes untrusted text in the displayed HTML', () => {
  const app = setup();
  vm.runInContext(`renderReport('# Report\\n\\n- <img src=x onerror=alert(1)>')`, app.context);
  assert.match(app.element('reportContent').innerHTML, /&lt;img/);
  assert.doesNotMatch(app.element('reportContent').innerHTML, /<img/);
});

test('hosted distribution matches the app source', () => {
  assert.equal(readFileSync(resolve(root, 'dist/app.js'), 'utf8'), source);
});

test('new decision models send the full long case to System One', async () => {
  const app = setup();
  const requests = [];
  app.context.fetch = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return success();
  };
  await vm.runInContext(`Promise.all(MODELS.filter(m => ['jev114','decision1'].includes(m.key)).map(m => callClassifier(seedCases[0], 'test-key', m, new AbortController().signal)))`, app.context);
  assert.deepEqual(requests.map(r => r.body.model), ['typesafe/jev-1.14', 'microsoft/microsoft-decision-1']);
  for (const request of requests) {
    assert.equal(request.url, '/api/systemone');
    assert.ok(request.body.state.coding_query.length > 500);
    assert.equal(request.body.state.coding_query, vm.runInContext('seedCases[0].query', app.context));
  }
});

test('every built-in case includes the longer handoff in the classifier input', async () => {
  const app = setup();
  const lengths = vm.runInContext('cases.map(c => c.query.split(/\\s+/).length)', app.context);
  assert.equal(lengths.length, 58);
  assert.ok(Math.min(...lengths) >= 170, `Shortest case has ${Math.min(...lengths)} words`);
  let sent;
  app.context.fetch = async (_url, options) => { sent = JSON.parse(options.body); return success(); };
  await vm.runInContext("callClassifier(cases[0], 'test-key', MODELS[0], new AbortController().signal)", app.context);
  assert.equal(sent.state.coding_query, vm.runInContext('cases[0].query', app.context));
});

test('built-in labels are valid', () => {
  const app = setup();
  assert.equal(vm.runInContext(`cases.every(c => INTENTS.includes(c.intent) && RISKS.includes(c.risk) && COMPLEXITIES.includes(c.complexity))`, app.context), true);
  assert.equal(vm.runInContext('new Set(cases.map(c => c.id)).size === cases.length', app.context), true);
  assert.equal(vm.runInContext("cases.find(c => c.id === 'C52').risk", app.context), 'critical');
  assert.equal(vm.runInContext("cases.find(c => c.id === 'C12').complexity", app.context), 'complex');
});


test('complexity uses only word labels in model requests and scoring', async () => {
  const app = setup([success()]);
  assert.equal(vm.runInContext("'complexity_numeric' in questions() || 'complexity_numeric' in classifierSchema().properties", app.context), false);
  await app.run();
  const report = vm.runInContext('completedReport.markdown', app.context);
  assert.doesNotMatch(report, /complexity numeric/i);
  assert.match(report, /Exact match requires intent, complexity, and risk/);
  assert.match(report, /\| Jev 1\.13 \| 1 \| 100%/);
});
