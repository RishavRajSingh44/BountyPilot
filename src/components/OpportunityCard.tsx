'use client';
import Link from 'next/link';
import { Bookmark, Check, GitFork, LoaderCircle, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { OpportunitySummary, Score, OpportunityDetail } from '@/lib/schemas';
import { requestData } from '@/lib/client';
import { Button } from './ui/button';
import { EvidenceBadge } from './EvidenceBadge';
export function ScoreDetails({ score }: { score: Score }) {
  return (
    <details className="score-details">
      <summary>Score {score.total}/100 · page-local heuristic</summary>
      <div className="score-parts">
        {Object.entries(score.parts).map(([name, points]) => (
          <span key={name}>
            {name}: {points}
          </span>
        ))}
      </div>
      {score.warnings.map((w) => (
        <p className="muted small" key={w}>
          {w}
        </p>
      ))}
    </details>
  );
}
export function OpportunityCard({ item }: { item: OpportunitySummary }) {
  const [saved, setSaved] = useState(item.saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const detail = await requestData<OpportunityDetail>('/api/opportunities/refresh', {
        method: 'POST',
        body: JSON.stringify({ owner: item.owner, repo: item.repo, number: item.number })
      });
      await requestData(`/api/saved/${detail.id}`, { method: 'PUT', body: '{}' });
      setSaved(true);
      setMessage('Saved to your local pipeline.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed. Try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="opportunity-row">
      <div className="opportunity-main">
        <div className="repo-line">
          <GitFork aria-hidden="true" />
          <span className="mono">
            {item.owner}/{item.repo}
          </span>
          <span>#{item.number}</span>
          <span>·</span>
          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
          {item.assignees.length > 0 && <span>· Assigned</span>}
        </div>
        <h2>
          <Link href={`/opportunities/${item.owner}/${item.repo}/${item.number}`}>
            {item.title}
          </Link>
        </h2>
        <EvidenceBadge state={item.paidEvidence.state} />
        <div className="tags">
          {item.labels.slice(0, 5).map((label) => (
            <span className="tag" key={label}>
              {label}
            </span>
          ))}
          {item.labels.length > 5 && <span className="tag">+{item.labels.length - 5}</span>}
        </div>
        <ScoreDetails score={item.score} />
        <p role="status" className="small feedback">
          {message}
        </p>
      </div>
      <div className="stack" style={{ gap: 12, alignItems: 'flex-end' }}>
        <span className="score">
          {item.score.total}
          <small>/100 fit</small>
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || saved}
          onClick={() => void save()}
          aria-label={saved ? `Saved ${item.title}` : `Save ${item.title}`}
        >
          {busy ? (
            <LoaderCircle className="spinner" aria-hidden="true" />
          ) : saved ? (
            <Check aria-hidden="true" />
          ) : (
            <Bookmark aria-hidden="true" />
          )}
          {busy ? 'Saving…' : saved ? 'Saved' : 'Save'}
        </Button>
        <a href={item.url} target="_blank" rel="noreferrer" className="subtle-link">
          GitHub
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
