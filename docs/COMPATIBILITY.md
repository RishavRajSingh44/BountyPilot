# Installation and compatibility

Support targets: macOS, Windows and Linux. Test evidence is in IMPLEMENTATION_PROGRESS.md; a CI matrix or installation recipe is not proof that a platform/hardware configuration passed. No minimum RAM/GPU claim has been established. The measured development machine is not a product requirement.

## Node and installation

Use the recommended Node 24 LTS security patch (`.nvmrc` currently pins 24.22.0). The app's declared range is Node 24.14.0 through 24.x, subject to the actual build/test gates. The prior 24.15 assumption was about SQLite release-candidate status; 24.14 already provides the API used here. Active Node 22.9 is not compatible with the installed Vitest engine range. Do not bypass npm engine/peer checks.

Use the package scripts, which select Next's supported Webpack compiler. Turbopack's CSS worker could not bind its local worker port in the development environment, including the escalated retry. This is a tooling/environment limitation, not a claim about other OSs.

Install Node/npm for your OS using the official Node distribution or your preferred version manager. From the repository root on all three systems:

```text
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The app runs only on loopback and does not require a Python service, Docker, GPU, or Ollama to search/save . Windows contributors can use native PowerShell; WSL is optional, not required. SQLite is provided by Node; Tailwind/Next test their native optional packages during install/build. Do not copy node_modules between operating systems.

Copy `.env.example` to `.env.local`: macOS/Linux `cp .env.example .env.local`; PowerShell `Copy-Item .env.example .env.local`. Edit configuration there, never in source. Changes require app restart. `APP_ORIGIN` controls the accepted loopback app port; defaults to `http://127.0.0.1:3000`.

## Local AI

Install a current [Ollama runtime](https://ollama.com/download) for your OS and confirm `ollama --version`. A registry response requiring a newer runtime is a real incompatibility: update Ollama through its documented method; don't fabricate a model or silently use cloud inference. Model files are separate from application dependencies.

Preferred model: `ollama pull gemma3:4b`. Lightweight alternative: `ollama pull gemma3:1b`. These downloads are not proof that either fits your RAM or meets latency/quality goals. BountyPilot lists installed supported models and lets you choose before Analyze; it never automatically downloads weights. If no supported model/provider is available, AI controls are disabled with setup guidance; local saved data and GitHub discovery remain usable.

Default endpoint is `OLLAMA_BASE_URL=http://127.0.0.1:11434`. To run an isolated server with project-local weights:

macOS/Linux, before `ollama serve`:

```sh
export OLLAMA_HOST=127.0.0.1:11435
export OLLAMA_MODELS="$PWD/data/ollama-models"
export OLLAMA_NO_CLOUD=1
ollama serve
```

PowerShell, before `ollama serve`:

```powershell
$env:OLLAMA_HOST = '127.0.0.1:11435'
$env:OLLAMA_MODELS = Join-Path $PWD 'data/ollama-models'
$env:OLLAMA_NO_CLOUD = '1'
ollama serve
```

Set the same host when running the pull command in another terminal; set `OLLAMA_BASE_URL=http://127.0.0.1:11435` in `.env.local`. An existing Ollama desktop app may already own the default port; do not kill or replace another user's runtime. Use another local port instead. Do not set Ollama to a public network bind.

Run `npm run probe:model` for actual cold/warm measurements of a short **synthetic feasibility task**, saved under the configurable cache directory. It explicitly unloads the selected local model first; don't run during another person's inference. It refuses remote hosts. Repeat with `GEMMA_MODEL=gemma3:1b` set in `.env.local` if installed. Record hardware, digest, context, timing and failures. A short probe is not the release quality evaluation or proof of operation on smaller machines.

## Optional remote Ollama

Keep BountyPilot and its SQLite database on your machine. Configure an existing trusted remote Ollama service behind a private network/access-controlled HTTPS gateway; **never expose the unauthenticated native Ollama port publicly**. This project does not build an authentication service.

Set `OLLAMA_BASE_URL=https://your-inference-host.example` and `OLLAMA_API_KEY=<server-side bearer key>` in `.env.local`. Do not put credentials in the URL, browser storage, Git or any NEXT_PUBLIC variable. The gateway must accept `Authorization: Bearer ...` and reject requests without valid credentials. Verify unauthenticated denial and authenticated `/api/tags`/`/api/chat` access with the operator before use. HTTPS certificate verification must stay enabled; no insecure TLS bypass or redirects are accepted. Only a base origin is supported, no custom path/query.

Remote mode is visible before Analyze. Clicking it sends the displayed bounded source excerpts and selected skills to that endpoint; generated results and personal saved pipeline stay in local SQLite. No automatic fallback from local to remote. Remote endpoint availability/privacy/cost belong to its operator; no live remote endpoint has been validated by this task unless recorded explicitly.

## Data, cache and artifact paths

All default paths are relative to the repository root; no username, machine binary or absolute development path is required. Start commands from that root. The developer task keeps all its generated files inside the workspace; an installed user's configuration may select another local data directory.

| Setting | Default / effect |
| --- | --- |
| `BOUNTYPILOT_DATA_DIR` | `data`; local SQLite default location |
| `DATABASE_PATH` | Optional specific local SQLite path, overriding data-directory default |
| `BOUNTYPILOT_CACHE_DIR` | `.cache`; measurement/test artifacts |
| `BOUNTYPILOT_LOG_DIR` | `data/logs`; operator/script log location; app logs go to stdout without content/secrets |
| `BOUNTYPILOT_BUILD_DIR` | `.next`; Next build/cache output |
| npm `cache` / `npm_config_cache` | `.cache/npm` via .npmrc; normal npm override supported |
| `OLLAMA_MODELS` | Ollama server's weight storage; set before starting that server |
| `TMPDIR` (macOS/Linux), `TEMP`/`TMP` (Windows) | Normal platform temp configuration for external tools |

Use user-controlled directories with correct permissions. Moving the database requires stopping the app and copying a clean checkpoint/backup; never delete it to solve an error. Do not commit SQLite/WAL/backups, credentials, weights, caches or private outputs. Custom locations inside the repo must be added to `.gitignore`. Stored personal data is plaintext, protected by OS permissions.

## Verification and known limits

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; run `npm run setup:browser` then `npm run test:e2e` after building. [Publication CI](https://github.com/RishavRajSingh44/BountyPilot/actions/runs/38957344507) passed all six jobs on Linux/macOS/Windows with Node 24.14.0 and 24.21.0: fresh installation, lint, types, 79 deterministic tests (12 opt-in cases skipped), build and dependency audit. Each 24.21.0 job also passed seven Chromium checks. These use synthetic outbound HTTP boundaries; interactive Ollama installation, local Gemma inference and hardware compatibility on Windows/Linux remain unverified. Native AI/hardware tests are separate opt-in checks, never GPU downloads in contributor CI.


Actual quality gate: Gemma 4B passed the prompt-v4 corpus with the limitations recorded in IMPLEMENTATION_PROGRESS.md. Gemma 1B returned actual responses but all 12 failed grounded citation validation, including an unsafe interpretation that was rejected. It is an experimental selectable option, not a proven usable replacement or low-memory guarantee. Secure remote Ollama remains the configurable option for a machine unable to run 4B; no live remote endpoint was tested.
