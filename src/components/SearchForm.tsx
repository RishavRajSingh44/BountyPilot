'use client';
import { useRef, useState } from 'react';
import type { SearchResult } from '@/lib/schemas';
import { OpportunityCard } from './OpportunityCard';
export function SearchForm() {
  const [result, setResult] = useState<SearchResult>();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  async function search(page: number) {
    if (!form.current) return;
    controller.current?.abort(); const current = new AbortController(); controller.current = current;
    setBusy(true); setError(''); setResult(undefined);
    const values = new FormData(form.current); const params = new URLSearchParams();
    for (const key of ['preset', 'keywords', 'repo', 'language']) params.set(key, String(values.get(key) || '').trim());
    for (const skill of String(values.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean)) params.append('skill', skill);
    params.set('page', String(page));
    try {
      const response = await fetch(`/api/opportunities?${params}`, { signal: current.signal }); const body = await response.json();
      if (!response.ok) throw new Error(`${body.error.message}${body.error.retryAt ? ` Retry after ${new Date(body.error.retryAt).toLocaleString()}.` : ''}`);
      if (!current.signal.aborted && controller.current === current) setResult(body.data);
    } catch (e) { if (!current.signal.aborted) setError(e instanceof Error ? e.message : 'Search failed. Try again.'); }
    finally { if (controller.current === current) setBusy(false); }
  }
  return <><form ref={form} onSubmit={event => { event.preventDefault(); void search(1); }} aria-label="Search opportunities"><div className="grid">
    <label>Opportunity term<select name="preset"><option value="bounty">Bounty</option><option value="paid">Paid</option><option value="reward">Reward</option></select></label>
    <label>Keywords<input name="keywords" maxLength={80} placeholder="e.g. parser"/></label>
    <label>Repository (optional)<input name="repo" maxLength={140} placeholder="owner/repository"/></label>
    <label>Language (optional)<input name="language" maxLength={30} placeholder="TypeScript"/></label>
    <label>Skills for local scoring<input name="skills" maxLength={309} placeholder="typescript, testing" aria-describedby="skill-help"/></label>
  </div><p id="skill-help" className="muted">Up to 10 comma-separated skills. Skills stay out of the GitHub search query.</p><div className="row"><button disabled={busy} type="submit">{busy ? 'Searching…' : 'Search GitHub'}</button>{busy && <button type="button" onClick={() => { controller.current?.abort(); setBusy(false); setError('Search cancelled.'); }}>Cancel search</button>}</div></form>
  <div role="status" aria-live="polite">{error && <p className="error">{error}</p>}{busy && <p>Fetching public GitHub issues…</p>}</div>
  {result && <section aria-label="Search results"><h2>{result.totalCount} provider matches</h2><p>Page {result.page} · observed {new Date(result.observedAt).toLocaleString()} · {result.cache === 'hit' ? '60-second cache' : 'Fetched from GitHub'}</p>{result.warnings.map(w => <p className="notice" key={w}>{w}</p>)}{result.rateLimit.remaining !== null && <p>Provider search requests remaining at fetch: {result.rateLimit.remaining}</p>}{!result.items.length && <p>No matching open public issues on this page. Try another term or broader filters; payment availability is never guaranteed.</p>}{result.items.map(item => <OpportunityCard key={item.id} item={item}/>)}<div className="row"><button type="button" disabled={busy || result.page <= 1} onClick={() => void search(result.page - 1)}>Previous page</button><button type="button" disabled={busy || !result.hasNext} onClick={() => void search(result.page + 1)}>Next page</button></div></section>}</>;
}
