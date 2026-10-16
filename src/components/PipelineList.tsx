'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Bookmark, GitFork } from 'lucide-react';
import { savedStatus, type SavedRecord, type SavedSummary } from '@/lib/schemas';
import { requestData } from '@/lib/client';
import { ConfirmRemove } from './ui/confirm-button';
import { EvidenceBadge } from './EvidenceBadge';
import { Button } from './ui/button';
export function PipelineList({ initial }: { initial: SavedSummary[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  async function change(id: string, status?: string) {
    setBusy(id);
    setError('');
    setMessage('');
    try {
      if (status) {
        const record = await requestData<SavedRecord>(`/api/saved/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        setItems((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status: record.status, updatedAt: record.updatedAt } : item
          )
        );
        setMessage(`Pipeline status updated to ${status}.`);
      } else {
        await requestData(`/api/saved/${id}`, { method: 'DELETE' });
        setItems((items) => items.filter((item) => item.id !== id));
        setMessage('Opportunity removed from your local pipeline.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pipeline update failed.');
    } finally {
      setBusy('');
    }
  }
  const visible = items.filter((item) => filter === 'all' || item.status === filter);
  return (
    <>
      <div className="result-toolbar">
        <p className="muted small">{items.length} saved locally · available without GitHub or AI</p>
        <label>
          Status filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {savedStatus.options.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div role="status" aria-live="polite">
        {error && (
          <p className="notice error">
            {error} Your previous saved data is preserved. Retry the action.
          </p>
        )}
        {message && <p className="toast">{message}</p>}
      </div>
      {!visible.length ? (
        <div className="empty-state">
          <Bookmark aria-hidden="true" />
          <h2>
            {items.length ? 'No opportunities in this status' : 'Build a pipeline worth pursuing'}
          </h2>
          <p>
            {items.length
              ? 'Choose another status to view your saved opportunities.'
              : 'Search GitHub, inspect the evidence and save the opportunities you want to evaluate.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/">Discover opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="opportunity-list">
          {visible.map((item) => (
            <article className="opportunity-row pipeline-row" key={item.id}>
              <div className="opportunity-main">
                <div className="repo-line">
                  <GitFork aria-hidden="true" />
                  <span className="mono">
                    {item.owner}/{item.repo}
                  </span>
                  #{item.number}
                  <span className="badge">{item.state}</span>
                </div>
                <h2>
                  <Link href={`/opportunities/${item.owner}/${item.repo}/${item.number}`}>
                    {item.title}
                  </Link>
                </h2>
                <EvidenceBadge state={item.paidState} />
                <p className="result-meta">
                  Source {new Date(item.fetchedAt).toLocaleString()} ·{' '}
                  {item.analysisAt
                    ? `Analyzed ${new Date(item.analysisAt).toLocaleString()}`
                    : 'Not analyzed yet'}
                </p>
              </div>
              <div className="pipeline-actions">
                <label>
                  Status for #{item.number}
                  <select
                    aria-label={`Status for ${item.title}`}
                    disabled={Boolean(busy)}
                    value={item.status}
                    onChange={(e) => void change(item.id, e.target.value)}
                  >
                    {savedStatus.options.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <ConfirmRemove
                  disabled={Boolean(busy)}
                  title={item.title}
                  onConfirm={() => void change(item.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
