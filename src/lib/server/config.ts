import 'server-only';
import { resolve } from 'node:path';
export function dataDirectory() { return resolve(process.env.BOUNTYPILOT_DATA_DIR || 'data'); }
export function inferenceConfig() {
  const url = new URL(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Use an Ollama origin without credentials, path, query or fragment');
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  const token = process.env.OLLAMA_API_KEY || '';
  if (!['http:', 'https:'].includes(url.protocol) || (!local && (url.protocol !== 'https:' || !token || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'))) throw new Error('Remote Ollama requires HTTPS, certificate verification and an API key');
  return { base: url.origin, mode: local ? 'local' as const : 'remote' as const, token };
}
