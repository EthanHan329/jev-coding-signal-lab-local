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

## Why these models

The benchmark asks whether specialized decision models can classify coding-agent
requests accurately, quickly, and cheaply enough to be useful alongside or in
place of a general-purpose LLM. The selected models provide different points of
comparison:

- **Jev 1.13** is the original decision-model baseline. Keeping it in the set
  allows comparisons with previous runs and with the newer Jev release.
- **Jev 1.14** is a newer version of the same decision-model family, allowing a
  version-to-version comparison on the same cases.
- **Microsoft Decision-1** is a decision model from another provider, providing
  a comparison across decision-model families.
- **Qwen3 30B A3B Instruct** is a general-purpose instruct model with coding
  capability and structured output. It is a relatively lightweight chat-model
  baseline for the same classification task.
- **DeepSeek V4 Flash** is a coding- and reasoning-oriented general-purpose
  model. It tests what a more agent-oriented chat model can do on this task.

The two chat models are useful baselines, not a representative sample of every
available LLM or necessarily the best choices for a particular application.
Adding the model used in your own routing workflow would make the comparison
more relevant to your deployment.

## Interpreting comparisons

The models receive the same cases, but the comparison is not fully controlled.
The decision models receive detailed criteria for each choice through the
System One API; the chat models receive a shorter prompt and a JSON schema.
Their instruction differences can affect accuracy. Decision models return
native scores for signals, while chat models return yes/no answers. The mean of
repeated yes/no answers measures consistency, not calibrated probability, and
should not be interpreted as equivalent to a decision-model score.

Latency and cost reflect the actual configured requests and providers, not an
inherent property of the model family. In particular, excluding reasoning from
DeepSeek's response does not necessarily disable reasoning or its token cost.
The cases and expected labels are synthetic, some labels involve judgment, and
many prompts share handoff text. Use the results as a starting point and validate
on representative real tasks before making a routing decision. Model and
provider availability may also depend on region and account eligibility.

Run the report regression checks with Node.js:

```bash
node --test tests/*.test.cjs
```
