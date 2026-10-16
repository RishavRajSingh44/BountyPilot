import Link from 'next/link';
import type { OpportunitySummary, Score } from '@/lib/schemas';
export function ScoreDetails({ score }: { score: Score }) {
  return <details><summary>Score {score.total}/100 · page-local heuristic</summary><ul>{Object.entries(score.parts).map(([name, points]) => <li key={name}>{name}: {points}</li>)}</ul>{score.warnings.map(w => <p key={w}>{w}</p>)}</details>;
}
export function OpportunityCard({ item }: { item: OpportunitySummary }) {
  return <article><p className="muted">{item.owner}/{item.repo} #{item.number}{item.saved ? ' · Saved' : ''}</p><h2><Link href={`/opportunities/${item.owner}/${item.repo}/${item.number}`}>{item.title}</Link></h2><p>Payment evidence: <strong>{item.paidEvidence.state.replaceAll('_', ' ')}</strong> · Unverified</p><p>Updated {new Date(item.updatedAt).toLocaleString()} · {item.assignees.length ? 'Assigned' : 'No assignee listed'}</p><p className="muted">Labels: {item.labels.join(', ') || 'None'}</p><ScoreDetails score={item.score}/><p><a href={item.url} target="_blank" rel="noreferrer">Open source issue on GitHub</a></p></article>;
}
