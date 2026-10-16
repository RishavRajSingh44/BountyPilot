'use client';
import { useEffect, useRef, useId } from 'react';
import type { Health } from '@/lib/schemas';
export function ModelSelect({ state }: { state: Health }) {
  const select = useRef<HTMLSelectElement>(null);
  const id = useId();
  const experimental = state.models.some((model) => model.name === 'gemma3:1b');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bountypilot-model');
      if (saved && state.models.some((m) => m.name === saved) && select.current)
        select.current.value = saved;
    } catch {
      /* Browser preference storage may be disabled. */
    }
  }, [state.models]);
  return (
    <>
      <label htmlFor={id}>
        Installed AI model
        <select
          ref={select}
          id={id}
          aria-describedby={experimental ? `${id}-help` : undefined}
          name="model"
          defaultValue={state.modelTag}
          disabled={state.ollama !== 'ready'}
          onChange={(e) => {
            try {
              localStorage.setItem('bountypilot-model', e.target.value);
            } catch {
              /* Browser preference storage may be disabled. */
            }
          }}
        >
          {state.models.length ? (
            state.models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
                {model.name === 'gemma3:4b'
                  ? ' · preferred'
                  : ' · experimental lightweight alternative'}
              </option>
            ))
          ) : (
            <option value="">No supported model available</option>
          )}
        </select>
      </label>
      {experimental && (
        <span id={`${id}-help`} className="small muted">
          1B is experimental: it failed the grounded citation evaluation on the measured Mac. Prefer
          4B; invalid output is rejected.
        </span>
      )}
    </>
  );
}
