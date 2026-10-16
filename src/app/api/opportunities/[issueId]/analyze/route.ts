import { issueId } from '@/lib/schemas';
import { analyzeOpportunity } from '@/lib/server/analysis';
import { api } from '@/lib/server/errors';
import { requestJson } from '@/lib/server/requests';
export const runtime = 'nodejs';
export const maxDuration = 125;
export async function POST(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  return api(async () =>
    analyzeOpportunity(
      issueId.parse((await params).issueId),
      await requestJson(request),
      request.signal
    )
  );
}
