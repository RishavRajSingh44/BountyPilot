'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, LoaderCircle, Search } from 'lucide-react';
import type { SearchResult } from '@/lib/schemas';
import { OpportunityCard } from './OpportunityCard';
import { Button } from './ui/button';
export function SearchForm() {
  const [result, setResult] = useState<SearchResult>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [evidence, setEvidence] = useState('all');
  const [sort, setSort] = useState('relevance');
  const controller = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search(page: number) {
    if (!form.current) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError('');
    setResult(undefined);
    const values = new FormData(form.current);
    const params = new URLSearchParams();
    for (const key of ['preset', 'keywords', 'repo', 'language'])
      params.set(key, String(values.get(key) || '').trim());
    for (const skill of String(values.get('skills') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean))
      params.append('skill', skill);
    params.set('page', String(page));
    try {
      const response = await fetch(`/api/opportunities?${params}`, { signal: current.signal });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          `${body.error.message}${body.error.retryAt ? ` Retry after ${new Date(body.error.retryAt).toLocaleString()}.` : ''}`
        );
      if (!current.signal.aborted && controller.current === current) setResult(body.data);
    } catch (e) {
      if (!current.signal.aborted)
        setError(e instanceof Error ? e.message : 'Search failed. Try again.');
    } finally {
      if (controller.current === current) setBusy(false);
    }
  }
  const visible =
    result?.items
      .filter((item) => evidence === 'all' || item.paidEvidence.state === evidence)
      .sort((a, b) =>
        sort === 'recent' ? b.updatedAt.localeCompare(a.updatedAt) : b.score.total - a.score.total
      ) || [];
  return (
    <>
      <form
        ref={form}
        className="panel search-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void search(1);
        }}
        aria-label="Search opportunities"
      >
        <div className="search-bar">
          <label>
            Keywords
            <Search className="search-icon" aria-hidden="true" />
            <input
              name="keywords"
              maxLength={80}
              placeholder="Search issues, technologies, or a problem to solve…"
            />
          </label>
          <Button disabled={busy} type="submit">
            {busy ? (
              <LoaderCircle className="spinner" aria-hidden="true" />
            ) : (
              <Search aria-hidden="true" />
            )}
            {busy ? 'Searching…' : 'Search GitHub'}
          </Button>
        </div>
        <div className="search-filters">
          <label>
            Opportunity term
            <select name="preset">
              <option value="bounty">Bounty</option>
              <option value="paid">Paid</option>
              <option value="reward">Reward</option>
            </select>
          </label>
          <label>
            Repository (optional)
            <input name="repo" maxLength={140} placeholder="owner/repository" />
          </label>
          <label>
            Language (optional)
            <input name="language" maxLength={30} placeholder="TypeScript" />
          </label>
          <label>
            Skills for local scoring
            <input
              name="skills"
              maxLength={309}
              placeholder="typescript, testing"
              aria-describedby="skill-help"
            />
          </label>
        </div>
        <p id="skill-help" className="form-help">
          Up to 10 comma-separated skills. Skills stay out of the GitHub query. Search uses public,
          open issues only.
        </p>
        {busy && (
          <Button
            className="mt-3"
            variant="ghost"
            type="button"
            onClick={() => {
              controller.current?.abort();
              setBusy(false);
              setError('Search cancelled.');
            }}
          >
            Cancel search
          </Button>
        )}
      </form>
      <div role="status" aria-live="polite" className="feedback">
        {error && (
          <div className="notice error">
            {error}
            <Button variant="ghost" onClick={() => void search(1)} disabled={busy}>
              Retry search
            </Button>
          </div>
        )}
        {busy && (
          <p className="row muted">
            <LoaderCircle className="spinner" aria-hidden="true" />
            Fetching public GitHub issues…
          </p>
        )}
      </div>
      {result ? (
        <section aria-label="Search results" aria-busy={busy}>
          <div className="result-toolbar">
            <div>
              <h2 className="result-heading">
                {result.totalCount.toLocaleString()} provider matches
              </h2>
              <p className="result-meta">
                Page {result.page} · {visible.length} shown · observed{' '}
                {new Date(result.observedAt).toLocaleString()} ·{' '}
                {result.cache === 'hit' ? '60-second cache' : 'Fetched from GitHub'}
              </p>
            </div>
            <div className="row">
              <label>
                Evidence
                <select value={evidence} onChange={(e) => setEvidence(e.target.value)}>
                  <option value="all">All evidence</option>
                  <option value="claim_found">Claim found</option>
                  <option value="signal_only">Signal only</option>
                  <option value="conflicting">Conflicting</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>
              <label>
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="recent">Recently updated</option>
                </select>
              </label>
            </div>
          </div>
          <p className="small muted">
            Filtering and ranking apply to this fetched page only. Fit includes skills, evidence,
            recency, availability and scope.
          </p>
          {result.warnings.map((w) => (
            <p className="notice" key={w}>
              {w}
            </p>
          ))}
          {visible.length ? (
            <div className="opportunity-list">
              {visible.map((item) => (
                <OpportunityCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Compass aria-hidden="true" />
              <h2>
                {result.items.length
                  ? 'No results with this evidence filter'
                  : 'No matching open issues'}
              </h2>
              <p>
                {result.items.length
                  ? 'Choose another evidence filter to see this page’s results.'
                  : 'Try a broader keyword, another opportunity term, or remove the repository filter.'}
              </p>
            </div>
          )}
          <div className="result-toolbar">
            <p className="result-meta">
              {result.rateLimit.remaining !== null
                ? `${result.rateLimit.remaining} search requests remaining at fetch`
                : 'GitHub quota unavailable'}
            </p>
            <div className="row">
              <Button
                variant="outline"
                disabled={busy || result.page <= 1}
                onClick={() => void search(result.page - 1)}
              >
                <ArrowLeft aria-hidden="true" />
                Previous page
              </Button>
              <Button
                variant="outline"
                disabled={busy || !result.hasNext}
                onClick={() => void search(result.page + 1)}
              >
                Next page
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        !busy &&
        !error && (
          <div className="empty-state">
            <Compass aria-hidden="true" />
            <h2>Your next opportunity starts with a search</h2>
            <p>
              Find real GitHub issues, inspect reward claims, then use local AI to decide what
              deserves a closer look.
            </p>
            <span className="small mono">GITHUB SOURCES · LOCAL TRIAGE · VISIBLE EVIDENCE</span>
          </div>
        )
      )}
    </>
  );
}
