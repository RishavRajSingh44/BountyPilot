import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
const cache = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache');
export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0,
  outputDir: resolve(cache, 'test-results'), reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3100', browserName: 'chromium', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run start -- --port 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 60000,
    env: { APP_ORIGIN: 'http://127.0.0.1:3100', DATABASE_PATH: resolve(cache, 'e2e-runtime.sqlite'), OLLAMA_BASE_URL: 'http://127.0.0.1:9', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
