import Link from 'next/link';
import { ArrowRight, Bookmark, Compass, Flag, History, Sparkles } from 'lucide-react';
import { workspaceOverview, listSaved } from '@/lib/server/db';
import { rank } from '@/lib/server/ranking';
import { health } from '@/lib/server/health';
import { PageHeading } from '@/components/PageHeading';
import { ReadinessNotice } from '@/components/ReadinessNotice';
import { Button } from '@/components/ui/button';
export default async function Overview() {
  const overview = workspaceOverview();
  const saved = listSaved();
  const state = await health();
  const relevant = overview.recent
    .map((s) => ({
      snapshot: s,
      score: rank(s.issue, s.evidence, [], overview.observedAt, s.repository.archived)
    }))
    .filter((s) => s.score.total >= 60);
  return (
    <>
      <PageHeading
        eyebrow="Overview / personal workspace"
        title="Good work starts with a closer look"
        description="Turn public GitHub leads into a considered shortlist, with evidence you can inspect."
        action={
          <Button asChild>
            <Link href="/">
              Discover opportunities
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <ReadinessNotice state={state} />
      <div className="stat-grid">
        {[
          {
            label: 'Retrieved leads',
            value: overview.retrieved,
            description: 'Locally retained snapshots',
            icon: Compass
          },
          {
            label: 'Saved opportunities',
            value: saved.length,
            description: 'Your private shortlist',
            icon: Bookmark
          },
          {
            label: 'Claims without conflicts',
            value: overview.claims,
            description: 'Scanned evidence · funds unverified',
            icon: Flag
          }
        ].map(({ label, value, description, icon: Icon }) => (
          <div className="panel stat" key={label}>
            <div className="stat-label">
              {label}
              <Icon aria-hidden="true" />
            </div>
            <p className="stat-value">{value}</p>
            <p className="stat-description">{description}</p>
          </div>
        ))}
      </div>
      <div className="two-column">
        <section className="panel">
          <h2 className="panel-title">
            <History aria-hidden="true" />
            Recent pipeline activity
          </h2>
          <p className="muted small">
            Latest local status updates. Earnings are not tracked in this MVP.
          </p>
          {saved.length ? (
            saved.slice(0, 6).map((item) => (
              <div className="activity-row" key={item.id}>
                <Bookmark aria-hidden="true" />
                <div className="activity-main">
                  <Link href={`/opportunities/${item.owner}/${item.repo}/${item.number}`}>
                    {item.title}
                  </Link>
                  <p>
                    {item.owner}/{item.repo} · {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>
                <span className="badge">{item.status}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Bookmark aria-hidden="true" />
              <h2>Your shortlist is ready to grow</h2>
              <p>Save a real opportunity after reviewing its source and reward evidence.</p>
              <Link href="/">Find an opportunity →</Link>
            </div>
          )}
        </section>
        <section className="panel">
          <h2 className="panel-title">
            <Sparkles aria-hidden="true" />
            High-relevance leads
          </h2>
          <p className="muted small">
            Score ≥60 among your eight latest retained snapshots; no skill profile applied.
            Heuristic fit, not a recommendation or payment guarantee.
          </p>
          {relevant.length ? (
            relevant.map(({ snapshot, score }) => (
              <div className="activity-row" key={snapshot.issue.id}>
                <div className="activity-main">
                  <Link
                    href={`/opportunities/${snapshot.issue.owner}/${snapshot.issue.repo}/${snapshot.issue.number}`}
                  >
                    {snapshot.issue.title}
                  </Link>
                  <p>
                    {snapshot.issue.owner}/{snapshot.issue.repo}
                  </p>
                </div>
                <span className="score">{score.total}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Compass aria-hidden="true" />
              <h2>No high-relevance leads yet</h2>
              <p>
                Retrieve more details in Discover. A low score can still be worth investigating.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
