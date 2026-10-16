'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  GitFork,
  LoaderCircle,
  RefreshCw
} from 'lucide-react';
import type { OpportunityDetail as Detail, SavedRecord, Health } from '@/lib/schemas';
import { requestData } from '@/lib/client';
import { EvidencePanel } from './EvidencePanel';
import { ScoreDetails } from './OpportunityCard';
import { AnalysisPanel } from './AnalysisPanel';
import { Button } from './ui/button';
import { ConfirmRemove } from './ui/confirm-button';
export function OpportunityDetail({
  identity,
  initial,
  state
}: {
  identity: { owner: string; repo: string; number: number };
  initial: Detail | null;
  state: Health;
}) {
  const [detail, setDetail] = useState(initial);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function refresh() {
    setBusy('refresh');
    setError('');
    setMessage('');
    try {
      setDetail(
        await requestData<Detail>('/api/opportunities/refresh', {
          method: 'POST',
          body: JSON.stringify(identity)
        })
      );
      setMessage('Current GitHub snapshot retrieved and saved locally.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed; prior data is preserved.');
    } finally {
      setBusy('');
    }
  }
  async function save() {
    if (!detail) return;
    setBusy('save');
    setError('');
    setMessage('');
    try {
      if (detail.saved) {
        await requestData(`/api/saved/${detail.id}`, { method: 'DELETE' });
        setDetail({ ...detail, saved: null });
        setMessage('Removed from your local pipeline.');
      } else {
        const saved = await requestData<SavedRecord>(`/api/saved/${detail.id}`, {
          method: 'PUT',
          body: '{}'
        });
        setDetail({ ...detail, saved });
        setMessage('Saved to your local pipeline.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <Link className="subtle-link" href="/">
        <ArrowLeft aria-hidden="true" />
        Back to Discover
      </Link>
      <div className="repo-line mt-6">
        <GitFork aria-hidden="true" />
        <span className="mono">
          {identity.owner}/{identity.repo}
        </span>
        <span>#{identity.number}</span>
      </div>
      <h1 className="detail-title">{detail?.title || 'Inspect this opportunity'}</h1>
      <p className="page-description">
        Review the original source, reward evidence and unknowns before committing your time.
      </p>
      <div className="row detail-actions">
        <Button variant="outline" disabled={Boolean(busy)} onClick={() => void refresh()}>
          {busy === 'refresh' ? (
            <LoaderCircle className="spinner" aria-hidden="true" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          {busy === 'refresh'
            ? 'Retrieving…'
            : detail
              ? 'Refresh from GitHub'
              : 'Load issue from GitHub'}
        </Button>
        {detail && (
          <>
            {detail.saved ? (
              <>
                <span className="badge">
                  <Check aria-hidden="true" />
                  Saved · {detail.saved.status}
                </span>
                <ConfirmRemove
                  disabled={Boolean(busy)}
                  title={detail.title}
                  onConfirm={() => void save()}
                />
              </>
            ) : (
              <Button disabled={Boolean(busy)} onClick={() => void save()}>
                <Bookmark aria-hidden="true" />
                {busy === 'save' ? 'Saving…' : 'Save opportunity'}
              </Button>
            )}
            <a className="subtle-link" href={detail.url} target="_blank" rel="noreferrer">
              Original GitHub issue
              <ArrowUpRight aria-hidden="true" />
            </a>
          </>
        )}
      </div>
      <div role="status" aria-live="polite">
        {error && <p className="notice error">{error} Previous stored data is preserved.</p>}
        {message && <p className="toast">{message}</p>}
      </div>
      {detail ? (
        <>
          <div className="detail-meta">
            <span className="badge">{detail.state}</span>
            <span>{detail.repository.language || 'Language unknown'}</span>
            <span>
              {detail.assignees.length
                ? `Assigned: ${detail.assignees.join(', ')}`
                : 'No assignees listed'}
            </span>
            <span>Snapshot {new Date(detail.fetchedAt).toLocaleString()}</span>
          </div>
          {(detail.state === 'closed' || detail.repository.archived) && (
            <p className="notice">
              This issue is closed or its repository is archived. It is not ranked as available
              work.
            </p>
          )}
          <div className="tags">
            {detail.labels.map((label) => (
              <span className="tag" key={label}>
                {label}
              </span>
            ))}
          </div>
          <ScoreDetails score={detail.score} />
          <div className="detail-layout mt-6">
            <EvidencePanel detail={detail} />
            <AnalysisPanel
              id={detail.id}
              snapshotHash={detail.snapshotHash}
              initial={detail.analysis}
              state={state}
            />
          </div>
        </>
      ) : (
        <div className="empty-state">
          <GitFork aria-hidden="true" />
          <h2>Retrieve the original issue</h2>
          <p>
            Load its current public source and recent discussion. After retrieval, you can review
            evidence, analyze it or save it for offline access.
          </p>
        </div>
      )}
    </>
  );
}
