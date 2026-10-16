import type { Health } from '@/lib/schemas';
export function ModelSelect({ state }: { state: Health }) {
  return <label>Installed AI model<select name="model" defaultValue={state.modelTag} disabled={state.ollama !== 'ready'}>
    {state.models.length ? state.models.map(model => <option key={model.name} value={model.name}>{model.name}{model.name === 'gemma3:4b' ? ' (preferred)' : ' (lightweight alternative)'}</option>) : <option value="">No supported model available</option>}
  </select></label>;
}
export function ReadinessNotice({ state }: { state: Health }) {
  return <section aria-label="AI and storage readiness"><h2>Readiness</h2><p>Storage: {state.storage} · GitHub: {state.github} · AI: {state.ollama}</p>
    <p>Inference: {state.inferenceMode === 'remote' ? 'Remote — analysis sends selected source excerpts and skills to your configured provider. Saved data stays on this computer.' : state.inferenceMode === 'local' ? 'Local Ollama — analysis stays on this computer.' : 'Not configured'}</p>
    {state.ollama !== 'ready' && <p className="notice">AI is disabled. {state.ollama === 'configuration_error' || state.ollama === 'unauthorized' ? 'Check the server endpoint, HTTPS and API key in .env.local; credentials must stay server-side.' : 'Start Ollama with ollama serve, then install gemma3:4b or gemma3:1b using ollama pull. Match OLLAMA_BASE_URL to its listening port.'} Search and saved opportunities do not require AI.</p>}
    <p className="muted">Model suitability depends on your hardware and context. A smaller model is not a tested RAM guarantee.</p>
  </section>;
}
