# BountyPilot — Test Strategy

Status: approved test plan, revised for portability October 16, 2026. Actual runs/results live in IMPLEMENTATION_PROGRESS.md; tests listed here are not automatically completed evidence. Scope and contracts: [PRD.md](PRD.md), [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Test design

Use Vitest for TypeScript domain/HTTP/storage integration tests and Playwright for browser journeys. Do not add pytest after removing Python. Test behavior at meaningful boundaries; do not write tests that merely mirror getters, markup choices or implementation details. Vitest supports the TypeScript-oriented runner workflow ([official guide](https://vitest.dev/guide/)); Playwright documents CI browser installation/reporting ([official CI guide](https://playwright.dev/docs/ci)).

Three distinct evidence levels:

1. **Deterministic CI:** synthetic GitHub/Ollama HTTP fixtures, real disposable SQLite files, fixed time. No internet/token/model dependency. Test on Linux, macOS and Windows CI using Node 24.14.0 and recommended Node 24; only completed runs count as platform evidence.
2. **Live integration gate:** actual public GitHub calls and installed local Gemma on recorded hardware. Explicitly invoked after setup and before release; never required on every contributor PR.
3. **Human review:** usefulness, payment interpretation, accessible keyboard flow, setup/demo clarity. An exact quote validator cannot establish that the model's conclusion is true.

Fixtures are synthetic by default, include null/unknown/extra provider fields, and never contain real credentials or copied full discussions. HTTP test doubles replace the outbound request boundary; domain logic/database stay real. A test mode is usable only in test runs/CI and must not turn production failures into fake opportunities or analyses.

## 2. Requirement traceability

| Requirement / features | Automated coverage | Live/manual release evidence |
| --- | --- | --- |
| FR01–FR02 / F02 | Query constraints, public/PR rejection, page bounds, quotas/incomplete mapping | A real public search with current links |
| FR03–FR04 / F03–F06 | Provenance/time/coverage, evidence negative/positive cases, score exactness | Inspect context and ranking explanation with user |
| FR05–FR07 / F07 | Schema and source/quote validation, prompt limits, unknown handling | Real Gemma corpus reviewed against labeled expectations |
| FR08 / F08–F09 | Idempotent save, local statuses, DB restart, constraints and limits | Save one actual issue and restart process |
| FR09 / F10–F11 | Failed refresh/retry/cancel doesn't overwrite; race and rollback tests | Offline/closed/missing model drills |
| FR10 / F09–F11 | Pipeline/detail served from DB without outbound requests | Reopen saved item with internet disabled |
| FR11 / F13 | Origin/Host/URL/body limits; token/client/log checks | Loopback endpoints, local model/cloud-disabled configuration or explicit remote-mode configuration |
| FR12 / F03–F06 | Same evidence state across result/detail/saved; page/context differences labeled | No implication of payment verification in core views |
| F01 | Health states and bounded probe | Actual machine setup readiness |
| F12 | Playwright role/name/focus/status assertions | Keyboard, 375 px viewport, zoom, contrast checks |
| F14 | CI/build/relative-link and release candidate checks | Clean install/setup reproduction and recording |

## 3. Unit and service checks

### GitHub boundary

- Compile preset, keywords, repository and language independently; reject injected qualifiers, unsupported operators, control characters, invalid number/path segments and overlong queries.
- Always enforce public/open/issue filters; defensively reject PRs and private repository detail before persistence.
- Validate normalized required fields; allow unknown additive provider fields; handle null body, missing author/association, unusual labels and decimal-string IDs.
- Page 1/39/40 with fixed 25-item page size, missing next link, zero results, provider total >1,000, rejected page 41, and `incomplete_results=true`.
- Anonymous/configured token; 401 redaction; quota 403/429, secondary limit/Retry-After, 404/410, moved redirect, 422, malformed JSON, network timeout and 5xx.
- Fetch destination fixed to GitHub; no redirect follows, arbitrary source URLs, tokens in response/errors or private bodies in logs.
- Cache key isolation, TTL/cap, no stale saved-state decoration; cooldown blocks retries until indicated time.
- Detail comment counts 0/1/99/100/101/199/200/201 and count changes mid-fetch; at most two comment-page calls, latest 100 retained in order, explicit omissions, failed page leaves prior DB snapshot unchanged.

### Evidence and ranking

- Payment label alone → signal; explicit supported fiat amount plus positive work/reward wording → claim, never verified; negative/withdrawn/already-claimed wording suppresses positive points.
- “Not paid,” “no bounty,” quoted sample amounts, ambiguous dollars, multiple amounts, cryptocurrency, missing amount, unrelated invoice text, sarcasm and non-English text: conservative result with source and limits, no financial guarantee.
- Exact excerpt membership/offset, source update and fetch timestamps, truncation markers and valid source IDs/URLs.
- Rank each part, empty skills, duplicate/case-normalized skills, phrase/token boundaries, no language-filter-only skill points, date thresholds/future timestamp, locked/assigned/closed/archived state, empty body, final clamp and deterministic ties.
- Ranking and evidence do not change when mocked model output promises payment; result/detail scoring differences are due to visible added evidence only.

### Inference orchestration

- Test default/configured loopback endpoints, installed 4B and 1B selection, no installed supported models, invalid model choice and provider unavailability. Discovery/save must not depend on AI readiness.
- Reject insecure remote HTTP, missing credentials, URL credentials/path/query, redirects and disabled TLS verification; test server-only Bearer handling and redacted 401/configuration errors. Live remote operation remains unverified without a real configured gateway.
- Verify paths resolve from configured user directories, not development-machine literals; test spaces in filesystem paths and Node 24.14/24.x. No RAM/GPU claim from mocked or CI tests.

- Prompt contains only bounded retrieved text and selected skills; excludes secrets, notes and filesystem data; omitted content reflected in analysis coverage.
- Structured schema enforces bounds/enums/strict keys; rejects fabricated source IDs, non-substring quotes, duplicate citation IDs and broken finding references.
- Empty/sparse source produces unknowns; substantive inputs require a valid citation; factual risk findings without valid references fail validation. Whether a quote actually supports the interpretation is assessed by the human evaluation corpus.
- Malicious issue/comment instructions cannot set endpoints, run tools, change evidence state or score, or output executable HTML into the DOM.
- One validation retry at most; overall 120 s deadline shared by attempts; no retry for missing/OOM/cancel/timeout. Model response read capped at 256 KiB.
- Correct model tag/digest and inference/prompt/source/skills cache key; cached result preserves original generation time; changed input invalidates reuse.
- One active request; concurrent request returns busy; abort/failure releases local guard in finally; upstream cancellation is separately measured live.
- Changed snapshot between start and commit produces conflict; prior success is untouched; database failure after inference does not report a saved success.

### SQLite/storage

- Create/migrate/reopen with a temporary file; migrate twice; reject newer user_version and roll back failed migration without resetting data.
- FK/CHECK/unique constraints; case-normalized issue identity; duplicate saves preserve status/timestamps; unsave idempotency; status persistence and ordering ties.
- Latest success preserves its own original source snapshot after detail refresh; a failed analysis cannot replace it.
- At most 500 saved and 500 unsaved; unsaved pruning cannot delete saved/current-detail rows; save limit produces clear failure.
- Close/reopen in another process and compare saved row/snapshot/analysis; don't prove persistence with only one in-memory connection.
- Simulate SQLITE_BUSY, write failure/full disk behavior via controlled failing boundary or read-only test database; never fill the user's disk to test it.
- Backup with server stopped; restore to a separate disposable path, integrity/FK check and compare saved-analysis data. Never overwrite the real pipeline to test restore.

## 4. Browser journeys

Use a dedicated test database and local GitHub/Ollama stub server, with outbound requests disabled except stubs. Backend and browser use the same production-facing schemas and domain modules. Keep tests serialized when they share a database; reset fixture data between cases. Avoid sleeps; wait on visible states/network completion.

| Scenario | Expected observation |
| --- | --- |
| Complete primary flow | Search → detail → Analyze → exact source citation and uncertainty → save → pipeline → reload; saved status/result retained |
| Restart persistence | Stop/restart test app against same disposable file; pipeline and successful analysis remain |
| Missing model | Actionable model setup; discovery/evidence/save still work; no fake AI response |
| Quota/offline | Retry time or connectivity error; cached saved detail clearly dated; pipeline works |
| Failed model/cancel | Error/cancel state, prior result retained, next analysis possible |
| Empty/incomplete search | Honest empty/partial warning, working filter editing and pagination |
| Changed/closed issue | Refresh shows state, stale analysis warning and original cited snapshot; no lost saved row |
| Unsafe content | Script/HTML/Markdown/image payloads visible as text; no execution, external image fetch or model-selected navigation |
| Cross-site request | Rejected mutations/reads according to Host/Origin/Fetch Metadata policy; no state change |
| Accessible core flow | Keyboard reachability, visible focus, labels, live status, no color-only claim meaning |
| Storage failure | Save button reports failure and keeps prior UI state; never optimistic permanent success |

P0 browser target is current Chromium on demo environment. Firefox/WebKit and other OSs are useful P1 expansion; state the actual tested matrix.

## 5. Small live Gemma evaluation

Create a frozen synthetic set of 12 source bundles after approval, with expected facts/unknowns/forbidden conclusions and source IDs. Include: clear scoped claim; label-only lead; withdrawn reward; conflicting amounts; no reward; assigned/closed issue; sparse requirements; long truncated discussion; malicious prompt injection; a quoted hypothetical payment; missing acceptance conditions; and ambiguous currency/external funding.

Run each once on the selected model/digest/settings, review manually, and rerun failures after a change. Temperature zero is not assumed to guarantee identical text. If switching to 1B, evaluate it explicitly instead of borrowing 4B results. Keep validated outputs and evaluation notes ignored locally; summarize measurements with anonymized/synthetic examples.

Release gates:

- 12/12 runs either yield a schema/citation-valid stored result or a clear safe error; **zero** unsupported payout guarantees or invalid persisted citations.
- At least 10/12 produce a useful result within the 120 s deadline, with correct core task summary and key case-specific unknowns as judged against the labels. Missing/OOM/timeout cases count as failures for usefulness.
- Withdrawal/conflict/prompt-injection cases must all avoid recommending an unqualified paid opportunity; any severe failure blocks release, even if the aggregate threshold passes.
- Record end-to-end and generation durations, cold vs warm, model/digest, hardware and context coverage. Warm target <60 s is a goal; report actual values including misses. Twelve samples are too small for production reliability claims.
- At least one **real GitHub issue** then completes search → actual local Gemma → evidence review → save → pipeline after process restart. Synthetic fixtures alone do not pass the MVP.

If quality fails: simplify prompt/output, reduce irrelevant context, reassess settings or explicitly select a feasible model, then rerun affected cases and final gate. Do not add RAG/fine-tuning or weaken evidence validation as a deadline shortcut.

## 6. Non-functional and manual checks

- Measure 20 saved-list/save/status operations at 500 synthetic saved items; p95 target below 200 ms on recorded hardware. Separate browser/network time from DB service timing.
- Record real uncached GitHub search/detail timing and cold/warm model timing; target budgets in PRD. Never performance-test GitHub with a request flood.
- Check keyboard-only journey, tab order, focus after errors, 200% zoom, 375 px layout and contrast against WCAG AA design intent. Avoid claiming a formal accessibility audit.
- Verify app and Ollama listen on loopback, cloud inference disabled, model present, fixed allowed endpoints, production CSP and no raw source rendering.
- Inspect production client bundle/config/network/logs for token leakage using a fake canary token in tests; never print an actual token.
- Clean install and documented local setup on the primary environment; use system fonts and project-local outputs. A second tester/setup is desirable and recorded only if performed.
- Review publication candidate for `.env.local`, SQLite/WAL/backups, weights, raw model outputs, caches and user data; all excluded. Source code and synthetic fixtures remain reviewable.

## 7. CI and release commands (to add after approval)

Plan one GitHub Actions workflow: checkout with minimal permissions; pinned Node runtime; `npm ci`; lint; typecheck; unit/integration tests; production build; Playwright Chromium setup and tests. Required scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. Name separate opt-in live model/GitHub probes clearly so CI never pulls weights or consumes contributor tokens.

Include an OS matrix (ubuntu-latest, macos-latest, windows-latest), Node 24.14.0 and 24.x, storage/path/configuration checks and production build. Chromium E2E runs at least on Linux, with other OSs enabled where reliable; GPU/model downloads are never CI requirements. CI configuration is not proof of a successful run. Use read-only workflow permissions, pinned reviewed action versions (prefer commit SHA), no `pull_request_target` execution of contributor code, and no model/token secrets in fork PR tests. Triage dependency audit findings; do not automatically upgrade major versions or suppress a critical exploitable finding to make CI green. Upload short-lived test reports only with synthetic data and no secrets. Keep branch protection/repository publication a separate user-authorized repository configuration step.

Each milestone report states actual command, result and skipped checks. Final release requires all implemented P0 checks passing, live journey/model evaluation, no unresolved critical/high security or data-loss findings, a successful restore drill, and accurate known limitations. Tests described here are planned work, not completed evidence.

## Implemented checks and evidence (October 16)

- `runtime.test.ts`, `inference.test.ts`: migration/rollback/reopen, configurable paths, Host/Origin, provider bounds/configuration/model detection and safe errors.
- `discovery.test.ts`: query restrictions, provider behavior/cache/quota, normalization, exact evidence, hypothetical/negative/conflicting payment language, score rules and cancellation propagation.
- `storage.test.ts`: discussion bounds/races, exact provenance, failed-refresh preservation, private/PR refusal, saved limits/pruning, API contracts and React-safe plain return objects.
- `analysis.test.ts`: exact quote/reference/schema checks, source budgets, bounded retry/cache/guard/cancel/timeout, refresh race, last-good preservation and cross-process analysis persistence.
- `recovery.test.ts`: 500-item operations, raw measured timings, checkpointed restore/integrity/FKs and analysis/status preservation. Also performed the separate stopped real-database restore described in IMPLEMENTATION_PROGRESS.md.
- Playwright `discovery.spec.ts` and `journey.spec.ts`: five production-browser checks, synthetic search/provider inputs with actual domain validation/SQLite, primary journey/status/reload/removal confirmation, responsive theme matrix, focus and loading/results/filtered-empty/quota states.
- `live-model.test.ts`: opt-in real Ollama corpus, separate DB and captured actual generation metadata. Default test runs skip its 12 cases; the actual 4B pass and 1B failures are separately recorded. Human semantic evaluation remains required.
- `scripts/record-demo.mjs`: assert-based actual live flow and local media capture, no mocked requests or external publication.

Actual counts/commands and remaining untested areas live in IMPLEMENTATION_PROGRESS.md. Screenshot capture is not by itself visual inspection or a formal accessibility audit. Native Windows/Linux/low-memory and live authenticated-remote checks remain unexecuted; CI configuration is not evidence of their success.
