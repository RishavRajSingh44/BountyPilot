import { api } from '@/lib/server/errors';
import { requestJson } from '@/lib/server/requests';
import { refreshOpportunity } from '@/lib/server/opportunities';
export const runtime = 'nodejs';
export async function POST(request: Request) { return api(async () => refreshOpportunity(await requestJson(request),request.signal)); }
