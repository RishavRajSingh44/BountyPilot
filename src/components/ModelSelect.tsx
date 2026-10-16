'use client';
import { useEffect, useRef } from 'react';
import type { Health } from '@/lib/schemas';
export function ModelSelect({ state }: { state: Health }) {
  const select = useRef<HTMLSelectElement>(null);
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
    <label>
      Installed AI model
      <select
        ref={select}
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
              {model.name === 'gemma3:4b' ? ' · preferred' : ' · experimental lightweight alternative'}
            </option>
          ))
        ) : (
          <option value="">No supported model available</option>
        )}
      </select>
      {state.models.some((model) => model.name === 'gemma3:1b') && (
        <span className="small muted">1B is experimental: it failed the grounded citation evaluation on the measured Mac. Prefer 4B; invalid output is rejected.</span>
      )}
    </label>
  );
}
