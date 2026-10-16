import 'server-only';
import { database } from './db';
import { modelReadiness } from './ollama';
import type { Health } from '@/lib/schemas';
export async function health(): Promise<Health> {
  let storage: Health['storage'] = 'ready';
  try { database().prepare('SELECT 1').get(); } catch { storage = 'error'; }
  const ai = await modelReadiness();
  return { app: 'ready', storage, github: process.env.GITHUB_TOKEN ? 'configured' : 'anonymous', ollama: ai.state, modelTag: ai.models.find(m => m.name === process.env.GEMMA_MODEL)?.name || ai.models.find(m => m.name === 'gemma3:4b')?.name || ai.models[0]?.name || 'gemma3:4b', models: ai.models, inferenceMode: ai.mode };
}
