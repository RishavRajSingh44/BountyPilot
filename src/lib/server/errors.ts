import 'server-only';
import { ZodError } from 'zod';
export class AppError extends Error {
  constructor(public code: string, message: string, public status = 500, public retryable = false, public retryAt?: string) { super(message); }
}
export async function api(action: () => unknown | Promise<unknown>) {
  try {
    const data = await action();
    return data instanceof Response ? data : Response.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const safe = error instanceof AppError ? error : error instanceof ZodError ? new AppError('INVALID_INPUT', error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400) : new AppError('REQUEST_FAILED', 'Unable to complete this request. Check local storage and try again.', 503, true);
    return Response.json({ error: { code: safe.code, message: safe.message, retryable: safe.retryable, ...(safe.retryAt ? { retryAt: safe.retryAt } : {}) } }, { status: safe.status, headers: { 'Cache-Control': 'no-store' } });
  }
}
