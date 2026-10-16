'use client';
import { useEffect, useRef, useState } from 'react';
import { Cpu, LoaderCircle, Play, Square, ExternalLink, ShieldQuestion } from 'lucide-react';
import { analysisPromptVersion, type AnalysisRecord, type Health } from '@/lib/schemas';
import { requestData } from '@/lib/client';
import { ModelSelect } from './ModelSelect';
import { Button } from './ui/button';
export function AnalysisPanel({
  id,
  snapshotHash,
  initial,
  state
}: {
  id: string;
  snapshotHash: string;
  initial: AnalysisRecord | null;
  state: Health;
}) {
  const [analysis, setAnalysis] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function analyze() {
    if (!form.current) return;
    const values = new FormData(form.current);
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await requestData<{ analysis: AnalysisRecord; reused: boolean }>(
        `/api/opportunities/${id}/analyze`,
        {
          method: 'POST',
          signal: current.signal,
          body: JSON.stringify({
            model: values.get('model'),
            skills: String(values.get('skills') || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          })
        }
      );
      if (!current.signal.aborted) {
        setAnalysis(result.analysis);
        setMessage(
          result.reused
            ? 'Reused the matching saved analysis; no new inference.'
            : 'Analysis complete and saved locally.'
        );
      }
    } catch (e) {
      setError(
        current.signal.aborted
          ? 'Cancellation requested. The last successful result is preserved. Ollama may take a moment to release resources.'
          : e instanceof Error
            ? e.message
            : 'Analysis failed. Try again.'
      );
    } finally {
      if (controller.current === current) setBusy(false);
    }
  }
  return (
    <section className="panel analysis-panel" aria-busy={busy}>
      <h2 className="panel-title">
        <Cpu aria-hidden="true" />
        Gemma analysis
      </h2>
      <p className="muted small">
        {state.inferenceMode === 'remote'
          ? 'Remote inference sends selected excerpts and skills to your configured provider.'
          : 'On-device inference. No automatic cloud fallback.'}{' '}
        Analysis is interpretation, not verification.
      </p>
      <form
        ref={form}
        onSubmit={(e) => {
          e.preventDefault();
          void analyze();
        }}
      >
        <ModelSelect state={state} />
        <label className="mt-4">
          Skills for analysis
          <input name="skills" placeholder="typescript, testing" maxLength={309} />
        </label>
        <p className="form-help">Up to 10 comma-separated skills.</p>
        <div className="row mt-4">
          <Button type="submit" disabled={busy || state.ollama !== 'ready'}>
            {busy ? (
              <LoaderCircle className="spinner" aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            {busy ? 'Analyzing…' : analysis ? 'Analyze again' : 'Analyze opportunity'}
          </Button>
          {busy && (
            <Button type="button" variant="outline" onClick={() => controller.current?.abort()}>
              <Square aria-hidden="true" />
              Cancel analysis
            </Button>
          )}
        </div>
      </form>
      {state.ollama !== 'ready' && (
        <p className="notice">
          AI is disabled. Start Ollama, install a supported Gemma model and reload this page.{' '}
          <a href="/settings">Open setup instructions</a>. Evidence and saving still work.
        </p>
      )}
      <div role="status" aria-live="polite" className="feedback">
        {busy && (
          <p className="muted small">
            Reading bounded source excerpts. This can take up to two minutes; you can keep reading
            the evidence.
          </p>
        )}
        {error && <p className="notice error">{error}</p>}
        {message && <p className="toast">{message}</p>}
      </div>
      {analysis ? (
        <div className="analysis-result">
          {(analysis.snapshotHash !== snapshotHash || analysis.promptVersion !== analysisPromptVersion || state.models.some(model=>model.name===analysis.modelTag && model.digest!==analysis.modelDigest)) && (
            <p className="notice">
              Stale analysis: sources, model digest or analysis rules changed. These citations refer to the original
              analyzed excerpts. Analyze again to use current sources.
            </p>
          )}
          <div className="section-divider" />
          <div className="row">
            <span className="badge mono">{analysis.modelTag}</span>
            <span className="small muted">
              {(analysis.durationMs / 1000).toFixed(2)} s measured ·{' '}
              {new Date(analysis.generatedAt).toLocaleString()}
            </span>
          </div>
          <p className="small muted mt-2">
            Digest <code>{analysis.modelDigest.slice(0, 12)}</code> · prompt{' '}
            {analysis.promptVersion}
          </p>
          <h3 className="mt-6">Scope interpretation · last successful analysis</h3>
          <p className="analysis-copy">{analysis.result.summary}</p>
          <h3 className="mt-6">Skills and difficulty · estimates</h3>
          <div className="tags">
            {analysis.result.skills.map((skill) => (
              <span className="tag" key={skill}>
                {skill}
              </span>
            ))}
            <span className="badge">{analysis.result.difficulty} difficulty</span>
          </div>
          <p className="small muted">
            Compare the inferred skills above with your inputs:{' '}
            {analysis.skills.join(', ') || 'none supplied'}. Effort is unknown; no hourly estimate
            is generated.
          </p>
          {analysis.result.suggestions.length > 0 && (
            <>
              <h3 className="mt-6">Suggested approach · estimates</h3>
              <ul className="analysis-copy">
                {analysis.result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
          {analysis.result.risks.length > 0 && (
            <>
              <h3 className="mt-6">Risks to inspect · model interpretation</h3>
              <ul className="analysis-copy">
                {analysis.result.risks.map((risk, i) => (
                  <li key={i}>
                    {risk.text} <span className="mono muted">[{risk.citationIds.join(', ')}]</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className="mt-6">Unknowns and questions</h3>
          <ul className="analysis-copy">
            {[...analysis.result.unknowns, ...analysis.result.questions].map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <h3 className="mt-6">Evidence citations · exact excerpts</h3>
          {analysis.result.citations.map((c) => {
            const source = analysis.sources.sources.find(
              (s) => s.id === c.sourceId && s.text.includes(c.quote)
            );
            return (
              <blockquote key={c.id}>
                <p className="source">“{c.quote}”</p>
                <p>
                  [{c.id}] · {source?.author} · {source?.association} · {source?.updatedAt}
                </p>
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer" className="subtle-link">
                    Inspect original source
                    <ExternalLink aria-hidden="true" />
                  </a>
                )}
              </blockquote>
            );
          })}
          <p className="notice">
            AI input: {analysis.sources.sources.length} excerpt records /{' '}
            {analysis.sources.availableSources} retrieved sources;{' '}
            {analysis.sources.inputCharacters.toLocaleString()} characters.{' '}
            {analysis.sources.omittedOrShortened
              ? 'Some text was shortened or omitted.'
              : 'All retained source text included.'}{' '}
            Exact quote checks establish fidelity, not truth or semantic support. Confirm
            conclusions against GitHub.
          </p>
        </div>
      ) : (
        !busy && (
          <div className="analysis-empty">
            <ShieldQuestion aria-hidden="true" />
            <p>
              Get a second perspective on scope, skill fit and unanswered questions. Review every
              conclusion against its sources.
            </p>
          </div>
        )
      )}
    </section>
  );
}
