import { health } from '@/lib/server/health';
import { notFound } from 'next/navigation';
import { identitySchema } from '@/lib/schemas';
import { snapshotByIdentity } from '@/lib/server/db';
import { detail } from '@/lib/server/opportunities';
import { OpportunityDetail } from '@/components/OpportunityDetail';
export default async function Page({
  params
}: {
  params: Promise<{ owner: string; repo: string; number: string }>;
}) {
  const parsed = identitySchema.safeParse(await params);
  if (!parsed.success) notFound();
  const identity = parsed.data;
  const snapshot = snapshotByIdentity(identity.owner, identity.repo, identity.number);
  return (
    <OpportunityDetail
      key={`${identity.owner}/${identity.repo}/${identity.number}`}
      identity={identity}
      initial={snapshot ? detail(snapshot) : null}
      state={await health()}
    />
  );
}
