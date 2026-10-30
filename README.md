# Jev Coding Signal Lab

Start the local app (Node.js 18 or newer):

```bash
node server.cjs
```

Open http://127.0.0.1:8000. The server reads `OPENROUTER_API_KEY` from
`.env.local` at the project root (or from its environment) and proxies benchmark
requests to OpenRouter. The key is not sent to the browser. `.env.local` is
ignored by Git; `.env.example` documents the variable. Restart the app using
this command instead of the old static server.

Each finished benchmark opens its report in the **Report** tab. It includes the
model comparison, accuracy, latency, cost, detailed results, dataset, and any
failures or partial results. Select **Download report (.md)** to save it. A
stopped run keeps its browser checkpoint for resuming. Use **Export JSON** in
the Results tab to save raw results.

Run the report regression checks with Node.js:

```bash
node --test tests/*.test.cjs
```
