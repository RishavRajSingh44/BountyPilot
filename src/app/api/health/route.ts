import { health } from '@/lib/server/health';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const data = await health();
  return Response.json(
    { data },
    { status: data.storage === 'ready' ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
