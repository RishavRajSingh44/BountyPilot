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
- `npm run typecheck`, `npm run lint`, `npm test` (43 passed), `npm run build` passed with Node 24.22. Browser artifacts/browser binaries stay in configurable ignored cache directories. M2 committed locally as `126da4c`; M3 adds detail and saved persistence.

## M3 — Evidence and durable pipeline (verified October 16)

- Added bounded real repository/issue/latest-comment retrieval, exact source provenance, coverage warnings, stable snapshot hashes, explicit refresh, atomic storage, idempotent save/status/remove and offline pipeline/detail reads. Saved items are never evicted; unsaved snapshots are capped at 500.
- `npm test`: **56 passed**. New tests cover comment counts/races, Unicode storage budget, failed-refresh preservation, private/PR rejection, snapshot transactions, save limits and safe pruning. A failed eviction test exposed a duplicate identity in its fixture; corrected the fixture and reran successfully.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed. Production Chromium discovery checks: **2 passed**; listener startup first failed under sandbox, then passed with the permitted loopback test server.
- Initial real detail attempt was rate limited; retry after GitHub's reset succeeded. Actual issue `oll4com/spaceapp#60`, GitHub ID `5878908647`, title “[$400] Test every Temporal workflow on a real time-skipping test server and gate replay determinism in CI”: seven reported/seven retrieved comments, ten source records, no reported truncation, payment evidence **conflicting**. Earlier search title differed; current source is authoritative only as a retrieved claim, never funding verification.
- Saved that actual issue locally. Restarted the application process and compared the complete `/api/saved` response byte-for-byte: identical. No data reset or replacement used.

## UI design extension (October 16)

- Read current frontend and approved documents before writing `UI_DESIGN.md`; specification now defines tokens, navigation, responsive layout, accessibility, states, honest data boundaries and implementation order.
- User-requested Geist/Lucide and selected shadcn primitive dependencies installed into the project: 30 packages added, npm audit reported zero vulnerabilities at that point. No component catalog or new backend service.
- UI implementation and screenshot QA pending. Earnings, notes and Kanban remain outside P0; no fabricated metrics or nonworking controls will populate the screens.

## Remaining milestones

M4 grounded Gemma analysis; M5 integrated reliability/visual QA/CI; M6 demo and open-source documentation. Windows/Linux, low-memory hardware and remote secured Ollama remain untested. No push, deployment or submission authorized.

## M4 and premium UI — verified October 16

