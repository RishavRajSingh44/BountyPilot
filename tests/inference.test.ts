import { afterEach, expect, it, vi } from 'vitest';
import { boundedJson } from '@/lib/server/http';
import { ollamaProvider } from '@/lib/server/ollama';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('bounds a streamed response even without Content-Length', async () => {
  await expect(boundedJson(new Response('123456789'), 4)).rejects.toThrow('size limit');
  await expect(boundedJson(new Response('{}', { headers: { 'content-length': '999' } }), 4)).rejects.toThrow('size limit');
  await expect(boundedJson(Response.json({ ok: true }), 100)).resolves.toEqual({ ok: true });
});
it('keeps remote credentials server-side and uses fixed API paths without redirects', async () => {
  vi.stubEnv('OLLAMA_BASE_URL', 'https://inference.example'); vi.stubEnv('OLLAMA_API_KEY', 'test-secret');
  const mock = vi.fn().mockResolvedValue(Response.json({ message: { content: '{"summary":"test"}' }, eval_count: 12 })); vi.stubGlobal('fetch', mock);
  const provider = ollamaProvider(); expect(provider.mode).toBe('remote');
  const output = await provider.generate({ model: 'gemma3:1b', messages: [{ role: 'user', content: 'synthetic test' }], format: {}, options: { temperature: 0, num_ctx: 8192, num_predict: 1200 } }, AbortSignal.timeout(1000));
  expect(output.content).toBe('{"summary":"test"}');
  expect(mock).toHaveBeenCalledWith('https://inference.example/api/chat', expect.objectContaining({ redirect: 'error', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-secret' } }));
});
