import { api } from '@/lib/server/errors';
import { storedDetail } from '@/lib/server/opportunities';
import { issueId } from '@/lib/schemas';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, context: { params: Promise<{ issueId: string }> }) {
  return api(async () => storedDetail(issueId.parse((await context.params).issueId)));
}
