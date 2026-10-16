import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import os from 'node:os';
import { z } from 'zod';

const model = process.env.GEMMA_MODEL || 'gemma3:4b';
assert(['gemma3:4b', 'gemma3:1b'].includes(model));
const base = new URL(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').origin;
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Performance probe is local-only; never unload a remote user model');
const schema = z.strictObject({ summary: z.string().min(1).max(400), funding: z.null() });
async function post(path, body) {
  const response = await fetch(base + path, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(120000) });
  assert(response.ok, `Ollama HTTP ${response.status}`); return response.json();
}
const tagsResponse = await fetch(base + '/api/tags'); assert(tagsResponse.ok);
const tags = await tagsResponse.json(); const installed = tags.models.find(m => m.name === model); assert(installed, 'Selected model is not installed');
await post('/api/generate', { model, keep_alive: 0 });
const measurements = [];
for (const run of ['cold', 'warm']) {
  const started = performance.now();
  const result = await post('/api/chat', { model, stream: false, format: z.toJSONSchema(schema), messages: [
    { role: 'system', content: 'Summarize this synthetic feasibility input. Funding is unspecified: return null, never invent money. Return JSON matching the schema.' },
    { role: 'user', content: 'Synthetic input, not a real opportunity: implement a TypeScript CSV parser with tests. No funding is stated.' },
  ], options: { temperature: 0, num_ctx: 8192, num_predict: 1200 }, keep_alive: '5m' });
  const output = schema.parse(JSON.parse(result.message.content)); assert.match(output.summary, /parser|CSV/i);
  const measurement = { run, elapsedMs: Math.round(performance.now() - started), totalMs: result.total_duration / 1e6, loadMs: result.load_duration / 1e6, promptTokens: result.prompt_eval_count, generatedTokens: result.eval_count, tokensPerSecond: result.eval_count / (result.eval_duration / 1e9), output };
  measurements.push(measurement); console.log(JSON.stringify(measurement));
}
const ps = await (await fetch(base + '/api/ps')).json();
const record = { measuredAt: new Date().toISOString(), model, digest: installed.digest, node: process.version, hardware: { cpu: os.cpus()[0]?.model, cpus: os.cpus().length, ramBytes: os.totalmem() }, measurements, residency: ps.models };
const directory = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache');
mkdirSync(directory, { recursive: true }); writeFileSync(resolve(directory, `model-probe-${model.replace(':', '-')}.json`), JSON.stringify(record, null, 2));
console.log('Synthetic feasibility probe passed. This is not a real-issue quality evaluation.');
