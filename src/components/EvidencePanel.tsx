import { FileText, ShieldQuestion } from 'lucide-react';
import type { OpportunityDetail } from '@/lib/schemas';
import { EvidenceBadge } from './EvidenceBadge';
export function EvidencePanel({ detail }: { detail: OpportunityDetail }) {
  return (
    <section className="panel">
      <h2 className="panel-title">
        <ShieldQuestion aria-hidden="true" />
        Evidence and uncertainty
      </h2>
      <EvidenceBadge state={detail.paidEvidence.state} />
      <p className="muted small mt-3">
        A source quote or maintainer association does not establish funding, payer authority or
        settlement.
      </p>
      <p className="small muted mt-3">
        Retrieved {new Date(detail.fetchedAt).toLocaleString()} · comments{' '}
        {detail.coverage.commentsFetched}/{detail.coverage.commentsReported} ·{' '}
        {detail.coverage.commentsComplete ? 'reported count covered' : 'partial discussion'}.{' '}
        {detail.coverage.sourceTruncated ? 'Some source text is truncated.' : ''}
      </p>
      {detail.coverage.fetchWarnings.map((w) => (
        <p className="notice" key={w}>
          {w}
        </p>
      ))}
      {detail.paidEvidence.excerpts.map((e, i) => (
        <blockquote key={`${e.sourceId}-${i}`}>
          <p className="source">{e.quote}</p>
          <p>
            By {e.author} · {e.association} · updated {new Date(e.updatedAt).toLocaleString()}
          </p>
          <a href={e.url} target="_blank" rel="noreferrer">
            Inspect original source
          </a>
        </blockquote>
      ))}
      {!detail.paidEvidence.excerpts.length && (
        <p className="notice">
          No recognized payment claim in the scanned text. Missing evidence means unknown.
        </p>
      )}
      <div className="section-divider" />
      <h3>Before doing work</h3>
      <p className="muted small mt-3">
        Confirm the payer, remaining funds, eligibility, competition, acceptance criteria, payment
        trigger, method and timing directly with the maintainer. BountyPilot does not verify funds
        or contact anyone.
      </p>
      <details>
        <summary>
          <span className="inline-flex items-center gap-2">
            <FileText aria-hidden="true" />
            Retrieved source text ({detail.sources.length} records)
          </span>
        </summary>
        {detail.sources.map((source) => (
          <article className="source-record" key={source.id}>
            <h3>
              {source.kind} · <span className="mono">{source.id}</span>
            </h3>
            <p>
              By {source.author} · {source.association} · updated{' '}
              {new Date(source.updatedAt).toLocaleString()}
              {source.truncated ? ' · Truncated' : ''}
            </p>
            <pre className="source">{source.text || '(No text retained)'}</pre>
            <a className="subtle-link" href={source.url} target="_blank" rel="noreferrer">
              View on GitHub ↗
            </a>
          </article>
        ))}
      </details>
    </section>
  );
}
