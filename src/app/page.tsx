import { health } from '@/lib/server/health';
import { ModelSelect, ReadinessNotice } from '@/components/ReadinessNotice';
export default async function Home() {
  const state = await health();
  return <><h1>Find work worth investigating</h1><p>Inspect real GitHub opportunities with local AI and visible evidence.</p><ReadinessNotice state={state}/><ModelSelect state={state}/></>;
}
