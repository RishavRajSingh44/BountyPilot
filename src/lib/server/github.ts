import 'server-only';
import { z } from 'zod';
import { ownerSchema, repoSchema, searchSchema, type Issue, type SearchInput, type SearchResult } from '@/lib/schemas';
import { boundedJson } from './http';
import { AppError } from './errors';
import { issueSources, paymentEvidence } from './evidence';
import { rank } from './ranking';
import { database } from './db';

const id = z.number().int().positive().refine(Number.isSafeInteger);
const user = z.object({ login: z.string() });
const issueSchema = z.object({
  id, number: id, title: z.string(), body: z.string().nullable(), state: z.enum(['open', 'closed']), locked: z.boolean().nullable().default(null),
  labels: z.array(z.union([z.string(), z.object({ name: z.string() })])).max(500), assignees: z.array(user),
  updated_at: z.iso.datetime(), user: user.nullable(), author_association: z.string().default('UNKNOWN'), comments: z.number().int().nonnegative(),
});
export function normalizeIssue(raw: unknown, owner: string, repo: string): Issue {
  const data = issueSchema.parse(raw); const body = data.body || '';
  return { id: String(data.id), owner: ownerSchema.parse(owner), repo: repoSchema.parse(repo), number: data.number, url: `https://github.com/${owner}/${repo}/issues/${data.number}`, title: data.title.slice(0, 512), body: body.slice(0, 16000), bodyTruncated: body.length > 16000, state: data.state, locked: data.locked, labels: data.labels.map(l => typeof l === 'string' ? l : l.name).slice(0, 100), assignees: data.assignees.map(u => u.login), updatedAt: data.updated_at, author: data.user?.login || 'deleted', association: data.author_association, commentsReported: data.comments };
}
export function compileQuery(input: SearchInput) {
  return [input.preset, input.keywords, 'is:issue is:open is:public', input.repo ? `repo:${input.repo}` : '', input.language ? `language:"${input.language}"` : ''].filter(Boolean).join(' ');
}
type Context = { signal: AbortSignal; retries: number };
let cooldown = 0;
export async function githubGet(path: string, context: Context = { signal: AbortSignal.timeout(25000), retries: 1 }): Promise<{ value: unknown; remaining: number | null; resetAt: string | null }> {
  if (!path.startsWith('/') || path.startsWith('//')) throw new AppError('INVALID_PATH', 'Invalid provider path.', 400);
  if (cooldown > Date.now()) throw new AppError('GITHUB_RATE_LIMIT', 'GitHub quota is exhausted. Retry at the indicated time.', 429, true, new Date(cooldown).toISOString());
  while (true) {
    try {
      const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10', 'User-Agent': 'BountyPilot/0.1', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }, signal: AbortSignal.any([context.signal, AbortSignal.timeout(10000)]), redirect: 'manual', cache: 'no-store' });
      if (response.status >= 300 && response.status < 400) throw new AppError('GITHUB_MOVED', 'GitHub redirected this source. Open GitHub to find its current location.', 502);
      if (response.status === 401) throw new AppError('GITHUB_AUTH', 'GitHub rejected the server token. Check its configuration.', 502);
      if ([403, 429].includes(response.status)) {
        const body = await boundedJson(response, 16384).catch(() => null) as { message?: string } | null;
        if (response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after') || /rate limit|secondary/i.test(body?.message || '')) {
          const retry = response.headers.get('retry-after'); const until = retry ? /^\d+$/.test(retry) ? Date.now() + Number(retry) * 1000 : Date.parse(retry) : Number(response.headers.get('x-ratelimit-reset')) * 1000;
          cooldown = Number.isFinite(until) && until > Date.now() ? until : Date.now() + 60000;
          throw new AppError('GITHUB_RATE_LIMIT', 'GitHub quota is exhausted. Retry at the indicated time.', 429, true, new Date(cooldown).toISOString());
        }
        throw new AppError('GITHUB_FORBIDDEN', 'GitHub denied access. Use public repositories and check token permissions.', 502);
      }
      if ([404, 410].includes(response.status)) throw new AppError('SOURCE_UNAVAILABLE', 'This source is unavailable or no longer public. Stored data is preserved.', response.status);
      if (response.status === 422) throw new AppError('GITHUB_QUERY', 'GitHub rejected these search filters. Narrow or simplify them.', 422);
      if (response.status >= 500 && context.retries > 0 && !context.signal.aborted) { context.retries--; await response.body?.cancel(); continue; }
      if (!response.ok) throw new AppError('GITHUB_ERROR', 'GitHub could not complete this request.', 502, true);
      const value = await boundedJson(response, 4 * 1024 * 1024);
      const remaining = response.headers.get('x-ratelimit-remaining'); const reset = response.headers.get('x-ratelimit-reset');
      return { value, remaining: remaining && /^\d+$/.test(remaining) ? Number(remaining) : null, resetAt: reset && /^\d+$/.test(reset) ? new Date(Number(reset) * 1000).toISOString() : null };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (context.retries > 0 && !context.signal.aborted) { context.retries--; continue; }
      const timeout = context.signal.aborted || (error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name));
      throw new AppError(timeout ? 'GITHUB_TIMEOUT' : 'GITHUB_UNREACHABLE', 'GitHub is unavailable or timed out. Saved data remains local.', timeout ? 504 : 502, true);
    }
  }
}

