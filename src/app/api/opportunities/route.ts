import { api } from '@/lib/server/errors';
import { searchOpportunities } from '@/lib/server/github';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  return api(() =>
    searchOpportunities({
      preset: query.get('preset') || undefined,
      keywords: query.get('keywords') || '',
      repo: query.get('repo') || '',
      language: query.get('language') || '',
      skills: query.getAll('skill'),
      page: query.get('page') || 1
    })
  );
}
