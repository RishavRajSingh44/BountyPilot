import 'server-only';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { analysisPromptVersion, identitySchema, type OpportunityDetail, type Snapshot, type Source } from '@/lib/schemas';
import { githubGet, normalizeIssue } from './github';
import { issueSources, paymentEvidence } from './evidence';
import { getSaved, getSnapshot, storeSnapshot, getAnalysis } from './db';
import { rank } from './ranking';
import { AppError } from './errors';

export function detail(snapshot: Snapshot, skills: string[] = []): OpportunityDetail {
  const analysis=getAnalysis(snapshot.issue.id);
  return { ...snapshot.issue, repository: snapshot.repository, sources: snapshot.sources, coverage: snapshot.coverage, paidEvidence: snapshot.evidence, snapshotHash: snapshot.hash, fetchedAt: snapshot.fetchedAt, score: rank(snapshot.issue,snapshot.evidence,skills,Date.now(),snapshot.repository.archived), saved: getSaved(snapshot.issue.id), analysis, analysisStale:Boolean(analysis && (analysis.snapshotHash!==snapshot.hash || analysis.promptVersion!==analysisPromptVersion)) };
}
export function storedDetail(id: string): OpportunityDetail {
  const snapshot = getSnapshot(id); if (!snapshot) throw new AppError('NOT_FOUND','This issue has not been retrieved.',404); return detail(snapshot);
}
const commentSchema = z.array(z.object({ id: z.number().int().positive().refine(Number.isSafeInteger), body: z.string().nullable(), created_at:z.iso.datetime().nullable().optional(), updated_at: z.iso.datetime(), user: z.object({login:z.string().max(100)}).nullable(), author_association: z.string().max(100).default('UNKNOWN') })).max(100);
export async function refreshOpportunity(raw: unknown, signal?: AbortSignal): Promise<OpportunityDetail> {
  const identity = identitySchema.parse(raw); const path = `/repos/${identity.owner}/${identity.repo}`;
  const context = { signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(25000)]) : AbortSignal.timeout(25000), retries: 1 };
  const repoRaw = (await githubGet(path,context)).value;
  let repository;
  try { repository = z.object({ private: z.boolean(), archived: z.boolean(), language: z.string().nullable() }).parse(repoRaw); }
  catch { throw new AppError('GITHUB_INVALID_RESPONSE','Repository metadata is incomplete. Prior data is preserved.',502); }
  if (repository.private) throw new AppError('PRIVATE_REPOSITORY','Only public repositories are supported.',422);
  const issueRaw = (await githubGet(`${path}/issues/${identity.number}`,context)).value;
  if (typeof issueRaw === 'object' && issueRaw && Object.hasOwn(issueRaw,'pull_request')) throw new AppError('PULL_REQUEST','Select an issue, not a pull request.',422);
  let issue;
  try { issue = normalizeIssue(issueRaw,identity.owner,identity.repo); }
  catch { throw new AppError('GITHUB_INVALID_RESPONSE','Issue metadata is incomplete. Prior data is preserved.',502); }
  if (issue.number !== identity.number) throw new AppError('SOURCE_CHANGED','GitHub returned a different issue identity. Prior data is preserved.',502);
  const sources = issueSources(issue); const reported = issue.commentsReported; const page = Math.ceil(reported/100);
  const warnings: string[] = []; let comments: z.infer<typeof commentSchema> = [];
  try {
    if (page) {
      comments = commentSchema.parse((await githubGet(`${path}/issues/${identity.number}/comments?per_page=100&page=${page}`,context)).value);
      if (comments.length !== ((reported-1)%100)+1) warnings.push('Discussion changed during retrieval; coverage may be incomplete.');
      if (page > 1 && comments.length < 100) comments = [...commentSchema.parse((await githubGet(`${path}/issues/${identity.number}/comments?per_page=100&page=${page-1}`,context)).value),...comments];
      comments = [...new Map(comments.map(c=>[c.id,c])).values()].slice(-100);
    }
  } catch (error) { if (error instanceof AppError) throw error; throw new AppError('GITHUB_INVALID_RESPONSE','Discussion retrieval failed. Prior data is preserved.',502,true); }
  for (const comment of comments) {
    const text = comment.body || '';
    sources.push({ id:`comment:${comment.id}`, kind:'comment', url:`${issue.url}#issuecomment-${comment.id}`, text:text.slice(0,2000), truncated:text.length>2000, author:comment.user?.login || 'deleted', association:comment.author_association, createdAt:comment.created_at||null, updatedAt:comment.updated_at });
  }
  if (reported > 100) warnings.push('Only the latest 100 comments are fetched; earlier or newly edited statements may be missing.');
  const coverage = { commentsReported:reported, commentsFetched:comments.length, commentsComplete:reported===comments.length && !warnings.length, sourceTruncated:sources.some(s=>s.truncated), fetchWarnings:warnings };
  const content = { issue,repository:{ ...repository,private:false as const },sources,coverage };
  while (Buffer.byteLength(JSON.stringify(content),'utf8') > 500*1024) {
    const oldest = sources.find((s:Source)=>s.kind==='comment' && s.text.length);
    if (!oldest) throw new AppError('SOURCE_TOO_LARGE','Source metadata exceeds the bounded storage size. Prior data is preserved.',502);
    oldest.text='';oldest.truncated=true;coverage.sourceTruncated=true;
    if (!warnings.includes('Some source text omitted to meet the storage limit.')) warnings.push('Some source text omitted to meet the storage limit.');
  }
  const snapshot: Snapshot = { ...content, evidence:paymentEvidence(sources,'retrieved_sources'), hash:createHash('sha256').update(JSON.stringify(content)).digest('hex'), fetchedAt:new Date().toISOString() };
  if (Buffer.byteLength(JSON.stringify(snapshot),'utf8') > 512*1024) throw new AppError('SOURCE_TOO_LARGE','Source exceeds the storage budget. Prior data is preserved.',502);
  storeSnapshot(snapshot); return detail(snapshot);
}
