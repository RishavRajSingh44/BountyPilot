# BountyPilot — Implementation Plan

Status: implementation approved October 16, 2026. Portability revision is authorized by the subsequent user instruction. Paths are relative to the project; actual status is in IMPLEMENTATION_PROGRESS.md.

## 1. Working agreement

The user has said **“Approve the plan. Start implementation.”** Execute M1–M6 in order, including the revised portability/configuration checks. At each milestone, run its relevant checks, fix failures, and report files changed, actual commands/results, any remaining blocker and the next milestone. Do not treat a fixture-only flow as completion of the real GitHub/local Gemma journey. Approval does not make optional P1/P2 work part of the MVP or authorize publication, messaging, purchases, or unrestricted filesystem changes.

The repository was empty on inspection, with no Git repository or reusable code. Nothing is installed, initialized, or scaffolded during planning. Before M1, check again for user-created files/instructions and preserve them. No existing data migration is needed today; future SQLite migrations still need safe behavior.

## 2. Scope reach and dependency map

| Change area | Must reach | What could break / be exposed |
| --- | --- | --- |
| Shared schemas | API handlers, forms, provider normalization, AI schema, fixtures/tests | Client/server drift or unvalidated provider/model input |
| GitHub client | Search, detail/refresh, readiness messaging, fixtures | Quota storms, leaked token, private content, silently incomplete evidence |
| Evidence/ranking | Cards, detail, saved views, prompt sources, tests | A paid signal misrepresented as verified funds; inconsistent score |
| Storage | Startup migrations, detail, analyses, save/status/remove, backup docs/tests | Lost pipeline, stale citations, destructive schema reset |
| Local AI | Health, analysis API/UI, schemas, eval fixtures, setup docs | Hardware failure, model hallucination, prompt injection, stuck busy state |
| Local security | All routes and server-rendered pages, Next headers, URL handling, tests | Cross-site access, DNS rebinding, XSS, SSRF, credential leakage |
| Delivery | Runtime pin, package lock, test configs, CI, README/license/contribution docs | Non-reproducible setup, outside-directory writes, misleading demo |

Critical path: **approval → M1 runtime/model feasibility → M2 real discovery → M3 evidence + durable pipeline → M4 grounded Gemma analysis → M5 integrated reliability → M6 demo and submission assets**. No background worker, external DB, OAuth app, paid provider account, or Python environment is on that path.

## 3. Milestones

Portability revision (October 16): keep the existing milestone order/deadline/P0 journey. M1 now includes one `InferenceProvider` interface and Ollama adapter, endpoint/path configuration, installed 4B/1B selector, safe missing-provider behavior, authenticated HTTPS remote configuration tests, cross-platform installation docs and Node 24.14/24.22 compatibility checks. M4 uses the selected installed model and shows local/remote disclosure. M5 adds Linux/macOS/Windows CI without model/GPU downloads. This replaces fixed-port/local-only provider assumptions, not the local app/SQLite architecture. Hardware reports are measurements of named test environments, never minimum requirements.

Estimates are engineering hours for one experienced developer, including milestone-specific tests. They are estimates rather than commitments. Total 26–36 focused hours plus 6–8 hours contingency (32–44 hours). A cold machine, failed hardware gate, long downloads or delayed approval can exceed the remaining challenge window. Do not claim a deadline can be met by omitting P0 safety or the required journey.

### M1 — Establish the local runtime and prove Gemma feasibility

