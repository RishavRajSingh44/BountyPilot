import { expect, it } from 'vitest';
import { createServer, type ServerResponse } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const execute = promisify(execFile);

it.each(['redirect', 'timeout'])('model probe rejects a %s before inference', async (mode) => {
  const paths: string[] = [];
  const server = createServer((request, response: ServerResponse) => {
    paths.push(request.url || '');
    if (mode === 'redirect') {
      response.writeHead(302, { Location: '/unexpected' });
      response.end();
    }
    // The timeout case intentionally leaves the readiness response open.
  });
  await new Promise<void>((ready) => server.listen(0, '127.0.0.1', ready));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test listener');
    await expect(execute(process.execPath, [resolve('scripts/probe-model.mjs')], {
      env: { ...process.env, OLLAMA_BASE_URL: `http://127.0.0.1:${address.port}`, GEMMA_MODEL: 'gemma3:4b' },
      timeout: 8000
    })).rejects.toMatchObject({ code: 1 });
    expect(paths).toEqual(['/api/tags']);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
}, 10000);
