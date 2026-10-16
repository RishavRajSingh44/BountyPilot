import { listSaved } from '@/lib/server/db';
import { PipelineList } from '@/components/PipelineList';
import { PageHeading } from '@/components/PageHeading';
export default function Pipeline() {
  return (
    <>
      <PageHeading
        eyebrow="Pipeline / your shortlist"
        title="Keep promising work in sight"
        description="A private pipeline on this computer. Update your progress without changing anything on GitHub."
      />
      <PipelineList initial={listSaved()} />
    </>
  );
}
