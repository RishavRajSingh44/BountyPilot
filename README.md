# BountyPilot

Local-first GitHub opportunity discovery with source evidence and local Gemma. Under construction; see `docs/IMPLEMENTATION_PROGRESS.md` for actual verified status and the approved plan in `docs/`.

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
