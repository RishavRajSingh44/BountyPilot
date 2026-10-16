import 'server-only';
export class SizeLimitError extends Error { constructor() { super('Response exceeds size limit'); } }
export async function boundedJson(response: Response, limit: number): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw new SizeLimitError(); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty response');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) throw new SizeLimitError();
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
