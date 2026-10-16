import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uiSnapshot, uiResult } from '../fixtures/ui';
// This provider exists only in the automated test process. The app has no demo-data path.
export default async function setup() {
  const cache = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache');
  mkdirSync(cache, { recursive: true });
  const db = new DatabaseSync(resolve(cache, 'e2e-runtime.sqlite'));
  if (!Number(db.prepare('PRAGMA user_version').get()!.user_version)) {
    db.exec(readFileSync('migrations/001_initial.sql', 'utf8'));
    db.exec('PRAGMA user_version=1');
  }
  db.exec(
    'PRAGMA foreign_keys=ON; DELETE FROM saved_opportunities; DELETE FROM analyses; DELETE FROM opportunities;'
  );
  const s = uiSnapshot;
  const i = s.issue;
  db.prepare('INSERT INTO opportunities VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    i.id,
    i.owner,
    i.repo,
    i.number,
    i.url,
    i.title,
    i.state,
    JSON.stringify(s),
    s.hash,
    s.fetchedAt
  );
  db.close();
  let mode = 'ready';
  const server = createServer(async (req, res) => {
    if (req.url === '/test-state') {
      let body = '';
      for await (const part of req) body += part;
      mode = JSON.parse(body).mode;
      res.end('{}');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    if (mode === 'unavailable') {
      res.statusCode = 503;
      res.end('{}');
      return;
    }
    if (req.url === '/api/tags') {
      res.end(
        JSON.stringify({
          models: [{ name: 'gemma3:4b', digest: 'synthetic-test-model', size: 100 }]
        })
      );
      return;
    }
    await new Promise((r) => setTimeout(r, 350));
    res.end(JSON.stringify({ message: { content: JSON.stringify(uiResult) } }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(3101, '127.0.0.1', resolve);
  });
  return () =>
    new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
}
