# BountyPilot

Local-first GitHub opportunity discovery with source evidence and local Gemma. Discover real public issues, inspect attributed reward evidence, analyze bounded excerpts with Gemma, and save a private pipeline. See [measured progress](docs/IMPLEMENTATION_PROGRESS.md), [design](docs/UI_DESIGN.md) and [architecture](docs/ARCHITECTURE.md).

Targets macOS, Windows and Linux with Node 24 LTS and npm. Ollama is optional for discovery/saving; actual AI requires an installed supported model or explicitly configured secure remote endpoint. Tested environments and pending checks are recorded in the progress document; no low-memory compatibility claim is made.

## Local setup

Use the recommended Node 24.22.0 patch (`nvm use` if available), then `npm ci`. Node 24.14.0 is the lower compatibility test target. Use an official runtime for your OS; no developer-specific binary is required. npm cache defaults to the project and supports normal overrides.

Copy `.env.example` to `.env.local` if changing defaults. A GitHub token is optional and must be restricted to public read access. Never expose it with a `NEXT_PUBLIC_` variable. See [cross-platform setup and configuration](docs/COMPATIBILITY.md) for PowerShell, path overrides, model selection, and secure remote Ollama requirements.

Start the installed Ollama runtime in a separate terminal:

```sh
OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_MODELS="$PWD/data/ollama-models" ollama serve
```

Then `ollama pull gemma3:4b` (preferred), or explicitly install `gemma3:1b` as a lighter alternative. Choose an installed model before analysis. Neither model's download size proves that it fits your RAM. Use a different configured loopback port if another Ollama instance owns the default; never kill an unrelated instance. Weights follow the server's configured directory. Gemma has separate [model terms](https://ai.google.dev/gemma/terms); weights are not included in this project.

Run `npm run dev` and open http://127.0.0.1:3000. Keep this origin; localhost and remote hosts are deliberately rejected. Production: `npm run build` then `npm start`. App and Ollama must remain bound to loopback. Do not expose them to the internet.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; actual model probe: `npm run probe:model`. Model measurements are recorded only after real inference.

Browser checks: `npm run setup:browser` downloads official Chromium into the configurable project cache. Then `npm run build` and `npm run test:e2e`. Tests start a separate local app with a disposable database and use explicitly synthetic HTTP fixtures; they do not prove live funding or AI quality. Set `PLAYWRIGHT_BROWSERS_PATH` or `BOUNTYPILOT_CACHE_DIR` to change artifact locations.

SQLite lives at `data/bountypilot.sqlite`. Never delete/reset it as a recovery step. Before migration or backup, stop the application and copy the database after a clean checkpoint/shutdown; do not copy only the main file from an active WAL database. All runtime data, backups, caches and weights are ignored by Git. Local data is plaintext and protected by OS permissions, not application encryption.


## Use the workspace

Discover submits explicit GitHub searches. Skills affect local relevance, not the GitHub query. Evidence filtering/sorting applies to the fetched page. Open a detail and explicitly retrieve its current source, review evidence/coverage, select an installed model, and Analyze. Every successful analysis includes checked exact quotes, model/digest and measured latency. Save it and track its local status in Pipeline. Overview counts local snapshots; it does not imply catalog-wide discovery or earnings.

Preferred Gemma 4B passed the small prompt-v4 corpus, with 11/12 manually useful results and semantic limitations. **Gemma 1B is experimental: all 12 grounded evaluation runs failed validation; one rejected result followed malicious source instructions.** It is selectable for experimentation, not a proven usable or lower-memory replacement. Invalid results never replace a successful analysis. The app remains useful without Ollama for search, evidence and saving.

The UI is dark first with a persistent light-mode toggle, labeled responsive navigation, keyboard focus and local removal confirmation. No billing, accounts, financial dashboard, notes, Kanban or hosted service is implied.

## Backup and recovery

1. Stop the BountyPilot process and wait for it to exit. Leave the original files in place.
2. Copy `data/bountypilot.sqlite` (or your configured file) into a new backup directory. Also copy any remaining `-wal` file beside it under the same base filename. Do not copy a database while the app is writing to it. Keep backups private.
3. Restore those copies to a **separate** directory. Do not overwrite the original. Set `DATABASE_PATH` to the restored `.sqlite` file when starting the app.
4. To check a stopped restored copy with Node, run this from the project root with its path as the final argument:

```sh
node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; const db=new DatabaseSync(process.argv[1]); console.log(db.prepare('PRAGMA integrity_check').all()); console.log(db.prepare('PRAGMA foreign_key_check').all()); db.close();" data/backup/bountypilot.sqlite
```

Expect `integrity_check: 'ok'` and no foreign-key rows; then verify Pipeline and its last analyses. A newer schema, locked disk or bad path is an error to diagnose, never permission to reset data. Automated restore tests use a checkpointed disposable database and do not overwrite personal data.

## Live evaluation and demo

Ordinary CI uses synthetic HTTP/provider fixtures and a separate SQLite file; no GPU, GitHub credential or live model is required. To evaluate actual installed Gemma, set `BOUNTYPILOT_LIVE_EVAL=1` and `OLLAMA_BASE_URL`, then run `npm test -- tests/live-model.test.ts`. PowerShell: `$env:BOUNTYPILOT_LIVE_EVAL='1'`; macOS/Linux: `export BOUNTYPILOT_LIVE_EVAL=1`. Set `GEMMA_MODEL=gemma3:1b` explicitly to compare it. Never run this concurrently with someone else's inference. Evaluation outputs and its separate database are under `.cache/model-eval-*`; they are not live opportunities. Inspect semantics manually against the frozen case expectations.

With the actual app running and Chromium installed, `node scripts/record-demo.mjs owner/repository` searches that **real** public repository, analyzes the first unsaved result with actual local 4B, reviews citations, saves it and reloads Pipeline. Set `APP_ORIGIN` if using another local app port. It records local video/screenshots under `.cache/demo` and never mocks sources or publishes anything. It may fail on quota/model/source changes; do not replace failure with a fabricated result.

[MIT license](LICENSE) covers original application code. Read [third-party notices](THIRD_PARTY_NOTICES.md), [contribution guidance](CONTRIBUTING.md) and [security/privacy notes](SECURITY.md). Gemma terms and source-author rights remain separate. No first paying customer, confirmed bounty payment, Windows/Linux hardware result or live remote-provider result is claimed.
