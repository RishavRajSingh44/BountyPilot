export function appOrigin() {
  const origin = new URL(process.env.APP_ORIGIN || 'http://127.0.0.1:3000');
  if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' || origin.username || origin.password || origin.pathname !== '/') throw new Error('APP_ORIGIN must be an HTTP loopback origin');
  return origin.origin;
}

export function allowedRequest(request: Request) {
  const origin = appOrigin();
  const host = request.headers.get('host');
  if (host !== new URL(origin).host) return false;
  const site = request.headers.get('sec-fetch-site');
  if (site && !['same-origin', 'none'].includes(site)) return false;
  const supplied = request.headers.get('origin');
  if (supplied && supplied !== origin) return false;
  if (!['GET', 'HEAD'].includes(request.method)) {
    if (supplied !== origin) return false;
    if (request.method !== 'DELETE' && request.headers.get('content-type')?.split(';')[0] !== 'application/json') return false;
  }
  return true;
}