- **Objective:** make the chosen runtime/storage viable and prove the selected local model can return a small schema-shaped response on the real demo machine.
- **Features:** minimal Next/TS/Tailwind shell and navigation; pin compatible patched dependencies/runtime; health view/API; Node SQLite transaction/migration smoke; local-only networking baseline; ignored local data; documented configuration; manual actual Gemma schema probe.
- **Files/modules:** `package.json`, `package-lock.json`, runtime pin, `tsconfig.json`, `next.config.ts`, lint/test configs, `src/proxy.ts`, `src/app/{layout,page,globals.css}`, `src/app/api/health/route.ts`, `src/lib/schemas.ts`, `src/lib/server/{db,security,ollama}.ts`, `migrations/001_initial.sql`, `.env.example`, `.gitignore`, `README.md`, baseline unit/integration fixtures/tests. Only create what the scaffold/runtime needs; no placeholder modules.
- **Dependencies:** explicit approval; usable Node/npm; user-controlled Ollama installation and model download; sufficient local resources. Keep project artifacts/cache under this directory where configurable. If prerequisites require writes outside it, stop that setup step and report the precise requirement.
- **Acceptance:** app serves on `127.0.0.1`; no secrets in browser output; health differentiates storage/Ollama/model failures; initial schema migration succeeds twice without reset; restart retains a sentinel record; actual 4B probe produces validated JSON or explicit 1B selection passes the same probe. Record Node/package/Ollama/model digest, hardware, cold/warm timing and actual disk/RAM observations. No blanket quality claim from this probe.
- **Automated tests:** storage migration/rollback/foreign-key round trip; health with ready/unavailable/missing model; Host/Origin rejection; one production build smoke. Tests use temporary database under project, never a real pipeline DB.
- **Risks/mitigations:** Node SQLite release-candidate compatibility → smoke test and documented single-driver fallback; hardware/OOM → smaller explicit model and rerun; network downloads → preflight early; outside-directory tooling caches → local configuration or report blocked prerequisite.
- **Effort:** 3–4 h, excluding large download/installation delays.
- **Exit evidence:** actual commands/results plus real model probe. If neither Gemma size meets feasibility, do not bury it until M4.

### M2 — Search and rank real public GitHub issues

- **Objective:** show useful live results with explicit signal and ranking limits.
- **Features:** constrained preset/keyword/repo/language query, optional local skills, one 25-item page at a time, bounded search cache, rate-limit/partial/empty/error states, score explanation and detail navigation. No inference or per-card comment fetching.
- **Files/modules:** `src/lib/server/{github,evidence,ranking}.ts`, shared schemas, `src/app/api/opportunities/route.ts`, `src/components/{SearchForm,OpportunityList,OpportunityCard,ReadinessNotice}.tsx`, discovery page, GitHub/ranking fixtures and tests.
- **Dependencies:** M1; public internet; optional public-read-only token. Anonymous search remains usable within quota.
- **Acceptance:** a real search returns current public issues and original links; no PRs/private data; filters compile into safe fixed qualifiers; skills are not sent as GitHub search terms; sorting is deterministic and explicitly page-local; incomplete results/quota/zero results visible; no mock fallback labeled live; saved-state decoration does not become stale in search cache.
- **Automated tests:** query compiler injection/bounds, provider normalization, fixed-size page-40 1,000-result boundary, 403/429/401/422/timeout mapping, cache TTL/cap, all ranking branches and ties, discovery browser smoke with HTTP fixtures.
- **Risks/mitigations:** sparse paid leads → multiple honest presets and narrow filters; quota → explicit submit/cache/header-aware cooldown; misleading ranking → visible points and no payout probability; changing GitHub schemas → validate required fields and ignore unrelated additive fields.
- **Effort:** 5–7 h.
- **Exit evidence:** redacted real request/result summary and automated checks.

### M3 — Inspect evidence and persist the saved pipeline

