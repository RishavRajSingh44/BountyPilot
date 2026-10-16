export async function requestData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers); if (options.body) headers.set('Content-Type','application/json');
  const response = await fetch(path,{...options,headers,cache:'no-store'});
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => { throw new Error('The server response could not be read. Try again.'); });
  if (!response.ok) throw new Error(`${body.error?.message || 'Request failed.'}${body.error?.retryAt ? ` Retry after ${new Date(body.error.retryAt).toLocaleString()}.` : ''}`);
  return body.data as T;
}
