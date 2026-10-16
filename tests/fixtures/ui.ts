import type { AnalysisResult, Snapshot, OpportunitySummary } from '../../src/lib/schemas';
export const uiSnapshot: Snapshot = {
  issue: {
    id: '123',
    owner: 'synthetic-owner',
    repo: 'fixture',
    number: 7,
    url: 'https://github.com/synthetic-owner/fixture/issues/7',
    title: 'Synthetic fixture: fix CSV parser escaping',
    body: 'Implement a parser for quoted CSV fields. Add regression tests. A $100 reward is claimed; funding is unconfirmed.',
    state: 'open',
    locked: false,
    labels: ['bounty', 'typescript'],
    assignees: [],
    updatedAt: '2026-10-16T00:00:00Z',
    author: 'synthetic-author',
    association: 'NONE',
    commentsReported: 0,
    bodyTruncated: false
  },
  repository: { language: 'TypeScript', archived: false, private: false },
  sources: [
    {
      id: 'issue:123:body',
      kind: 'body',
      url: 'https://github.com/synthetic-owner/fixture/issues/7',
      text: 'Implement a parser for quoted CSV fields. Add regression tests. A $100 reward is claimed; funding is unconfirmed.',
      author: 'synthetic-author',
      association: 'NONE',
      updatedAt: '2026-10-16T00:00:00Z',
      truncated: false
    }
  ],
  evidence: {
    state: 'claim_found',
    excerpts: [
      {
        sourceId: 'issue:123:body',
        quote: 'A $100 reward is claimed; funding is unconfirmed.',
        offset: 63,
        url: 'https://github.com/synthetic-owner/fixture/issues/7',
        author: 'synthetic-author',
        association: 'NONE',
        updatedAt: '2026-10-16T00:00:00Z'
      }
    ],
    coverage: 'retrieved_sources',
    labelOnly: false
  },
  coverage: {
    commentsReported: 0,
    commentsFetched: 0,
    commentsComplete: true,
    sourceTruncated: false,
    fetchWarnings: []
  },
  hash: 'synthetic-ui-snapshot',
  fetchedAt: '2026-10-16T00:00:00Z'
};
export const uiResult: AnalysisResult = {
  summary: 'Synthetic analysis: fix quoted CSV parsing and add tests.',
  skills: ['TypeScript', 'testing'],
  difficulty: 'medium',
  suggestions: ['Begin with an escaped-quote regression test.'],
  risks: [{ text: 'The reward is only a claim.', citationIds: ['c1'] }],
  questions: ['Who authorizes payment?'],
  unknowns: ['Funding, eligibility and payment timing remain unconfirmed.'],
  citations: [{ id: 'c1', sourceId: 'issue:123:body', quote: 'funding is unconfirmed' }]
};
export const uiSummary: OpportunitySummary = {
  ...uiSnapshot.issue,
  paidEvidence: uiSnapshot.evidence,
  score: {
    total: 65,
    version: 'v1',
    parts: { evidence: 25, skills: 0, recency: 20, availability: 15, scope: 5 },
    warnings: ['Skills not specified; no fit points.']
  },
  saved: false
};
export const uiSearch = {
  data: {
    items: [uiSummary],
    page: 1,
    hasNext: false,
    totalCount: 1,
    observedAt: '2026-10-16T00:00:00Z',
    cache: 'miss',
    warnings: ['Issue-only payment signals do not confirm funding.'],
    rateLimit: { remaining: 9 }
  }
};
