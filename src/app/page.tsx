import { health } from '@/lib/server/health';
import { ReadinessNotice } from '@/components/ReadinessNotice';
import { SearchForm } from '@/components/SearchForm';
import { PageHeading } from '@/components/PageHeading';
export default async function Home() {
  const state = await health();
  return (
    <>
      <PageHeading
        eyebrow="Discover / public GitHub issues"
        title="Find your next opportunity"
        description="Real issues. Visible evidence. Local AI to help you decide where your skills fit."
      />
      <ReadinessNotice state={state} />
      <SearchForm />
    </>
  );
}
