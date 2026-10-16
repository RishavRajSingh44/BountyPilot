import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { openDatabase } from '@/lib/server/db';
import { allowedRequest } from '@/lib/server/security';
import { modelReadiness } from '@/lib/server/ollama';
import { health } from '@/lib/server/health';
import { inferenceConfig, dataDirectory } from '@/lib/server/config';

const directories: string[] = [];
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true }); });
function tempDatabase() { const cache = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache'); mkdirSync(cache, { recursive: true }); const directory = mkdtempSync(resolve(cache, 'db test-')); directories.push(directory); return resolve(directory, 'test.sqlite'); }

describe('local storage', () => {
  it('migrates twice, enforces foreign keys and persists after reopen', () => {
    const file = tempDatabase(); const db = openDatabase(file);
    expect(db.prepare('PRAGMA user_version').get()?.user_version).toBe(1);
    expect(() => db.prepare('INSERT INTO saved_opportunities VALUES (?,?,?,?)').run('missing', 'saved', 'now', 'now')).toThrow();
    db.prepare('INSERT INTO opportunities VALUES (?,?,?,?,?,?,?,?,?,?)').run('1', 'owner', 'repo', 1, 'https://github.com/owner/repo/issues/1', 'sentinel', 'open', '{}', 'hash', 'now');
    db.close(); const reopened = openDatabase(file);
    expect(reopened.prepare('SELECT title FROM opportunities').get()?.title).toBe('sentinel');
    reopened.close();
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync(${JSON.stringify(file)}); console.log(db.prepare('SELECT title FROM opportunities').get().title); db.close();`], { encoding: 'utf8' });
    expect(child.status).toBe(0); expect(child.stdout.trim()).toBe('sentinel');
  });
  it('refuses newer schemas and never resets them', () => {
    const file = tempDatabase(); const db = openDatabase(file); db.exec('PRAGMA user_version=2'); db.close();
    expect(() => openDatabase(file)).toThrow('newer');
  });
  it('rolls back a failed migration without losing existing data', async () => {
    const { DatabaseSync } = await import('node:sqlite');
    const file = tempDatabase(); const db = new DatabaseSync(file);
    db.exec('CREATE TABLE opportunities (sentinel TEXT); INSERT INTO opportunities VALUES (\'keep\')'); db.close();
    expect(() => openDatabase(file)).toThrow();
    const check = new DatabaseSync(file);
    expect(check.prepare('SELECT sentinel FROM opportunities').get()?.sentinel).toBe('keep');
    expect(check.prepare('PRAGMA user_version').get()?.user_version).toBe(0); check.close();
  });
  it('resolves a user-configured data directory without a developer path', () => { vi.stubEnv('BOUNTYPILOT_DATA_DIR', 'custom-data'); expect(dataDirectory()).toBe(resolve('custom-data')); });
});

describe('local request boundary', () => {
  const request = (headers: Record<string, string> = {}, method = 'GET') => new Request('http://127.0.0.1:3000/api/saved', { method, headers: { host: '127.0.0.1:3000', ...headers } });
  it('accepts the local origin and rejects rebinding/cross-site reads', () => {
    expect(allowedRequest(request())).toBe(true);
    expect(allowedRequest(request({ host: 'evil.example' }))).toBe(false);
    expect(allowedRequest(request({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
    expect(allowedRequest(request({ origin: 'https://evil.example' }))).toBe(false);
  });
  it('requires matching Origin and JSON for writes', () => {
    expect(allowedRequest(request({}, 'POST'))).toBe(false);
    expect(allowedRequest(request({ origin: 'http://127.0.0.1:3000', 'content-type': 'application/json' }, 'POST'))).toBe(true);
    expect(allowedRequest(request({ origin: 'http://127.0.0.1:3000', 'content-type': 'text/plain' }, 'POST'))).toBe(false);
  });
});

describe('readiness', () => {
  it('distinguishes ready, missing and unreachable without pulling a model', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ models: [{ name: 'gemma3:4b', digest: 'digest' }] })); vi.stubGlobal('fetch', fetchMock);
    expect(await modelReadiness()).toMatchObject({ state: 'ready', digest: 'digest', mode: 'local', models: [{ name: 'gemma3:4b' }] });
    fetchMock.mockResolvedValueOnce(Response.json({ models: [] })); expect((await modelReadiness()).state).toBe('model_missing');
    fetchMock.mockRejectedValueOnce(new Error('offline')); expect((await modelReadiness()).state).toBe('unreachable');
  });
  it('keeps health usable when AI is unavailable and reports storage error', async () => {
    const file = tempDatabase(); vi.stubEnv('DATABASE_PATH', file.replace('test.sqlite', '')); vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await health()).toMatchObject({ storage: 'error', ollama: 'unreachable', modelTag: 'gemma3:4b' });
  });
});

describe('portable inference configuration', () => {
  it('uses a configurable loopback port', () => {
    vi.stubEnv('OLLAMA_BASE_URL', 'http://127.0.0.1:11435'); expect(inferenceConfig()).toMatchObject({ base: 'http://127.0.0.1:11435', mode: 'local' });
  });
  it('requires verified HTTPS and credentials for remote inference', () => {
    vi.stubEnv('OLLAMA_BASE_URL', 'http://inference.example'); expect(inferenceConfig).toThrow();
    vi.stubEnv('OLLAMA_BASE_URL', 'https://inference.example'); expect(inferenceConfig).toThrow();
    vi.stubEnv('OLLAMA_API_KEY', 'test-only-key'); expect(inferenceConfig()).toMatchObject({ mode: 'remote' });
    vi.stubEnv('NODE_TLS_REJECT_UNAUTHORIZED', '0'); expect(inferenceConfig).toThrow();
  });
  it.each(['http://user:secret@localhost:11434', 'https://example.test/?token=secret', 'file:///tmp/socket', 'https://example.test/private'])('rejects unsafe endpoint %s', endpoint => {
    vi.stubEnv('OLLAMA_BASE_URL', endpoint); expect(inferenceConfig).toThrow();
  });
  it('offers 1B when only 1B is installed; does not invent a 4B model', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ models: [{ name: 'gemma3:1b', digest: '1b' }, { name: 'other:latest', digest: 'other' }] })));
    const ready = await modelReadiness(); expect(ready.state).toBe('ready'); expect(ready.models.map(m => m.name)).toEqual(['gemma3:1b']);
  });
  it('exposes safe authentication/configuration errors without credentials', async () => {
    vi.stubEnv('OLLAMA_BASE_URL', 'https://example.test'); expect((await modelReadiness()).state).toBe('configuration_error');
    vi.stubEnv('OLLAMA_API_KEY', 'secret'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));
    expect(await modelReadiness()).toEqual({ state: 'unauthorized', models: [], mode: 'remote' });
  });
});