type CachedSearch = { issues: Issue[]; total: number; incomplete: boolean; observedAt: string; remaining: number | null; resetAt: string | null; expires: number };
const cache = new Map<string, CachedSearch>();
export async function searchOpportunities(raw: unknown): Promise<SearchResult> {
  const input = searchSchema.parse(raw); const query = compileQuery(input); const key = `${query}:${input.page}`;
  const existing = cache.get(key); let data = existing && existing.expires > Date.now() ? existing : undefined;
  const hit = Boolean(data);
  if (!data) {
    const params = new URLSearchParams({ q: query, per_page: '25', page: String(input.page), sort: 'updated', order: 'desc' });
    const response = await githubGet(`/search/issues?${params}`);
    try {
      const parsed = z.object({ total_count: z.number().int().nonnegative(), incomplete_results: z.boolean(), items: z.array(z.object({ repository_url: z.string(), pull_request: z.unknown().optional(), repository: z.object({ private: z.boolean() }).optional() }).passthrough()).max(25) }).parse(response.value);
      const issues = parsed.items.filter(i => !Object.hasOwn(i, 'pull_request')).map(i => {
        if (i.repository?.private) throw new Error('Private repository rejected');
        const url = new URL(i.repository_url); const segments = url.pathname.split('/');
        if (url.origin !== 'https://api.github.com' || segments.length !== 4 || segments[1] !== 'repos') throw new Error('Invalid repository identity');
        return normalizeIssue(i, segments[2], segments[3]);
      }).filter(i => i.state === 'open');
      data = { issues, total: parsed.total_count, incomplete: parsed.incomplete_results, observedAt: new Date().toISOString(), remaining: response.remaining, resetAt: response.resetAt, expires: Date.now() + 60000 };
      if (cache.size >= 50) cache.delete(cache.keys().next().value!); cache.set(key, data);
    } catch { throw new AppError('GITHUB_INVALID_RESPONSE', 'GitHub returned an unsupported response. Try again later.', 502, true); }
  }
  const saved = new Set(database().prepare('SELECT opportunity_id FROM saved_opportunities').all().map(r => String(r.opportunity_id)));
  const items = data.issues.map(issue => {
    const paidEvidence = paymentEvidence(issueSources(issue), 'issue_only');
    const { body: _body, ...summary } = issue; void _body;
    return { ...summary, paidEvidence, score: rank(issue, paidEvidence, input.skills), saved: saved.has(issue.id) };
  }).sort((a,b) => b.score.total - a.score.total || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
  return { items, page: input.page, hasNext: input.page < 40 && input.page * 25 < Math.min(data.total, 1000), totalCount: data.total, incompleteResults: data.incomplete, query, observedAt: data.observedAt, cache: hit ? 'hit' : 'miss', warnings: ['Ranking applies to this page, not every GitHub match.', 'Issue-only payment signals do not confirm funding.', ...(data.incomplete ? ['GitHub reports incomplete search results. Narrow your filters.'] : []), ...(data.total > 1000 ? ['Only the first 1,000 provider matches are accessible.'] : [])], rateLimit: { remaining: data.remaining, resetAt: data.resetAt } };
}
