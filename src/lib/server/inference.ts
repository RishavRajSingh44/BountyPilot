export type InstalledModel = { name: string; digest: string; size: number };
export type GenerationRequest = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  format: Record<string, unknown>;
  options: { temperature: number; num_ctx: number; num_predict: number };
};
export type Generation = { content: string; totalDuration?: number; loadDuration?: number; tokens?: number; generationDuration?: number };
// One adapter today; keep provider transport out of analysis logic.
export interface InferenceProvider {
  mode: 'local' | 'remote';
  listModels(signal: AbortSignal): Promise<InstalledModel[]>;
  generate(request: GenerationRequest, signal: AbortSignal): Promise<Generation>;
}
