import { expect, test, vi } from 'vitest';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uiSnapshot, uiResult } from './fixtures/ui';
test('500-item pipeline performance and checkpointed backup restore preserve saved analysis', async () => {
  vi.resetModules();
  mkdirSync('.cache', { recursive: true });
  const dir = mkdtempSync(resolve('.cache', 'recovery-'));
  const file = resolve(dir, 'original.sqlite');
  vi.stubEnv('DATABASE_PATH', file);
  const store = await import('@/lib/server/db');
  let closed = false;
  try {
    for (let i = 1; i <= 500; i++) {
      const s = structuredClone(uiSnapshot);
      s.issue.id = String(i);
      s.issue.number = i;
      store.storeSnapshot(s);
      store.saveOpportunity(String(i));
    }
    const record = {
      opportunityId: '123',
      inputHash: 'synthetic-input',
      snapshotHash: uiSnapshot.hash,
      sources: {
        sources: uiSnapshot.sources,
        retrieval: uiSnapshot.coverage,
        inputCharacters: uiSnapshot.sources[0].text.length,
        availableSources: 1,
        omittedOrShortened: false
      },
      result: uiResult,
      skills: ['typescript'],
      modelTag: 'gemma3:4b' as const,
      modelDigest: 'synthetic-test-digest',
      promptVersion: 'test',
      generatedAt: '2026-10-16T00:00:00Z',
      durationMs: 1
    };
    store.storeAnalysis(record);
    const samples = [];
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      expect(store.listSaved()).toHaveLength(500);
      store.saveOpportunity('123');
      store.updateSaved('123', i % 2 ? 'evaluating' : 'saved');
      samples.push(performance.now() - start);
    }
    const sorted = samples.toSorted((a, b) => a - b);
    writeFileSync(
      '.cache/storage-performance.json',
      JSON.stringify(
        {
          platform: process.platform,
          arch: process.arch,
          node: process.version,
          samplesMs: samples,
          p95Ms: sorted[Math.ceil(0.95 * sorted.length) - 1],
          description:
            '20 combined list/idempotent-save/status operations at 500 synthetic saved items; SQLite service timing, no browser/network.'
        },
        null,
        2
      )
    );
    store.database().exec('PRAGMA wal_checkpoint(TRUNCATE)');
    store.database().close();
    closed = true;
    const backup = resolve(dir, 'restored.sqlite');
    copyFileSync(file, backup);
    const restored = store.openDatabase(backup);
    try {
      expect(restored.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
      expect(restored.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
      expect(restored.prepare('SELECT count(*) AS n FROM saved_opportunities').get()?.n).toBe(500);
      expect(
        JSON.parse(
          String(
            restored.prepare('SELECT result_json FROM analyses WHERE opportunity_id=?').get('123')
              ?.result_json
          )
        )
      ).toEqual(uiResult);
      expect(
        restored.prepare('SELECT status FROM saved_opportunities WHERE opportunity_id=?').get('123')
          ?.status
      ).toBe('evaluating');
    } finally {
      restored.close();
    }
  } finally {
    if (!closed) store.database().close();
    vi.unstubAllEnvs();
    rmSync(dir, { recursive: true, force: true });
  }
});
