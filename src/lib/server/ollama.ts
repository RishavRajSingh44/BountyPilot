import 'server-only';
import { z } from 'zod';
import { modelTag, type Health } from '@/lib/schemas';
import { inferenceConfig } from './config';
import { boundedJson } from './http';
import type { InferenceProvider } from './inference';
export function selectedModel() { return modelTag.parse(process.env.GEMMA_MODEL || 'gemma3:4b'); }
const tagsSchema = z.object({ models: z.array(z.object({ name: z.string(), digest: z.string().min(1), size: z.number().nonnegative().default(0) })).max(500) });
const chatSchema = z.object({ message: z.object({ content: z.string().min(1) }), total_duration: z.number().optional(), load_duration: z.number().optional(), eval_count: z.number().optional(), eval_duration: z.number().optional() });
export function ollamaProvider(): InferenceProvider {
  const config = inferenceConfig();
  async function request(path: string, signal: AbortSignal, body?: unknown) {
    const response = await fetch(`${config.base}${path}`, {
      method: body ? 'POST' : 'GET', signal, redirect: 'error', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'OLLAMA_UNAUTHORIZED' : 'OLLAMA_UNAVAILABLE');
    return boundedJson(response, 256 * 1024);
  }
  return {
    mode: config.mode,
    async listModels(signal) { return tagsSchema.parse(await request('/api/tags', signal)).models.filter(m => modelTag.safeParse(m.name).success); },
    async generate(input, signal) {
      const result = chatSchema.parse(await request('/api/chat', signal, { ...input, stream: false, keep_alive: '5m' }));
      return { content: result.message.content, totalDuration: result.total_duration, loadDuration: result.load_duration, tokens: result.eval_count, generationDuration: result.eval_duration };
    },
  };
}
export async function modelReadiness(): Promise<{ state: Health['ollama']; digest?: string; models: Health['models']; mode: Health['inferenceMode'] }> {
  let provider: InferenceProvider;
  try { provider = ollamaProvider(); selectedModel(); } catch { return { state: 'configuration_error', models: [], mode: 'unconfigured' }; }
  try {
    const models = (await provider.listModels(AbortSignal.timeout(2000))).map(m => ({ ...m, name: modelTag.parse(m.name) }));
    const model = models.find(m => m.name === selectedModel());
    return { state: models.length ? 'ready' : 'model_missing', ...(model ? { digest: model.digest } : {}), models, mode: provider.mode };
  } catch (error) {
    return { state: error instanceof Error && error.message === 'OLLAMA_UNAUTHORIZED' ? 'unauthorized' : 'unreachable', models: [], mode: provider.mode };
  }
}
