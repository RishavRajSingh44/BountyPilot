import { z } from 'zod';
import { api } from '@/lib/server/errors';
import { requestJson } from '@/lib/server/requests';
import { issueId, savedStatus } from '@/lib/schemas';
import { saveOpportunity, unsaveOpportunity, updateSaved } from '@/lib/server/db';
export const runtime = 'nodejs';
type Context = { params: Promise<{ issueId: string }> };
export async function PUT(request: Request, context: Context) {
  return api(async () => {
    z.strictObject({}).parse(await requestJson(request));
    return saveOpportunity(issueId.parse((await context.params).issueId));
  });
}
export async function PATCH(request: Request, context: Context) {
  return api(async () => {
    const input = z.strictObject({ status: savedStatus }).parse(await requestJson(request));
    return updateSaved(issueId.parse((await context.params).issueId), input.status);
  });
}
export async function DELETE(_request: Request, context: Context) {
  return api(async () => {
    unsaveOpportunity(issueId.parse((await context.params).issueId));
    return new Response(null, { status: 204 });
  });
}
