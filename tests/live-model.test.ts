import { afterAll, beforeAll, expect, test } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { modelCases } from './fixtures/model-cases';
import type { OpportunityDetail, Snapshot } from '@/lib/schemas';
const enabled = process.env.BOUNTYPILOT_LIVE_EVAL === '1';
let store: typeof import('@/lib/server/db');
let service: typeof import('@/lib/server/analysis');
let dir: string;
const realFetch = globalThis.fetch;
let capture: unknown[] = [];
beforeAll(async () => {
  if (!enabled) return;
  mkdirSync('.cache', { recursive: true });
  dir = mkdtempSync(resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache', 'model-eval-'));
  process.env.DATABASE_PATH = resolve(dir, 'eval.sqlite');
  store = await import('@/lib/server/db');
  service = await import('@/lib/server/analysis');
  globalThis.fetch = async (input, init) => {
    const response = await realFetch(input, init);
    if (String(input).endsWith('/api/chat')) capture.push(await response.clone().json());
    return response;
  };
});
afterAll(() => {
  if (enabled) {
    globalThis.fetch = realFetch;
    store.database().close();
  }
});
const cases =
  process.env.BOUNTYPILOT_EVAL_REAL === '1'
    ? [{ name: 'real-issue', text: '', expected: 'Inspect actual sources manually.' }]
    : modelCases;
for (const [index, fixture] of cases.entries())
  test.skipIf(!enabled)(
    `actual Gemma evaluation: ${fixture.name}`,
    async () => {
      let snapshot: Snapshot;
      if (process.env.BOUNTYPILOT_EVAL_REAL === '1') {
        const d = JSON.parse(readFileSync('.cache/live-detail.json', 'utf8'))
          .data as OpportunityDetail;
        snapshot = {
          issue: d,
          repository: d.repository,
          sources: d.sources,
          coverage: d.coverage,
          evidence: d.paidEvidence,
          hash: d.snapshotHash,
          fetchedAt: d.fetchedAt
        };
      } else {
        const { issueSources, paymentEvidence } = await import('@/lib/server/evidence');
        const id = String(800000 + index);
        const issue = {
          id,
          owner: 'synthetic-evaluation',
          repo: 'fixtures',
          number: index + 1,
          url: `https://github.com/synthetic-evaluation/fixtures/issues/${index + 1}`,
          title: `Synthetic evaluation: ${fixture.name}`,
          body: fixture.text,
          state: ('closed' in fixture ? 'closed' : 'open') as 'open' | 'closed',
          locked: false,
          labels: ('labels' in fixture ? fixture.labels : []) || [],
          assignees: 'closed' in fixture ? ['synthetic-contributor'] : [],
          updatedAt: '2026-10-16T00:00:00Z',
          author: 'synthetic-author',
          association: 'NONE',
          commentsReported: 0,
          bodyTruncated: 'truncated' in fixture
        };
        const sources = issueSources(issue);
        snapshot = {
          issue,
          sources,
          evidence: paymentEvidence(sources, 'retrieved_sources'),
          repository: { language: 'TypeScript', private: false, archived: false },
          coverage: {
            commentsReported: 0,
            commentsFetched: 0,
            commentsComplete: !issue.bodyTruncated,
            sourceTruncated: issue.bodyTruncated,
            fetchWarnings: issue.bodyTruncated ? ['Synthetic truncated discussion fixture.'] : []
          },
          hash: `synthetic-${fixture.name}`,
          fetchedAt: '2026-10-16T00:00:00Z'
        };
      }
      store.storeSnapshot(snapshot);
      capture = [];
      const started = performance.now();
      let result: unknown;
      let error: unknown;
      try {
        result = await service.analyzeOpportunity(snapshot.issue.id, {
          model: process.env.GEMMA_MODEL || 'gemma3:4b',
          skills: ['typescript', 'testing']
        });
        expect(store.getAnalysis(snapshot.issue.id)).not.toBeNull();
      } catch (e) {
        error = {
          name: (e as Error).name,
          message: (e as Error).message,
          code: (e as { code?: string }).code
        };
      }
      writeFileSync(
        resolve(dir, `${fixture.name}.json`),
        JSON.stringify(
          { fixture, elapsedMs: performance.now() - started, result, error, generations: capture },
          null,
          2
        )
      );
      console.log(`Evaluation artifact: ${dir}/${fixture.name}.json`);
      expect(error).toBeUndefined();
    },
    150000
  );