- Implemented the design specification using a shared dark/light shell, local Geist fonts, Lucide icons and selected shadcn/Radix button/confirmation primitives. Discover, Overview, Pipeline, Settings and evidence/analysis detail use real application state. Evidence filtering and sorting explicitly apply to the fetched page. Earnings, notes and Kanban are not fabricated or added to P0.
- Added bounded Gemma orchestration: 16,000 source characters maximum with conservative Unicode weighting, strict JSON schema and dynamic source-ID enum, exact quote/citation-reference checks, one active request, 120-second total deadline, one validation retry, input/digest/prompt-aware result reuse, atomic source-race check and preserved last-good result. Model interpretation cannot change ranking or payment state.
- Real initial model attempts failed because of invented/repeated citation IDs, edited quotes and missing risk references. They were rejected without persistence. Prompt v3 uses short numbered citations, actual source enums, bounded validation feedback and fewer source-backed risks. No fallback analysis was invented.
- Frozen 12-case **actual Gemma 4B** evaluation: 12 schema/citation-valid results, all on first attempt with prompt v3. End-to-end service times 3,431–5,670 ms, median 4,562.5 ms; reported generation times 2,572.753–4,810.175 ms; load times 0.466–0.718 ms (resident/warm model). Same M4 Pro/48 GiB/macOS environment and recorded 4B digest. No cold-run or low-memory claim from this corpus.
- Manual corpus assessment: 10/12 useful against the frozen expectations. Closed/assigned case omitted explicit closure/assignment in its generated explanation; truncated case cited an unrelated styling sentence for a coverage risk. Both core summaries were correct; explicit state/coverage and source warnings remain in the deterministic UI. Other cases surfaced the task and key unknowns. Withdrawal/conflict/injection cases did not recommend unqualified paid work. Exact quotes do not prove semantic support; skills also tended to echo the supplied profile. This small set is not production reliability evidence.
- **Actual Gemma 1B:** 0/12 usable validated results; all 12 safely rejected after the bounded retry. One rejected injection response treated malicious instructions as requirements. It remains selectable as an explicitly experimental lightweight option with the failed quality gate disclosed; 4B is preferred. No successful grounded-analysis or lower-memory claim for 1B.
- Actual real issue #60 completed analysis through the application API (19,219 ms, prompt v2), then the redesigned browser UI. Cancel preserved its prior result; subsequent actual 4B v3 analysis completed in 4,520 ms. Restarted into the production build: saved row and v3 analysis persisted; source staleness false. Browser cancellation was observed; immediate complete GPU resource release was not independently measured.
- Current deterministic suite: **73 passed**, 12 opt-in live tests skipped in ordinary runs (run separately above). Lint, typecheck and production build passed. Chromium UI suite: **4 passed**, including synthetic complete flow with real validation/SQLite, status/reload, accessible confirmation focus/Escape, skip link and 30 screenshots (5 views × 3 viewports × 2 themes).
- Browser checks caught SQLite's null-prototype rows crossing the server/client boundary. Fixed shared saved-row/list return values and added a regression assertion. Screenshot inspection caught analysis section spacing overridden by a CSS reset; removed that conflict. Initial six screenshots inspected directly; final complete screenshot review continues in M5. A stale in-app tab failed to connect; a fresh preview tab successfully verified the real live UI.
- Tightened hypothetical reward extraction so a conditional sponsor quote remains a signal, not a concrete claim; added regression coverage. Preserved source creation timestamps when supplied; older snapshots keep unknown creation time. Disabled development request-URL logging using installed Next configuration.

M4/UI ready for local commit. M5 recovery/performance and final review are in progress; M6 packaging/demo remains.

## M5 — Integrated reliability, compatibility and visual QA (verified October 16)

- M4/UI committed locally as `a411e80`. Applied the installed Ponytail review and audit guidance directly; findings, expected load, fixes and limits are in QUALITY_REVIEW.md. Fixed upstream search cancellation and the real model-picker accessible-name defect. No unresolved critical/high finding from this scoped review; no formal security certification claimed.
- Clean `npm ci --offline` restored the exact lockfile (237 installed packages, 238 audited); fresh online `npm audit --audit-level=high`: **0 vulnerabilities reported**. No forced peer/engine workaround. Optional fsevents install-script warning remains; the tested install/build/runtime did not require approving that script.
- Node 24.22: lint/typecheck, **74 deterministic tests**, production build passed after the review fixes. Ordinary runs deliberately skip 12 live tests; actual model evaluation is recorded under M4. Node 24.14 also passed lint/typecheck/73 then-current tests/build with the installed UI dependencies; SQLite emits its experimental warning. The last added test checks cancellation propagation. Both runtimes were tested on this same Mac, not other platforms.
- Final production Chromium suite: **5 passed**. Covers search without Ollama, quota/retry, synthetic full journey using real validation/SQLite, status/reload, confirmed removal and resave on disposable data, dialog safe focus/Escape/return, skip link, evidence filters/sort and async/empty/error feedback. One earlier browser run overlapped a compatibility build, replacing active assets; sequential rerun passed. Build and browser checks are now sequenced.
- 35 actual automated QA screenshots under `.cache/visual`: 30 screen/theme/viewport combinations plus loading, results, filtered empty, quota error and confirmation. Directly inspected desktop/tablet/mobile samples in both themes and all five extra state captures. Corrected analysis section spacing, mobile stat alignment and narrow-form stacking. Automated checks found no document overflow at 1440×1000, 834×1112 and 390×844. Keyboard focus and semantic tokens checked; no formal WCAG audit or native 200% browser-zoom result claimed.
- At 500 synthetic saved items, 20 combined SQLite list/idempotent-save/status operations: measured p95 **2.752 ms** with Node 24.22 on the recorded Mac (service timing, not browser/network). Raw samples in `.cache/storage-performance.json`. Passed disposable checkpointed backup/restore, integrity and FK checks, with saved analysis/status intact.
- Also stopped the real app, copied its database and surviving WAL into a separate `.cache/live-restore` directory, compared all three tables with the original, and checked integrity/FKs: identical, one saved row and one successful analysis at that time. Original pipeline was never reset or overwritten.
- CI now configures Linux/macOS/Windows × Node 24.14/24.x unit/build checks, audit, plus Chromium on 24.x with Linux browser system dependencies. **Not run remotely**; no push is authorized. No native Windows/Linux, low-memory, live secured-remote or complete GPU-release claim.

