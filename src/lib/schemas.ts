import { z } from 'zod';
export const modelTag = z.enum(['gemma3:4b', 'gemma3:1b']);
export const healthSchema = z.object({
  app: z.literal('ready'), storage: z.enum(['ready', 'error']),
  github: z.enum(['configured', 'anonymous']),
  ollama: z.enum(['ready', 'unreachable', 'model_missing', 'configuration_error', 'unauthorized']), modelTag,
  models: z.array(z.object({ name: modelTag, digest: z.string(), size: z.number() })),
  inferenceMode: z.enum(['local', 'remote', 'unconfigured']),
});
export type Health = z.infer<typeof healthSchema>;
