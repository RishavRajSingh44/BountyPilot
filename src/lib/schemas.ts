import { z } from 'zod';
export const modelTag = z.enum(['gemma3:4b', 'gemma3:1b']);
export const healthSchema = z.object({
  app: z.literal('ready'), storage: z.enum(['ready', 'error']),
  github: z.enum(['configured', 'anonymous']),
  ollama: z.enum(['ready', 'unreachable', 'model_missing', 'configuration_error', 'unauthorized']), modelTag,
  models: z.array(z.object({ name: modelTag, digest: z.string(), size: z.number() })),
  inferenceMode: z.enum(['local', 'remote', 'unconfigured']),
});
export type Health = z.infer<typeof healthSchema>;

export const ownerSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/);
export const repoSchema = z.string().regex(/^[A-Za-z0-9_.-]{1,100}$/).refine(s => s !== '.' && s !== '..');
export const issueId = z.string().regex(/^\d{1,20}$/);
export const skillsSchema = z.array(z.string().trim().min(1).max(30)).max(10).transform(s => [...new Set(s.map(v => v.toLowerCase()))]);
export const searchSchema = z.object({
  preset: z.enum(['bounty', 'paid', 'reward']).default('bounty'),
  keywords: z.string().trim().max(80).regex(/^[\p{L}\p{N} "'_.-]*$/u).refine(s => !/\b(AND|OR|NOT)\b/i.test(s) && (s.match(/"/g)?.length || 0) % 2 === 0, 'Use words or balanced quoted phrases, without query operators').default(''),
  repo: z.string().default('').refine(s => !s || (s.split('/').length === 2 && ownerSchema.safeParse(s.split('/')[0]).success && repoSchema.safeParse(s.split('/')[1]).success), 'Use owner/repository'),
  language: z.string().trim().max(30).regex(/^[A-Za-z0-9#+. -]*$/).default(''),
  skills: skillsSchema.default([]), page: z.coerce.number().int().min(1).max(40).default(1),
});
export type SearchInput = z.infer<typeof searchSchema>;
export type Source = { id: string; url: string; kind: 'title' | 'body' | 'labels' | 'comment'; author: string; association: string; updatedAt: string; text: string; truncated: boolean };
export type Issue = { id: string; owner: string; repo: string; number: number; url: string; title: string; body: string; state: 'open' | 'closed'; locked: boolean | null; labels: string[]; assignees: string[]; updatedAt: string; author: string; association: string; commentsReported: number; bodyTruncated: boolean };
export type Evidence = { state: 'unknown' | 'signal_only' | 'claim_found' | 'conflicting'; excerpts: { sourceId: string; quote: string; offset: number; url: string; author: string; association: string; updatedAt: string }[]; coverage: 'issue_only' | 'retrieved_sources'; labelOnly: boolean };
export type Score = { total: number; version: 'v1'; parts: { evidence: number; skills: number; recency: number; availability: number; scope: number }; warnings: string[] };
export type OpportunitySummary = Omit<Issue, 'body'> & { paidEvidence: Evidence; score: Score; saved: boolean };
export type SearchResult = { items: OpportunitySummary[]; page: number; hasNext: boolean; totalCount: number; incompleteResults: boolean; query: string; observedAt: string; cache: 'hit' | 'miss'; warnings: string[]; rateLimit: { remaining: number | null; resetAt: string | null } };
