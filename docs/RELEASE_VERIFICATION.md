# Release verification — first public source candidate

**Publication update, October 17, 2026 (IST):** owner-approved source publication completed at [RishavRajSingh44/BountyPilot](https://github.com/RishavRajSingh44/BountyPilot), public, branch `main`, initial SHA `797c71097e35b4a415644fd9c66c3dd9ce3485c5`. The preparation report below remains a dated record; its pending-auth/publication/CI statements describe that earlier stage. See the publication addendum at the end.

Verified October 16, 2026. Baseline `980445e`, branch `main`. This report documents local preparation, **not publication**. Source publication requires explicit owner approval; no remote/repository/release/tag/deployment/DEV post was created.

## Environment and isolation

- macOS arm64, Apple M4 Pro, 12 CPU cores, 48 GiB RAM; Node 24.22.0 and npm 11.19.1. Shell-default Node 22.9 was not used for gates.
- Installed local Ollama on loopback 11435; actual Gemma 3 4B digest `68ceab7e468a31c988b44d5a4984a0e21f58c4f7158c6ce29c1804babac38df7`. No cloud inference/API key was used. Weights were not copied into the clean installation.
- Original app on loopback 3001 remained untouched. Production candidate built into `.cache/release/build`; browser fixtures used their own SQLite file and loopback 3100/3101.
- Clean source-only checkout: `.cache/release/clean/`, exported from the staged candidate using `git checkout-index --all --prefix=.cache/release/clean/`. An independent local Git directory prevented accidental parent-repository discovery. No node_modules, .env, SQLite, build/browser/npm cache, weights or recordings were copied.
- Clean npm/browser setup downloaded into its own cache. Clean live app used loopback 3102, existing local Ollama, no GitHub token and `.cache/release-live.sqlite` inside that checkout. Development data was never used as the test database.

## Commands and actual results

Commands ran from the relevant project root after selecting Node 24.22.0. Paths below are relative; no developer-specific runtime path is required by the public project.

| Command/check | Working candidate | Clean source checkout |
| --- | --- | --- |
| `npm ci` | Existing installed tree retained | 237 packages installed from lockfile, empty npm cache; audit found 0 vulnerabilities |
| `npm ls --all --json` | Passed | Passed |
| `npm audit --json` | Live registry: 0 info/low/moderate/high/critical findings; 320 lockfile dependency entries | Fresh install also reported 0 vulnerabilities |
| `npm run lint` | Passed, including benchmark fix/test | Passed on exported candidate |
| `npm run typecheck` | Passed | Passed |
| `npm test` | **79 passed; 12 opt-in live-corpus cases skipped**, 7 files passed / 1 skipped | **79 passed; 12 skipped**, after copying only the reviewed benchmark fix and its new test |
| `npm run build` | Passed with `BOUNTYPILOT_BUILD_DIR=.cache/release/build`, `NEXT_TELEMETRY_DISABLED=1` | Passed with default `.next` and no .env file |
| `npm run setup:browser` | Existing installed Chromium used | Downloaded fresh Chromium/headless shell and ffmpeg successfully |
| `npm run test:e2e` | **7 passed**, isolated build/cache selected | **7 passed**, fresh dependencies/browser, separate synthetic test DB |
| Actual clean-install P0 journey | Separate from mocked tests | Real GitHub search/detail → actual Gemma → citations → save → Pipeline reload succeeded for issue 60; failures below |
| Restart and restored-copy checks | Existing automated recovery test passed | Actual saved analysis preserved across process restart and a separate restored DB; integrity/FKs/table comparisons passed |
| `git diff --cached --check` | Passed during preparation; final recheck before commit | Not a public Git checkout |

The core application build/browser suite passed before the later benchmark-script-only timeout change. That script does not enter the application bundle. Both trees then passed all 79 deterministic tests; candidate lint/types were rerun. Exact code/config/manifest comparisons confirm the clean tested tree matches the candidate for runtime, scripts and tests. Documentation/report changes after export do not alter the tested application.

Browser checks cover search with AI unavailable, quota/retry, synthetic end-to-end validation/persistence/removal, responsive themes/keyboard, loading/filter/empty/error feedback, retained analysis while AI is unavailable, and the new Legal/source/retained-notice page. Synthetic boundaries are explicitly test-only. These checks are not live funding/model or formal accessibility verification.

## Live results and failures — do not omit

1. `APP_ORIGIN=http://127.0.0.1:3102 BOUNTYPILOT_CACHE_DIR=.cache/release-live PLAYWRIGHT_BROWSERS_PATH=.cache/browsers node scripts/record-demo.mjs oll4com/spaceapp` retrieved current public issue 61. The model failed strict validation after the allowed repair attempt. The UI displayed AI_INVALID_RESPONSE and stored no analysis. A second explicit analysis request on that same snapshot also failed validation. No rules were weakened and no fallback output was substituted.
2. A different actual public result, [oll4com/spaceapp#60](https://github.com/oll4com/spaceapp/issues/60), completed actual local Gemma 3 4B analysis in **11,394 ms**, generated at `2026-10-16T12:45:28.799Z`, with one validated citation. Its issue ID is `5878908647`. It was saved and shown after browser reload. This is one observed service duration, not a repeated benchmark or hardware minimum.
3. Initial ad hoc verification helpers had selector/navigation-wait mistakes. One stopped before inference; another reached success/save but asserted before client navigation settled. These were harness failures, not passing checks. Corrected helpers explicitly awaited the destination and verified the real persisted result. Raw failures/media stay in ignored private cache.
4. The clean live DB retained two actual snapshots, one successful analysis and one saved row. After stopping only the clean test process, a checkpointed copy was restored separately. New controlled app processes reopened each DB; browser/API checks confirmed the same saved analysis and duration. `PRAGMA integrity_check` returned `ok`, foreign-key checks were empty, and ordered contents of all three tables matched SHA-256 fingerprints. The original clean DB remained unchanged.

Historical 4B corpus validity/usefulness and the 12.147-second earlier issue-61 demo remain historical observations in IMPLEMENTATION_PROGRESS.md. The opt-in corpus was not rerun because no application prompt/model/validation logic changed. Current issue-61 failures demonstrate that those historical results are not a reliability guarantee. 1B remains experimental after all 12 earlier grounding checks failed.

## Security, privacy and repository hygiene

- Audited six baseline commits and 168 unique historical blobs, tracked names and current publication files. No matched credential patterns, compared non-empty local secret values, developer-machine paths, databases, logs, weights or recordings were found in baseline source history. Final staged/history scan is required again before push. A pattern scan is not proof that arbitrary unknown secrets cannot exist.
- Historical author/committer corporate email remains in Git metadata. Owner asked to leave this question aside; no rewrite or email substitution in old commits was authorized. Public approval must account for that exposure. A future license change cannot revoke historical MIT permissions.
- Ignored .env files were not copied or uploaded; cloud configuration is unused. No consumer tokens/cookies were accessed. Previously disclosed credentials require owner-managed revocation/rotation; absence from Git does not revoke a key.
- Two deliberately fake credential canaries were set for production compilation. **34 client JavaScript/JSON artifacts** contained neither value. Final client scan also compares configured local secret values without printing them.
- Read/trace review covered input/body limits, fixed outbound GitHub paths and redirect rejection, remote-Ollama HTTPS/auth configuration, abort deadlines, escaped rendering/CSP, Host/Origin checks, prepared statements, atomic success-only storage, bounded caches and source budgets. No critical/high security or data-loss defect was found in this scope. No third-party intrusive test was performed.
- Fixed auxiliary benchmark readiness GETs lacking deadlines; all benchmark calls now reject redirects. Two subprocess regressions prove failure before inference on a stalled or redirected readiness response.
- Strengthened ignores for databases/journals, logs, temporary outputs, key files, weights and private video. Ignore rules do not remove already tracked files; tracked publication inventory was checked separately.
- Six selected genuine README images were actually opened and inspected. Full discussion media containing a commenter's email and synthetic Settings QA media were excluded. Selected PNGs contain no textual/EXIF metadata chunks. New Legal page desktop-dark/mobile-light captures were also inspected; existing full viewport/theme QA is historical and not relabelled as a new 35-image inspection.

## FOSS and licensing assessment

Owner explicitly confirmed original-code release authority and copyright name **Rishav Raj Singh**, then selected **AGPL-3.0-only**, overriding MIT defaults in the supplied checklist. Root license contains the unmodified SPDX AGPL text with an explicit version-only application notice. Package/lockfile/current documentation agree. Retained shadcn MIT, Geist OFL and Lucide/Feather texts are independently available in source and the Legal UI. No CLA, copyright assignment, proprietary relicensing entitlement or automatic fork payment is implied by DCO sign-off.

This candidate publishes application **source only**. Installed dependencies retain their own licenses. No node_modules, compiled/native binary, container, browser or model weight is part of the publication candidate. Native sharp/libvips contains additional LGPL/MPL components; full binary redistribution/source-offer compliance is not cleared by this source audit. Gemma 3 is separately licensed open-weight software/model material with use restrictions, not an OSI-approved application license. Third-party GitHub excerpts/screenshots retain authors' rights. Ownership confirmation is not a legal opinion about every provenance or employment question.

## GitHub publication configuration and outstanding prerequisites

- Connected account: **RishavRajSingh44**, verified through GitHub connector. Proposed URL: **https://github.com/RishavRajSingh44/BountyPilot**. Public, branch `main`, AGPL-3.0-only; exact description/topics in RELEASE_PLAN.md.
- CLI installed (2.88.1), but **not authenticated to github.com**. Its default host is a separate enterprise service; public commands must explicitly target github.com. An anonymous public API probe hit quota. Connector repository lookup returned 404; private-repository/name availability remains to be confirmed with proper access before creation.
- Existing remote: none. No repository visibility, settings, release, tag, deployment, paid service or DEV content was changed. README and Source links are proposed URLs until approval/publication.
- CI uses read-only permissions, no pull_request_target, no secrets, and verified immutable v6 action commits. Linux/macOS/Windows × Node 24.14/24.x is **configured, not remotely run**. Runtime/model hardware compatibility cannot be inferred from configuration.
- npm warned about optional fsevents install-script approval; no script policy/global package change was made. All recorded gates passed. Next warned about the outer lockfile during nested clean testing and correctly ignored it; no tracing-root architecture change was needed. An isolated build regenerated tsconfig include paths locally; only those generated changes were restored, leaving the original tracked configuration intact.
- No formal accessibility certification, native Windows/Linux execution, lower-memory benchmark, actual secured remote inference, public GitHub rendering/CI or external-user validation has occurred. Dedicated private reporting contact is not established; documentation does not invent one. No earnings, payments, users or revenue claimed.

## Approval boundary

After explicit approval only: verify github.com authentication/namespace/name; create the public repository if absent without duplicate files or overwriting another repository; configure remote; push the locally verified main SHA; apply accurate metadata/topics; verify commit/files, notices, README/media links and CI. No GitHub Release/tag, deployment or DEV article is included. Publication approval must acknowledge existing corporate-email metadata and historical MIT snapshots. Later work: public fresh-install check, external developer test, reviewed demo/submission, separately approved release, then optional cloud providers on a separate branch.

Post-audit probe check: `OLLAMA_BASE_URL=http://127.0.0.1:11435 GEMMA_MODEL=gemma3:4b BOUNTYPILOT_CACHE_DIR=.cache/release-probe npm run probe:model` passed on the clean installation after inference/restart work ended. One synthetic cold run measured 3,406 ms and one warm run 462 ms, both schema-valid with funding null. These are single short feasibility samples, not opportunity quality or low-memory benchmarks. The optional probe intentionally unloads its selected local model first.

## Candidate inventory and final checks

Final pre-commit scan: 113 tracked files, six baseline commits / 168 unique historical blobs, 34 client artifacts and 48 local Markdown links checked; no matched credential/path findings or broken local targets. One configured secret value was compared without printing it. .env.local, clean-checkout cache, development SQLite and private full-discussion media remain ignored. Required attribution and commit identity are not treated as credentials. Public links/CI still require post-publication verification.

Changed files (37):

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml`
- `.gitignore`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `THIRD_PARTY_NOTICES.md`
- `docs/ARCHITECTURE.md`
- `docs/HACKTOBERFEST_STRATEGY.md`
- `docs/IMPLEMENTATION_PROGRESS.md`
- `docs/PRD.md`
- `docs/QUALITY_REVIEW.md`
- `docs/RELEASE_NOTES_v0.1.0.md`
- `docs/RELEASE_PLAN.md`
- `docs/RELEASE_VERIFICATION.md`
- `docs/SUBMISSION_DRAFT.md`
- `docs/images/README.md`
- `docs/images/analysis.png`
- `docs/images/discovery.png`
- `docs/images/opportunity.png`
- `docs/images/overview.png`
- `docs/images/pipeline.png`
- `docs/images/settings.png`
- `package-lock.json`
- `package.json`
- `scripts/probe-model.mjs`
- `src/app/legal/page.tsx`
- `src/components/AppShell.tsx`
- `tests/e2e/legal.spec.ts`
- `tests/probe.test.ts`
- `third_party/licenses/GEIST-OFL-1.1.txt`
- `third_party/licenses/LUCIDE.txt`
- `third_party/licenses/SHADCN-MIT.txt`

## Publication addendum — October 17, 2026 (IST)

- Explicit owner approval covered public source publication under **AGPL-3.0-only**, with original history retained. Authenticated CLI identity was verified as `RishavRajSingh44`; commands explicitly targeted github.com, separate from the office Enterprise host.
- Created the public repository, configured the approved description/topics and repository-local HTTPS origin. The first push was rejected because CLI authorization lacked `workflow` scope. The repository remained empty. After the owner completed the normal GitHub CLI scope refresh, the verified `main` push succeeded. No tokens/cookies were extracted; no global Git credential helper or office account configuration was changed. Push used a per-command GitHub credential helper.
- Published initial SHA **797c71097e35b4a415644fd9c66c3dd9ce3485c5**. GitHub's complete recursive tree matched all **113** local tracked file modes/paths/blob hashes, including README, LICENSE, third-party notices, community files and six PNGs. The final scan covered seven commits and 205 unique historical blobs: no matched credential/path findings, no broken targets among 48 relative Markdown links. Generated files, private databases, .env.local, caches and weights were excluded. Pattern scanning cannot establish absence of all unknown secrets. Corporate Git email metadata and earlier MIT snapshots remain intentionally public.
- Public README was opened in a browser, including its expanded screenshot section. All six images loaded with nonzero natural dimensions; the actual rendered README and screenshot view were inspected. The API-rendered README also contained the FOSS/license sections and six image elements. Local documentation targets are present in the identical published tree; external third-party links were not exhaustively crawled.
- [Initial publication CI](https://github.com/RishavRajSingh44/BountyPilot/actions/runs/38957344507) **completed successfully: 6/6 jobs**. Linux/macOS/Windows each passed on Node **24.14.0** and **24.21.0** (the actual `24.x` resolution). Each job completed fresh `npm ci`, lint, type checks, **79 deterministic tests / 12 opt-in cases skipped**, production build and audit with **0 vulnerabilities**. Each 24.21.0 job also completed fresh Chromium setup and **7 browser tests**. This verifies the automated runner configurations, not interactive Gemma operation or lower-memory hardware.
- GitHub initially reported license `NOASSERTION` for the prefixed/unwrapped SPDX text. A minimal follow-up uses the standard full GitHub AGPL template. An assertion verified the existing legal body matches after whitespace and HTTP/HTTPS normalization; no license clause was added/removed. Copyright owner and the explicit **AGPL-3.0-only** application choice remain in README, package/lockfile and the Legal page. Third-party notices remain unchanged. README/compatibility claims now distinguish passed CI from unverified interactive AI environments.
- The follow-up production build passed. Its focused Legal-page Chromium regression initially could not bind the sandbox's test port (`EPERM`); retrying with the permitted local socket access passed. An isolated test SQLite file was used; development data was not touched. Only generated TypeScript include changes from the custom build output were restored.
- Ponytail FULL follow-up review: documentation/license formatting only; no application, inference, SQL, dependency, API or workflow logic changed. The standard-text equivalence assertion, build and existing Legal regression cover the change. Final remote hash/license detection and follow-up CI status are checked after pushing the follow-up commit and reported to the owner; no passing result is assumed in advance.
- No history rewrite, tag, GitHub Release, deployment, DEV article, paid service, cloud-provider integration or external messaging occurred. A public fresh-clone live journey and an external developer test remain next steps. The prior clean local source checkout already exercised actual GitHub/Gemma, including the failures recorded above. Live Gemma was not rerun for publication-only formatting/documentation changes.
