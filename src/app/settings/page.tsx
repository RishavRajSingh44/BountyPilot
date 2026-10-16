import { Cpu, Database, LockKeyhole, UserRound } from 'lucide-react';
import { health } from '@/lib/server/health';
import { PageHeading } from '@/components/PageHeading';
import { ReadinessNotice } from '@/components/ReadinessNotice';
import { ModelSelect } from '@/components/ModelSelect';
export default async function Settings() {
  const state = await health();
  return (
    <>
      <PageHeading
        eyebrow="Settings / local configuration"
        title="Your tools. Your computer."
        description="Choose a local model, understand your data and keep the workspace under your control."
      />
      <ReadinessNotice state={state} />
      <div className="settings-grid">
        <section className="panel">
          <h2 className="panel-title">
            <Cpu aria-hidden="true" />
            Inference provider
          </h2>
          <p>
            Ollama · {state.inferenceMode} · {state.ollama.replaceAll('_', ' ')}
          </p>
          <ModelSelect state={state} />
          <p>
            Your selection is remembered in this browser and used by analysis forms. Only installed
            supported models appear.
          </p>
          <div className="section-divider" />
          <h3>First-time setup</h3>
          <p>
            Start <code>ollama serve</code>, then <code>ollama pull gemma3:4b</code>. Set{' '}
            <code>OLLAMA_BASE_URL</code> in your local environment if using a different port, then
            restart BountyPilot.
          </p>
          <p>
            <code>gemma3:1b</code> is an experimental lightweight alternative. Install it with{' '}
            <code>ollama pull gemma3:1b</code>. Speed and quality depend on hardware; smaller-memory
            computers have not been tested.
          </p>
          {state.models.map((model) => (
            <p key={model.name}>
              <span className="tag mono">{model.name}</span> {(model.size / 1e9).toFixed(2)} GB
              download · digest <code>{model.digest.slice(0, 12)}</code>
            </p>
          ))}
        </section>
        <section className="panel">
          <h2 className="panel-title">
            <LockKeyhole aria-hidden="true" />
            Privacy and connectivity
          </h2>
          <p>
            Saved opportunities, statuses and successful analyses are kept in local SQLite. No
            analytics, accounts or automatic cloud fallback.
          </p>
          <p>
            GitHub search and refresh send your query to GitHub. Skills are excluded from the GitHub
            query.
          </p>
          <p>
            Optional remote Ollama requires HTTPS, verified certificates and a server-side{' '}
            <code>OLLAMA_API_KEY</code>. Public unauthenticated Ollama endpoints are unsafe. Remote
            analysis sends selected public excerpts and skills to that configured provider.
          </p>
          <p>
            Keep credentials in <code>.env.local</code>. Never use <code>NEXT_PUBLIC_</code> for
            tokens.
          </p>
        </section>
        <section className="panel">
          <h2 className="panel-title">
            <UserRound aria-hidden="true" />
            Skills and fit
          </h2>
          <p>
            Enter up to ten comma-separated skills when searching or analyzing an issue. Search fit
            is a deterministic page-local heuristic; model skill suggestions are estimates.
          </p>
          <p>
            No permanent skill profile is stored in P0. You control the skills sent with each
            analysis.
          </p>
        </section>
        <section className="panel">
          <h2 className="panel-title">
            <Database aria-hidden="true" />
            Local data
          </h2>
          <p>
            Storage: <strong>{state.storage}</strong>. Configure <code>BOUNTYPILOT_DATA_DIR</code>{' '}
            or <code>DATABASE_PATH</code> before starting the app. Default:{' '}
            <code>data/bountypilot.sqlite</code>.
          </p>
          <p>
            SQLite is plaintext. Protect this computer and any backups. Stop BountyPilot before
            copying the database and its remaining WAL files; follow the backup procedure in README.
          </p>
          <p>
            Removing an item from Pipeline changes only your local shortlist. It does not withdraw a
            GitHub application or delete a source issue.
          </p>
        </section>
      </div>
    </>
  );
}
