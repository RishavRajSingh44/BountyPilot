import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchSchema } from '@/lib/schemas';
import { issueSources, paymentEvidence } from '@/lib/server/evidence';
import { rank } from '@/lib/server/ranking';
import { githubIssue } from './fixtures/github';
const saved = vi.hoisted(() => [] as { opportunity_id: string }[]);
vi.mock('@/lib/server/db', () => ({ database: () => ({ prepare: () => ({ all: () => saved }) }) }));
beforeEach(() => {
  vi.resetModules();
  saved.length = 0;
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-16T12:00:00Z'));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
const response = (items: unknown[] = [githubIssue], extra = {}) =>
  Response.json({ total_count: items.length, incomplete_results: false, items, ...extra });

describe('queries and GitHub transport', () => {
  it.each([
    { keywords: 'x is:private' },
    { keywords: 'x OR y' },
    { keywords: '"unbalanced' },
    { repo: '../private' },
    { language: 'JS" is:private' },
    { page: 41 },
    { skills: Array(11).fill('x') }
  ])('rejects invalid filters %j', (input) => {
    expect(searchSchema.safeParse(input).success).toBe(false);
  });
  it('searches public/open issues, retains observed time and refreshes saved state on cache hits', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response());
    vi.stubGlobal('fetch', fetchMock);
    const { searchOpportunities } = await import('@/lib/server/github');
    const first = await searchOpportunities({ skills: ['typescript'] });
    expect(first.items[0].paidEvidence.state).toBe('claim_found');
    expect(first.items[0].saved).toBe(false);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('q')).toBe('bounty is:issue is:open is:public');
    expect(url.searchParams.get('per_page')).toBe('25');
    saved.push({ opportunity_id: '123' });
    vi.setSystemTime(new Date('2026-10-16T12:00:20Z'));
    const second = await searchOpportunities({ skills: ['typescript'] });
    expect(second.cache).toBe('hit');
    expect(second.items[0].saved).toBe(true);
    expect(second.observedAt).toBe(first.observedAt);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('keeps page size fixed at the 1,000 result boundary and exposes incomplete results', async () => {
    const mock = vi
      .fn()
      .mockResolvedValue(response([], { total_count: 2000, incomplete_results: true }));
    vi.stubGlobal('fetch', mock);
    const { searchOpportunities } = await import('@/lib/server/github');
    const result = await searchOpportunities({ page: 40 });
    const url = new URL(mock.mock.calls[0][0]);
    expect(url.searchParams.get('page')).toBe('40');
    expect(url.searchParams.get('per_page')).toBe('25');
    expect(result.hasNext).toBe(false);
    expect(result.incompleteResults).toBe(true);
  });
  it('expires search cache after 60 seconds', async () => {
    const mock = vi.fn().mockImplementation(() => Promise.resolve(response()));
    vi.stubGlobal('fetch', mock);
    const { searchOpportunities } = await import('@/lib/server/github');
    await searchOpportunities({});
    vi.setSystemTime(Date.now() + 60001);
    expect((await searchOpportunities({})).cache).toBe('miss');
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('caps search cache entries at 50', async () => {
    const mock = vi.fn().mockImplementation(() => Promise.resolve(response()));
    vi.stubGlobal('fetch', mock);
    const { searchOpportunities } = await import('@/lib/server/github');
    for (let i = 0; i < 51; i++) await searchOpportunities({ keywords: `fixture${i}` });
    expect((await searchOpportunities({ keywords: 'fixture0' })).cache).toBe('miss');
    expect(mock).toHaveBeenCalledTimes(52);
  });
  it('omits PRs and closed issues and rejects private data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response([
          { ...githubIssue, pull_request: {} },
          { ...githubIssue, state: 'closed' }
        ])
      )
    );
    const { searchOpportunities } = await import('@/lib/server/github');
    expect((await searchOpportunities({})).items).toEqual([]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response([{ ...githubIssue, repository: { private: true } }]))
    );
    await expect(searchOpportunities({ keywords: 'different' })).rejects.toMatchObject({
      code: 'GITHUB_INVALID_RESPONSE'
    });
  });
  it('maps quota and prevents a retry storm', async () => {
    const mock = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { message: 'API rate limit exceeded' },
          { status: 403, headers: { 'retry-after': '60' } }
        )
      );
    vi.stubGlobal('fetch', mock);
    const { githubGet } = await import('@/lib/server/github');
    await expect(githubGet('/search/issues?q=x')).rejects.toMatchObject({ status: 429 });
    await expect(githubGet('/search/issues?q=y')).rejects.toMatchObject({ status: 429 });
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it.each([
    [401, 'GITHUB_AUTH'],
    [422, 'GITHUB_QUERY'],
    [404, 'SOURCE_UNAVAILABLE'],
    [302, 'GITHUB_MOVED']
  ])('maps HTTP %s without exposing provider text', async (status, code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('private canary', { status: Number(status) }))
    );
    const { githubGet } = await import('@/lib/server/github');
    await expect(githubGet('/search/issues?q=x')).rejects.toMatchObject({ code });
  });
  it('retries a transient failure once and validates safe numeric IDs', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(response());
    vi.stubGlobal('fetch', mock);
    const { searchOpportunities, normalizeIssue } = await import('@/lib/server/github');
    expect((await searchOpportunities({})).items).toHaveLength(1);
    expect(mock).toHaveBeenCalledTimes(2);
    expect(() =>
      normalizeIssue(
        { ...githubIssue, id: Number.MAX_SAFE_INTEGER + 1 },
        'synthetic-owner',
        'fixture'
      )
    ).toThrow();
  });
});

