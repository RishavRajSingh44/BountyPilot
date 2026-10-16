import { api } from '@/lib/server/errors';
import { listSaved } from '@/lib/server/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  return api(() => ({ items: listSaved() }));
}
