# Implementation progress

Implementation approved October 16, 2026. Ponytail FULL is active. No push, deployment, publication, or submission is authorized.

## M1 — Local runtime and Gemma feasibility (verified October 16)

- Initial repository: only the five approved planning documents; no Git metadata, application or data.
- Active Node: 22.9.0 / npm 10.8.3. Additional installed Node: 24.14.0; built-in SQLite smoke succeeded with SQLite 3.51.2, but runtime is below the approved minimum.
- Official release index identifies Node 24.22.0 (October 14, 2026); project-local download/checksum verification in progress. No global runtime modification.
- Hardware: macOS arm64, Mac16,8 / Apple M4 Pro, 12 CPUs, 51,539,607,552 bytes RAM (48 GiB), approximately 79 GiB available disk. Free RAM is transient; initial Node observation was about 10.2 GiB.
- Ollama 0.23.2 installed, initially stopped. Started loopback-only with cloud disabled, project-local weights/logs/temp. Server reports 37.4 GiB Metal capacity. Existing Ollama identity was read, not replaced.
- Model directory initially empty. Explicit Gemma 3 4B download started. No inference timings or quality results exist yet.
- Added minimal Next shell, shared readiness types, local security boundary, versioned SQLite schema and test configuration. Installation/tests pending.

### Verified exit results

- Official Node 24.22.0 and Ollama 0.40.5 archives were checksum-verified and used from ignored project-local storage. Product source/docs do not require these machine-specific binaries; normal installed Node/Ollama work through configuration.
- `npm test`: **18 passed** on macOS arm64 with both Node 24.14.0 and 24.22.0. Includes migration/rollback/FK checks, persistence reopened in a separate Node process, paths containing spaces, Host/Origin boundary, provider configuration, remote authentication/error redaction, bounded response reads and model enumeration.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed on both Node versions with the installed lockfile. SQLite emits an experimental warning on 24.14; the API works in these tests. Recommended version remains the current patched 24.22.
- Webpack production build selected after Turbopack's CSS worker failed to bind a port, including an escalated retry. npm dependency audit after the compatible lint-tool install: **0 vulnerabilities reported** (213 packages at lockfile refresh); no forced peer/version bypass.
- Running production smoke: health 200/storage ready/Ollama ready; page 200 with both installed models and nonce CSP; raw invalid Host request 403. Node fetch ignored the fake Host header in the first test; corrected raw HTTP/curl test passed. No Host bug was found in the app.
- Added Linux/macOS/Windows × Node 24.14/24.x CI configuration. **Not run remotely**: no push is authorized. No Windows/Linux/native low-memory or real remote-provider compatibility is claimed.

### Actual model feasibility measurements

Ollama 0.40.5, Apple M4 Pro / 12 CPU / 48 GiB RAM, macOS arm64, temperature 0, context setting 8192, output cap 1200. One cold run (explicit model unload first) and one warm run each of a short synthetic CSV-parser summarization task; **not** an opportunity, quality evaluation or repeat-sample benchmark. Times are end-to-end as measured by the probe.

| Model / digest prefix | Cold | Warm | Prompt/generated tokens | Generation rate cold/warm | Reported residency |
| --- | --- | --- | --- | --- | --- |
| gemma3:4b / 68ceab7e468a | 2.917 s | 0.464 s | 61 / 27 | 62.79 / 65.38 tokens/s | 2,491,909,405 bytes |
| gemma3:1b / 97558784bdc9 | 1.491 s | 0.423 s | 59 / 57 | 144.10 / 144.31 tokens/s | 957,916,118 bytes |

Both returned schema-valid summaries and `funding:null`; 1B embellished the requested scope and described absent funding as “without seeking external funding.” That is a quality limitation, not an approved conclusion. M4's grounded evaluation must address this; these simple feasibility assertions are not release quality approval. Model residency reported by `/api/ps` is **not peak process memory or a RAM minimum**. Both measurements used this same 48 GiB machine; lower-memory hardware remains untested. Raw measurement files/digests are in ignored configurable cache storage.

M1 committed locally as `08e336d`. Publication remains unauthorized.

## M2 — Discovery and ranking (verified October 16)

- Added constrained public/open GitHub issue search, 25-item upstream pagination, deterministic score/evidence explanations, quota cooldown, bounded retry/cache and accessible results/filter UI. No model is called for discovery.
- Actual app request on loopback dev port 3001 returned HTTP 200 in 2,452 ms (including development compilation), provider count 81,246, `incomplete_results=false`; source records came from GitHub, not fixtures. One returned source was `https://github.com/oll4com/spaceapp/issues/60`. Its source text is a claim, not evidence of funding/settlement.
- Current unit/integration suite: 43 passed. A test caught “No compensation information” being treated as a signal; fixed the parser to preserve unknown status and exact quote offsets. Added differing-amount conflict handling. Typecheck and lint passed after fixing a fixture's overly narrow input type.
- Read Next 16.4's generated AGENTS.md and relevant installed route/proxy/type/data docs. Corrected clean-checkout type generation before tsc, and stopped tracking generated next-env.d.ts as the installed docs require. No new Next behavior is assumed from older versions.
- Verified actual browser search with real GitHub results, source links and warnings. Automated Chromium UI checks: **2 passed** (synthetic API fixtures, no provider/model requirement); they cover search with AI unavailable, score disclosure, quota/retry guidance and editable filters. Separate provider unit tests exercise real domain code with HTTP mocks.
- `npm run typecheck`, `npm run lint`, `npm test` (43 passed), `npm run build` passed with Node 24.22. Browser artifacts/browser binaries stay in configurable ignored cache directories. Ready for local M2 commit; M3 adds detail and saved persistence.

## Remaining milestones

### Portability review requested October 16

- Retained one Next app and local SQLite. Added only the requested small inference interface with one Ollama adapter, configurable loopback/optional secured remote origin and supported installed Gemma model enumeration.
- Replaced fixed developer runtime/port assumptions with environment configuration; current development-only .env.local selects another loopback port and is ignored. Public docs use OS-neutral commands and explicit macOS/Linux/PowerShell examples.
- Corrected Node minimum rationale: installed Next requires >=20.9, Vitest requires ^22.12/^24/>=26; Node 22.9 is unsuitable. The SQLite API smoke and initial eight tests/typecheck passed with Node 24.14; recommended 24.22 is checksum-verified. Revised suite/build still pending on both; no Windows/Linux or low-memory test has run.
- Five audit reports were in the Next lint preset's development-only glob chain. Removing the preset produced zero reports at that point; compatible standalone lint dependencies are being installed. No forced downgrade/peer bypass used.
- Gemma pull on installed Ollama 0.23.2 failed with registry HTTP 412 (newer runtime required). Official Ollama 0.40.5 archive digest verified; isolated server and actual inference remain pending. Earlier start commands conflicted with a supervised older runtime, which is now left alone.
- No timings/benchmark numbers have been measured yet. Cross-platform CI and smaller-memory hardware remain targets, not claimed evidence.

M2 discovery/ranking; M3 evidence/pipeline; M4 grounded Gemma; M5 reliability/CI; M6 demo/source documentation. All pending verified M1 exit.