describe('evidence and ranking', () => {
  it.each([
    ['No bounty. This is not paid.', 'conflicting'],
    ['Reward withdrawn; USD 100 was previously offered.', 'conflicting'],
    ['If we had a sponsor, we could hypothetically offer a $500 bounty.', 'signal_only'],
    ['Reward USD 100 for parser tests.', 'claim_found'],
    ['A paid task, amount unknown.', 'signal_only'],
    ['No compensation information here.', 'unknown'],
    ['Reward USD 100, later changed to USD 200.', 'conflicting']
  ])('classifies %s conservatively', async (text, state) => {
    const { normalizeIssue } = await import('@/lib/server/github');
    const issue = normalizeIssue(
      { ...githubIssue, title: 'Synthetic parser', body: text, labels: [] },
      'synthetic-owner',
      'fixture'
    );
    const sources = issueSources(issue);
    const evidence = paymentEvidence(sources, 'issue_only');
    expect(evidence.state).toBe(state);
    for (const excerpt of evidence.excerpts)
      expect(
        sources
          .find((s) => s.id === excerpt.sourceId)
          ?.text.slice(excerpt.offset, excerpt.offset + excerpt.quote.length)
      ).toBe(excerpt.quote);
  });
  it('uses label-only points, word-boundary skill matches, timestamps and ineligible states', async () => {
    const { normalizeIssue } = await import('@/lib/server/github');
    const issue = normalizeIssue(
      {
        ...githubIssue,
        title: 'TypeScript algorithms',
        body: 'x'.repeat(220) + ' expected tests',
        labels: [{ name: 'bounty' }, { name: 'good first issue' }]
      },
      'synthetic-owner',
      'fixture'
    );
    const evidence = paymentEvidence(issueSources(issue), 'issue_only');
    expect(evidence.labelOnly).toBe(true);
    const score = rank(issue, evidence, ['typescript', 'go']);
    expect(score.parts).toEqual({
      evidence: 10,
      skills: 13,
      recency: 20,
      availability: 15,
      scope: 15
    });
    expect(rank({ ...issue, state: 'closed' }, evidence, []).total).toBe(0);
    expect(rank(issue, evidence, [], Date.now(), true).total).toBe(0);
    expect(rank({ ...issue, locked: null }, evidence, []).parts.availability).toBe(0);
    expect(rank({ ...issue, updatedAt: '2026-10-17T00:00:00Z' }, evidence, []).warnings).toContain(
      'Source update time is in the future; age clamped.'
    );
  });
});

it('propagates search cancellation to the bounded GitHub request', async () => {
  const controller = new AbortController();
  controller.abort();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (_url, init) => {
      expect(init.signal.aborted).toBe(true);
      throw init.signal.reason;
    })
  );
  const { searchOpportunities } = await import('@/lib/server/github');
  await expect(
    searchOpportunities({ keywords: 'unique-cancel-fixture' }, controller.signal)
  ).rejects.toMatchObject({ code: 'GITHUB_TIMEOUT' });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('keeps primary core quota exhaustion separate from search quota', async () => {
  const mock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response('{}', {
        status: 403,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
        }
      })
    )
    .mockResolvedValueOnce(response());
  vi.stubGlobal('fetch', mock);
  const { githubGet, searchOpportunities } = await import('@/lib/server/github');
  await expect(githubGet('/repos/synthetic-owner/fixture')).rejects.toMatchObject({
    code: 'GITHUB_RATE_LIMIT'
  });
  expect((await searchOpportunities({})).items).toHaveLength(1);
  await expect(githubGet('/repos/synthetic-owner/fixture')).rejects.toMatchObject({
    code: 'GITHUB_RATE_LIMIT'
  });
  expect(mock).toHaveBeenCalledTimes(2);
});