- **Objective:** complete real search → detail → evidence review → save → durable pipeline before adding model complexity.
- **Features:** current issue/repository/recent bounded comments; immutable source IDs and snapshot hash; exact payment snippets and uncertainty; coverage notices; refresh; idempotent save/unsave; local status changes; offline saved detail/list; last-good-data preservation.
- **Files/modules:** detail page and `EvidencePanel`, `OpportunityDetail`, `SaveButton`, `PipelineList`; `src/app/pipeline/page.tsx`; `src/app/api/opportunities/refresh/route.ts`, detail GET, saved GET/PUT/PATCH/DELETE routes; database/evidence/GitHub schemas/functions; storage/evidence fixtures/tests. Initial schema is already versioned in M1; add a new migration only if necessary, never silently edit a released schema.
- **Dependencies:** M1 storage and M2 identity/provider normalization.
- **Acceptance:** current state/assignment and source provenance displayed; negative/withdrawn/ambiguous rewards never become verified payment; source coverage and omitted comments clear; save twice yields one row; status and saved snapshot survive process restart; offline reopening works; unsave affects only local state; 501st save fails safely; failed refresh leaves prior snapshot intact.
- **Automated tests:** source exactness/provenance and negative/conflicting wording; last-comment-page edge cases/count races; transaction/upsert/FK tests; unsaved eviction excludes saved/current rows; all saved API contracts; browser journey through reload; process-restart persistence check with a disposable DB.
- **Risks/mitigations:** stale claims or missed withdrawal → latest bounded comments + visible omissions + verify-before-work questions; data loss → transactional writes and backup check; source churn → immutable analysis-ready snapshots, hashes and failed-fetch preservation.
- **Effort:** 4–5 h.
- **Exit evidence:** real saved issue after restart and passing persistence/evidence checks.

### M4 — Add grounded local Gemma analysis

- **Objective:** complete the mandatory journey with actual local inference and useful uncertainty.
- **Features:** bounded prompt construction, structured-output schema, exact quote/source validation, model metadata, unknowns/questions/risks, one active request, cancel/deadline, one bounded validation retry, last successful result reuse, stale-result handling and persistence.
- **Files/modules:** `src/lib/server/analysis.ts`, `ollama.ts`, shared model schema and evidence helpers; analyze route; `AnalysisPanel`; detail/pipeline analysis presentation; synthetic AI fixtures/evaluation corpus; model setup/evaluation notes in project docs after approval.
- **Dependencies:** M1 model feasibility; M3 source snapshots/persistence; no Python/SDK/agent framework dependency.
- **Acceptance:** actual local Gemma response on a real GitHub issue, with model digest and citations; score/payment state are unchanged by model assertions; unsupported source/quote rejects the whole result; no cloud fallback; failure/cancel preserves last success; refresh during inference cannot commit stale results as current; warm timing and quality gates measured on selected hardware/model.
- **Automated tests:** prompt/source budget and coverage, model schema/extra-field bounds, invalid quote/source/ref, injection payloads, context overflow, timeout/cancel/busy-release, retry ceiling and overall deadline, cache identity, refresh race, persistence atomicity; browser fixture journey covering analysis/evidence/save.
- **Live evaluation:** run the small frozen corpus in [TEST_STRATEGY.md](TEST_STRATEGY.md) and one complete live journey. Record actual usefulness, safety and timing, with no claim that temperature zero guarantees identical text.
- **Risks/mitigations:** slow/weak 1B model → short prompts and explicit limits, same evaluation gate; hallucinations → validation + labeled interpretation + human evidence review; process restart → no durable job promise; cancellation backend lag → test/report real resource release behavior.
- **Effort:** 6–8 h.
- **Exit evidence:** real local full journey and saved source-backed analysis after restart.

### M5 — Verify the integrated release and harden recovery

- **Objective:** finish cross-feature checks, not defer trust-boundary validation until the end.
- **Features:** final accessible/error states, source/link/body limits, production CSP and local host policy, restore drill, runtime/build consistency, CI checks, documented known limitations and reproducible local setup.
- **Files/modules:** only modules revealed by failed checks; `tests/e2e/*`, `tests/integration/*`, `playwright.config.ts`, `.github/workflows/ci.yml`, `.env.example`, README/security/setup guidance, backup instructions.
- **Dependencies:** M1–M4 integrated; actual demo hardware and browser; no live GitHub/model in required CI.
- **Acceptance:** no unresolved critical/high trust-boundary or data-loss defect; P0/FR traceability complete; clean install/build succeeds; fixture E2E and key manual failure drills pass; saved read/write latency checked at 500 items; backup restore integrity/FK and saved-analysis data verified; core keyboard/mobile/contrast checks complete.
- **Automated tests:** full required unit/integration suite, production build, Chromium primary flow and failures, configured dependency audit; rerun only affected checks while fixing, then final complete gate. Firefox/WebKit matrix remains P1 unless time/resources support it.
- **Risks/mitigations:** CI package/browser downloads → pin tool versions and cache lockfile-based installs; hidden shared state → disposable DB per worker, serial storage E2E; unsafe demo exposure → loopback binding and video delivery; filesystem constraint → keep output/caches project-local or document unmet external prerequisite.
- **Effort:** 4–6 h.
- **Exit evidence:** release check results and explicit untested areas, no unqualified “all tests pass” if a check was skipped.

