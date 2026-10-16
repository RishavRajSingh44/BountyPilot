import 'server-only';
import type { Evidence, Issue, Score } from '@/lib/schemas';
export function rank(issue: Issue, evidence: Evidence, skills: string[], now = Date.now(), archived = false): Score {
  const text = `${issue.title}\n${issue.body}\n${issue.labels.join(' ')}`;
  const matches = skills.filter(skill => new RegExp(`(^|[^\\p{L}\\p{N}])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}\\p{N}])`, 'iu').test(text));
  const rawAge = (now - Date.parse(issue.updatedAt)) / 86400000; const age = Math.max(0, rawAge);
  const parts = {
    evidence: evidence.state === 'claim_found' ? 25 : evidence.state === 'signal_only' ? evidence.labelOnly ? 10 : 15 : 0,
    skills: skills.length ? Math.round(25 * matches.length / skills.length) : 0,
    recency: !Number.isFinite(age) ? 0 : age <= 7 ? 20 : age <= 30 ? 15 : age <= 90 ? 8 : 0,
    availability: issue.state === 'open' && issue.locked === false ? issue.assignees.length ? 5 : 15 : 0,
    scope: (issue.body.replace(/\s/g, '').length >= 200 ? 5 + (/\b(?:acceptance|test|tests|expected|reproduce)\b/i.test(issue.body) ? 5 : 0) : 0) + (issue.labels.some(l => /^(good[ -]first[ -]issue|help[ -]wanted)$/i.test(l)) ? 5 : 0),
  };
  return { total: issue.state === 'closed' || archived ? 0 : Object.values(parts).reduce((a, b) => a + b, 0), version: 'v1', parts, warnings: [...(!skills.length ? ['Skills not specified; no fit points.'] : []), ...(rawAge < 0 ? ['Source update time is in the future; age clamped.'] : [])] };
}
