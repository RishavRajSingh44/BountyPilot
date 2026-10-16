import 'server-only';
import { AppError } from './errors';
import { boundedJson, SizeLimitError } from './http';
export async function requestJson(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new AppError('INVALID_CONTENT_TYPE', 'Send application/json.', 400);
  try { return await boundedJson(new Response(request.body, { headers: request.headers }), 8192); }
  catch (error) { throw error instanceof SizeLimitError ? new AppError('BODY_TOO_LARGE', 'Request exceeds 8 KiB.', 413) : new AppError('INVALID_JSON', 'Send valid JSON.', 400); }
}
