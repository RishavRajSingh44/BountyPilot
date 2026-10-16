import 'server-only';
export async function boundedJson(response: Response, limit: number): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw new Error('Response exceeds size limit'); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty response');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) throw new Error('Response exceeds size limit');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
