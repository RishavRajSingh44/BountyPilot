import { CircleHelp, Flag, TriangleAlert } from 'lucide-react';
import type { Evidence } from '@/lib/schemas';
export function EvidenceBadge({ state }: { state: Evidence['state'] }) {
  const Icon = state === 'conflicting' ? TriangleAlert : state === 'unknown' ? CircleHelp : Flag;
  return (
    <span className={`badge evidence-${state}`}>
      <Icon aria-hidden="true" />
      {state.replaceAll('_', ' ')}
      <span className="badge-separator">·</span>unverified
    </span>
  );
}