### M6 — Package the open-source demo and submission material

- **Objective:** make the work understandable, reproducible, and ready for the Side Hustle challenge.
- **Features:** license/notices, contribution/security guidance, short recorded full journey, architecture/model evidence, honest cost/latency/quality limits, write-up draft and one potential-user observation if available.
- **Files/modules:** `README.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, minimal issue/PR guidance if useful, ignored demo media/output paths, submission notes/docs. Do not create redundant governance files or publish anything automatically.
- **Dependencies:** M5 release gate; real fresh issue for recording; user consent for testimonial/identifiable feedback; official current challenge instructions.
- **Acceptance:** demo shows live source provenance, actual Gemma model, uncertainty review, save and persistent pipeline; setup reproduced; no secrets/local DB/weights in publication candidate; write-up covers a paying user hypothesis and open innovation with measured facts; submission template/tags/deadline verified; any changes after the deadline are labeled per challenge requirements.
- **Automated tests:** one release smoke after final code changes, secret/ignored-file review of publication candidate, Markdown relative links; no new app testing for prose-only edits.
- **Risks/mitigations:** thin write-up → reserve this milestone; no user feedback → state unvalidated demand; unstable internet → record early, show capture time and distinguish replay from live; approval delay → cut P1/P2 and optional polish, preserve P0.
- **Effort:** 4–6 h.
- **Exit evidence:** ready-to-review assets and release checklist. Publishing the repository/post or contacting testers is a separate action requiring the user's instruction.

## 4. Deadline-oriented execution

If approved on October 16: target M1–M2 on October 16, M3–M4 by late October 17, and M5–M6 on October 18. Internal release/submission-material target: **October 18, 20:00 IST**. Exact official timing is in [HACKTOBERFEST_STRATEGY.md](HACKTOBERFEST_STRATEGY.md). This is an aggressive schedule; the 32–44 h range may not fit ordinary workdays.

Protect the critical path by omitting P1/P2 entirely, using cross-platform native setup and a video rather than production hosting, limiting discovery to one provider/page, using one model/schema, and using a list with native status select rather than drag-and-drop. If fewer hours remain, report a revised forecast. Do not replace real inference/search with canned responses to claim completion, remove evidence/security checks, or declare incomplete work done.

After a failed milestone gate: fix the root cause and rerun affected tests. If a model/hardware/prerequisite issue cannot be resolved within scope, explain the specific blocker and its effect on the deadline. Continue independent authorized work only when it does not hide that blocker or violate the approval/directory boundary.

## 5. Ponytail FULL review and revisions

### Actual installed capabilities used

Read `installed ponytail/SKILL.md (5.2.0)` from disk. It defines behavioral engineering guidance: inspect scope/callers, reuse existing/platform facilities, minimize dependencies, finish affected callers/tests/config, preserve validation/error handling/security/accessibility, test non-trivial logic, label known shortcuts, and end reports with skipped checks/risks. Documented levels are lite/full/ultra, with `/ponytail lite|full|ultra` as level selection. FULL is active.

It is **not** an installed architecture analyzer, test runner, agent harness, security scanner, or automatic scoring command. The session catalog separately advertises `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain` and `ponytail-help`; these are separate skills, not capabilities silently executed by the base skill. No fabricated command, benchmark, audit score, or automated security certification is claimed. This is a documented-guidance review performed directly on the plan. No sub-agents were requested or needed.

### Findings applied to the final design

| Concern | Finding | Revision / retained safeguard |
| --- | --- | --- |
| Overengineering | Python backend only forwards HTTP to Ollama | Remove FastAPI, SQLAlchemy and pytest; one TypeScript app |
| Repeated functionality | Parallel TS/Python models, SDK wrappers, model JSON schemas | Shared Zod model/API shapes; derive JSON Schema; direct platform fetch |
| Database abstraction | Three small local entities do not require ORM/repository layers | Prepared SQL, three tables, one DB module; retain migrations/FK/backup |
| Infrastructure cost | Queues/Redis/vector DB/cloud hosting do not enable required flow | One bounded synchronous request and local persistence; no background system |
| UI bloat | Kanban drag/drop, accounts and chat consume demo time | Search/detail/list pipeline and native accessible controls |
| False payment trust | AI or a bounty label could be mistaken for funding proof | Deterministic evidence labels, exact quotes, payer/terms checklist, no settlement claim |
| Poor boundaries | Model could affect ranking/payment or select fetch URLs | Pure ranking/evidence modules; model only supplies bounded interpretation |
| Hidden maintenance | Native DB addon, SDK churn and unnecessary provider registries | Prefer Node SQLite, one required inference interface and one Ollama adapter; fallback driver only for actual compatibility failure |
| Runtime risk | Built-in SQLite release-candidate status and model hardware fit are not proven | Put runtime transaction/model probe in M1; document fallback and hardware gate |
| Data loss | Refresh/retry may overwrite good evidence/analysis | Atomic success-only updates; preserved analysis snapshot; refresh-race test |
| Security | Local apps are still vulnerable to cross-site requests and untrusted text | Host/Origin checks from M1; no arbitrary outbound URL, tools, raw HTML or secrets in client |
| Missing tests | Mocked happy flow cannot validate real Gemma or restart durability | Separate deterministic CI, live corpus gate, real full journey and restore drill |
| Unrealistic scope | Full SaaS within remaining challenge window is implausible | All hosting/auth/billing/additional sources deferred; explicit 32–44 h range |
| Open-source claims | App license does not license Gemma weights or public issue content | Separate notices/terms, attributed minimal excerpts, no weights/raw dataset in repo |

Known limits to preserve in eventual code where applicable: one trusted local user/process, page-local ranking, bounded discussion/model context, heuristic payment extraction, and process-local inference coordination. Use the documented format `shortcut: <limit>, <when to upgrade>` on code whose limit is otherwise easy to miss; do not add repetitive comments to every line.

Review result: the smallest complete design is one local app, three SQLite tables, one provider, one configurable Ollama integration with installed 4B/1B selection, and a visible-evidence workflow. Validation, persistence, accessibility, and honest uncertainty remain P0.

## 6. Approval checkpoint and exact first work

The exact first implementation milestone is **M1 — Establish the local runtime and prove Gemma feasibility**, 3–4 focused hours plus any model installation/download time. Begin by rechecking this directory, pinning a patched compatible Node/Next toolchain, adding the minimal shell/health/storage schema, and proving one actual local Gemma structured response. It does not include building search, a Python server, or optional infrastructure.

Approval received. Resume M1 with the portability revision below; publish nothing without further authorization.


## UI extension accepted during implementation

The user's premium UI request is specified in UI_DESIGN.md. Apply it to P0 screens with shared tokens/components, without financial features or a new backend. Keep `/` for discovery, add read-only Overview/Settings, and embed analysis in detail. Status filtering and removal confirmation use existing storage APIs. Notes, Kanban and persisted profiles remain deferred. Visual QA adds 30 screenshots and keyboard checks. Gemma 1B stays explicitly experimental after its actual failed quality evaluation; the preferred 4B remains the demonstrated P0 path. These revisions preserve the dependency order and deadline.