M5 ready for local commit. M6 local demo assets and open-source packaging are in progress.

## Release follow-up checks — October 16

- M5 committed locally as `1013057`. During the real recording, GitHub's anonymous core budget was exhausted (0 remaining, reset 16:26:29 IST), while search had its separate budget. No repeated core requests were made before reset. Fixed the overly broad primary cooldown, retained shared secondary backoff, and added a regression.
- Found that prompt metadata described retrieval coverage without explicitly describing the smaller AI excerpt set. Added the already-computed AI coverage/omission metadata and bumped prompt to **v4**. Added a regression and a measured prompt-token pressure guard, with previous-result preservation and no retry on context pressure. This did not add another provider or backend.
- Actual 4B v4 rerun: **12/12 valid on first attempt**, manually **11/12 useful**. The truncated-discussion case now cites its explicit missing-terms sentence. Closed/assigned explanation still omits explicit closure/assignment; deterministic detail state/warnings remain authoritative. Generic/profile-echo skill suggestions remain estimates. No unsupported payout guarantee in this evaluated set.
- Actual v4 service times: 4,111–7,276 ms, median 4,606 ms. First sample reported 2,342.843 ms model loading (not an explicit controlled unload/cold benchmark); actual prompt counts 552–1,329. Raw files `.cache/model-eval-hC8O5B`. Same recorded 4B digest/hardware/settings. These synthetic timings are not a prediction for longer issues or smaller machines.
- Retested actual 1B with final v4 prompt: **0/12 validated**, all safely rejected after at most one retry. Malicious instructions again contaminated its rejected interpretation. Raw files `.cache/model-eval-ggHdlC`. No failed result was persisted as successful, and 1B remains experimental.
- Current-source release commands on **both Node 24.14 and 24.22**: lint, typecheck, **77 deterministic tests**, production build passed. Twelve opt-in tests are skipped in ordinary runs and were separately executed as described. Logs `.cache/release-node24.14.log` and `.cache/release-node24.22.log`.
- Further inspected the entire screen/theme/viewport matrix and all five additional state images. Removed empty feedback spacing and made result metadata more compact. New browser check covers stored pipeline/analysis while the provider is unavailable. Updated license/package metadata and prepared contribution/security/submission documents. Publication candidate scan found no committed/staged credentials, databases, model weights or developer-specific paths; relative Markdown links checked successfully.

M6 live recording still awaits the provider's indicated reset; failed attempts are retained locally as failures and are not passed off as a completed demo.

## M6 — Local demo and open-source package (October 16)

