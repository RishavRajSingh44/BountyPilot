import { listSaved } from '@/lib/server/db';
import { PipelineList } from '@/components/PipelineList';
export default function Pipeline() { return <><h1>Saved pipeline</h1><PipelineList initial={listSaved()}/></>; }
