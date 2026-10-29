# Jev Coding Signal Lab

Start the static app from this directory:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://localhost:8000 and enter your OpenRouter API key to run a benchmark.

Keep local credentials in `.env.local` at the project root using
`OPENROUTER_API_KEY=your-key`. Git ignores this file. `.env.example` documents
the variable without a key. The static browser app does not read environment
files; enter the key in its password field. Serve only `dist/` as shown above
to keep local credentials outside the web-served directory.

Each finished benchmark automatically downloads a timestamped Markdown report
to your browser's download location. The report includes the model comparison,
accuracy, latency, cost, detailed results, dataset, and any failures or partial
results. A stopped run keeps its browser checkpoint for resuming and does not
download a completion report.

If your browser blocks an automatic download, use **Results → Export report (.md)**.
Use **Export JSON** to save the raw results. Reports are browser downloads; the
static app cannot write them directly into the project's `data` directory.

Run the report regression checks with Node.js:

```bash
node --test tests/report.test.cjs
```