- Added MIT LICENSE/package metadata, THIRD_PARTY_NOTICES, CONTRIBUTING, SECURITY, expanded README setup/backup/live-evaluation instructions, and an unpublished SUBMISSION_DRAFT. Rechecked the official challenge and template link/tags on October 16; editor sign-in, user eligibility and actual publication remain for the owner. No customer interview, testimonial, revenue or payout is invented.
- Added and actually ran `scripts/record-demo.mjs`, with assertions and no mocked requests. First recording attempt exposed a navigation synchronization bug in the script; fixed it. The next encountered GitHub's real core quota; respected its indicated reset before retrying. Failed runs remain local failures, not claimed demos.
- Successful recording: **2026-10-16 11:04:37–11:04:56 UTC** (16:34:37–16:34:56 IST), real `oll4com/spaceapp#61`, GitHub ID `5878909492`, title “[$600] Export worker and workflow spans over OTLP: one trace from API request to every Temporal activity”. Searched live GitHub → retrieved issue/repository/nine comments → actual local Gemma 4B v4 → inspected exact citations/uncertainty → saved → Pipeline reload. All nine reported comments retrieved; 12 source records; no retrieval truncation. AI saw 11,514 characters across 17 excerpt records and explicitly reported shortened/omitted input.
- Actual real inference: **12,147 ms**, model digest `68ceab7e468a31c988b44d5a4984a0e21f58c4f7158c6ce29c1804babac38df7`. Task summary/suggestions reflect OTLP worker/workflow tracing; funding remains unconfirmed. Its citation exactly matches a retrieved title. Questions included another contributor's US-payment context, so they still require human interpretation. Detailed evidence is conflicting because source text contains changed historical reward amounts; neither the title nor analysis proves available funds or payment.
- Captured and inspected actual discovery, detail/analysis, Pipeline and Overview screenshots under `.cache/demo`; successful video identified by `capture.json`. Source-backed data remains private local runtime data. The Overview counter label was clarified to “Claims without conflicts” after recording so it describes the counted evidence state accurately; refreshed screenshot uses the final label. No source data changed for that wording adjustment.
- Final checks: **77 deterministic tests**, lint/typecheck and production builds passed; six production Chromium checks passed, with 35 refreshed QA screenshots and four real-data captures. Both Node 24.14 and 24.22 builds passed, including the contrast token change; Node 24.14 retains its SQLite warning. Production raw HTTP checks passed for invalid Host/cross-site reads/foreign writes (403), malformed JSON (400), oversized body (413), and nonce CSP without production unsafe-eval (200).
- Six color-token contrast assertions passed. Interactive-border ratios 3.56:1 against dark surface and 3.48:1 against light surface; placeholders retain full secondary-text color. Screen matrix and additional state images were actually inspected. No formal WCAG certification or native 200% browser zoom check claimed.
- Final process-restart verification and local commit follow below. Original issue #60 remains saved; nothing was reset to manufacture a fresh journey. No push, deployment, publication, submission or external messaging occurred.

### Final exit verification

- Restarted the production process after the successful #61 recording. Actual stored-detail API returns the same 4B v4 analysis (12,147 ms) with status saved; `/api/saved` returns both real saved entries. The initial one-off check incorrectly treated the API's `{items}` wrapper as an array; corrected the check to its documented envelope and passed. No application data or API contract was changed to make the assertion pass.
- Refreshed and inspected the final actual Overview screenshot. The recording is about 19 seconds of actual interaction/inference; its exact successful `.webm` is identified in `.cache/demo/capture.json`. Failed recordings are separate local artifacts. Video file exists with nontrivial size; captured UI screenshots were inspected, not a claim of a separate full video playback audit.
- Latest lint/typecheck and all **77** deterministic tests passed; last production browser suite **6 passed**; final production build passed. Plaintext SQLite, preserved stale analyses, heuristic evidence/ranking and local single-process scope remain intentional limitations. Linux/macOS/Windows CI is configured, but only the recorded Mac environment was actually exercised.
- Preferred 4B P0 journey and local delivery Definition of Done are demonstrated. 1B remains a failed-quality experimental option; no lower-memory, remote-provider or additional-platform compatibility is asserted. Earnings tracking, notes, Kanban, authentication/billing/hosted infrastructure remain outside P0.
- No push, deployment, publication or submission. See local Git history for the milestone commits; the repository stays ready for owner review.
