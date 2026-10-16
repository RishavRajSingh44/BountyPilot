import Link from 'next/link';
import { Cpu, Database, Settings2 } from 'lucide-react';
import type { Health } from '@/lib/schemas';
export function ReadinessNotice({ state }: { state: Health }) {
  return (
    <div className="readiness-strip" aria-label="AI and storage readiness">
      <Cpu aria-hidden="true" />
      <strong>
        {state.ollama === 'ready'
          ? `${state.inferenceMode === 'remote' ? 'Remote' : 'Local'} Gemma connected`
          : 'AI unavailable'}
      </strong>
      <span className="muted mono">
        {state.ollama === 'ready' ? state.modelTag : state.ollama.replaceAll('_', ' ')}
      </span>
      <span className="row muted">
        <Database aria-hidden="true" />
        Storage {state.storage}
      </span>
      <Link className="subtle-link push" href="/settings">
        <Settings2 aria-hidden="true" />
        Setup
      </Link>
      {state.ollama !== 'ready' && (
        <p className="notice">
          AI is disabled.{' '}
          {state.ollama === 'configuration_error' || state.ollama === 'unauthorized'
            ? 'Check the server endpoint, HTTPS and API key in .env.local.'
            : 'Start Ollama and install gemma3:4b or gemma3:1b. Check that OLLAMA_BASE_URL matches its listening port.'}{' '}
          Search and saving still work.
        </p>
      )}
      {state.inferenceMode === 'remote' && (
        <p className="notice">
          Remote analysis sends selected public source excerpts and your skills to the configured
          provider. Saved data remains local.
        </p>
      )}
    </div>
  );
}
