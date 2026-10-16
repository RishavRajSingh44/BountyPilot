# Ponytail review and audit — October 16, 2026

Applied the installed `ponytail-review` and `ponytail-audit` skills (5.2.0). These are direct read/trace/report reviews, not invented analyzer commands. Review baseline: M3 `8cedb28` through M4 `a411e80` and M5 working changes. Assumed load: one trusted local user and one Node process, up to 500 saved and 500 unsaved snapshots, one active inference. No hosted/multi-user readiness claim.

## Change review

What this change does: adds the shared responsive dark/light workspace and grounded local Gemma analysis to real GitHub discovery and SQLite persistence. Exact citations are checked before a successful result can replace its predecessor.

### Should fix

1. **Search cancellation does not reach GitHub** (`src/app/api/opportunities/route.ts`, `src/lib/server/github.ts`, `src/components/SearchForm.tsx`).
   - **What this is:** The browser can cancel a search; the server gives each GitHub operation its own timeout.
   - **Problem:** The search handler drops the browser's abort signal. Cancelling or leaving Discover can still consume an upstream request until its own deadline.
   - **Fix:** Pass the request signal through the existing search function and abort it on component unmount. Keep the existing deadline/cache behavior.
   - **If we skip it:** Repeated cancellation wastes quota and does avoidable work. This does not affect saved data.

2. **Experimental-model warning becomes the select's name** (`src/components/ModelSelect.tsx`).
   - **What this is:** A real failure warning for installed 1B appears inside the model field's label.
   - **Problem:** With both models installed, a screen reader reads the whole warning as the control name. The real browser accessibility tree confirmed this.
   - **Fix:** Move the warning outside the label and connect it with `aria-describedby` and a unique ID.
   - **If we skip it:** The critical model picker is unnecessarily verbose and harder to navigate by its name.

Verdict: fix 1 and 2 before final release verification. No unresolved high-severity security/data-loss defect found in the reviewed paths. This is a scoped engineering review, not a security certification.

## Whole-repository audit

What this repo does: searches public GitHub issues, retains bounded attributed source snapshots, computes deterministic evidence/relevance, validates local-model interpretation, and saves a private pipeline. Assumed load is the single-user/process limit above.

Traced all server modules, route handlers, proxy, schemas, migrations, UI mutation callers, provider adapter, request/response limits, tests, build/runtime configuration and setup docs. Checked fixed outbound destinations, redirects, local Host/Origin controls, request sizes, escaped source/model rendering, token boundaries, transactional success-only updates, pruning exclusions, cache identity, deadlines and source-refresh races.

### Should fix

3. **Financial wording in a hypothetical quote can resemble an actual offer** (`src/lib/server/evidence.ts`).
   - **What this is:** Deterministic extraction looks for monetary amounts near reward words.
   - **Problem:** “If we had a sponsor, we could hypothetically offer a $500 bounty” previously counted as a concrete claim. The evidence remained unverified, but the stronger label was misleading.
   - **Fix:** Applied during M4 QA: retain a signal-only state for the tested conditional/hypothetical wording; added a regression case. Exact excerpts still require human review.
   - **If we skip it:** Users spend time inspecting apparent offers that were never made.

4. **A source-exact quote can poorly support the generated interpretation** (`src/lib/server/analysis.ts`, `docs/IMPLEMENTATION_PROGRESS.md`).
   - **What this is:** Citation checking proves that quoted text exists, not that a model's conclusion follows from it.
   - **Problem:** The actual 4B corpus used an unrelated styling quote for a truncation risk, and tended to echo supplied skills. All 1B runs failed validation; one rejected response followed malicious source instructions.
   - **Fix:** Applied the bounded prompt/schema revisions, retained deterministic evidence/coverage, labeled all analysis as interpretation, disclosed the evaluation limits and marked 1B experimental. No failed result is persisted. Further semantic quality work requires a larger evaluated corpus, not a new backend.
   - **If we skip it:** A valid-looking result can be overtrusted. The app must retain human source review as part of the workflow.

No speculative abstraction or infrastructure was added. The requested single provider interface remains; payment execution, financial metrics, notes, Kanban, accounts and hosted infrastructure were omitted. No lean deletion count is invented.

Verdict: apply the two small review fixes and rerun the release checks. The demonstrated 4B local workflow meets the small evaluation gate with the recorded limitations; 1B does not meet the usefulness gate and must not be recommended as proven.

Not checked: native Windows/Linux, low-memory hardware, live secured remote inference, formal accessibility/penetration testing, or complete GPU resource release after cancellation. CI configuration is unexecuted until a separately authorized push. No external publishing or messaging occurred.


## Recheck after fixes

Findings 1 and 2 are fixed in the shared callers. The new cancellation regression proves the already-aborted signal reaches the bounded upstream call and avoids a retry. The model warning now uses a separate description with a unique ID. Findings 3/4 retain the tested mitigation and visible limitations above. Review verdict: ship the demonstrated single-user local 4B workflow after the final gates recorded in IMPLEMENTATION_PROGRESS.md. No unresolved critical/high data-loss or trust-boundary finding remains from this scoped review.

## Should fix — final live-flow findings

5. **A primary detail quota also blocked unrelated searches** (`src/lib/server/github.ts`).
   - **What this is:** GitHub uses separate resource families for primary quotas; secondary limits can apply more broadly.
   - **Problem:** The real diagnostic showed core remaining 0 and search remaining 10, while the single cooldown blocked both.
   - **Fix:** Split primary cooldowns by the two used resource families, retain shared secondary/unspecified backoff, and add a regression. The exhausted core family was not retried before its reset. See [GitHub's documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
   - **If we skip it:** Users unnecessarily lose discovery while detail retrieval is paused.

6. **Prompt coverage described retrieval but omitted the smaller AI input** (`src/lib/server/analysis.ts`).
   - **What this is:** The model sees bounded excerpts from a potentially larger retrieved discussion.
   - **Problem:** If all 100 comments were retrieved but only some fit in the prompt, retrieval counts alone could suggest it saw them all.
   - **Fix:** Add the already-computed AI coverage metadata, bump the prompt version and rerun the actual 4B corpus. Preserve previous analyses with their original sources and stale warning.
   - **If we skip it:** A generated explanation may overstate how much evidence it considered.

Final prompt recheck: v4 produced 12/12 valid first-attempt 4B results; manual assessment 11/12 useful. The truncation risk now cites the explicit missing-terms sentence. Closure/assignment omission and profile echo remain known interpretation limits; the deterministic source UI and review requirement remain essential. Added a measured prompt-token pressure guard with a regression preserving the previous result. Actual v4 corpus prompt counts (552–1,329) are below its conservative threshold. Findings 5/6 are fixed and tested.


7. **Input boundaries were too subtle in the suggested palette** (`src/app/globals.css`).
   - **What this is:** The initial design reused decorative panel borders for interactive input boundaries.
   - **Problem:** Calculated dark border/background contrast was 1.52:1; reduced placeholder opacity also weakened light-mode text.
   - **Fix:** Add a distinct control-border token (3.56:1 dark surface, 3.48:1 light surface) and retain full secondary-text color for placeholders. Refreshed dark/light screenshots were captured and inspected after the correction.
   - **If we skip it:** Users with reduced contrast sensitivity have more difficulty identifying editable fields.

Final verdict: Ship the demonstrated local 4B P0 workflow with the recorded interpretation/hardware limitations. All seven scoped findings have a fix or explicit tested mitigation. Formal accessibility certification, native Windows/Linux/low-memory and live secured-remote checks were not performed.

## First public source release — Ponytail FULL review and audit

### Change review

What this change does: prepares the existing local application for an AGPL-3.0-only source release. It adds retained legal texts/source access, professional setup/community documentation, inspected bounded screenshots, stronger ignore rules and pinned CI actions. Core GitHub, inference, ranking and database logic are unchanged. Assumed load: one trusted local user, one process, up to 500 saved items and one active analysis.

### Must fix — resolved before publication candidate

1. **Full-page demo media exposes a commenter's contact email.**
   - **What this is:** A genuine public issue discussion appears in an older ignored demo capture.
   - **Problem:** Publishing that full-page image would unnecessarily republish personal contact details.
   - **Fix:** Exclude raw recordings/full discussion images; publish an inspected top viewport and isolated analysis panel with documented provenance. Replace synthetic Settings QA media with a real model inventory.
   - **If we skip it:** README assets expose personal information. Fixed before staging the selected images.

2. **Changing the root license can discard the copied component's license text.**
   - **What this is:** The original short notices relied on the root MIT text for adapted shadcn/ui controls.
   - **Problem:** An AGPL root alone does not preserve that third-party permission notice.
   - **Fix:** Retain complete shadcn MIT, Geist OFL and Lucide/Feather texts independently; expose them through Legal. Keep model and external-content terms separate. The owner confirmed original-code release authority/name and AGPL-3.0-only.
   - **If we skip it:** Attribution/compliance is incomplete. Fixed; binary/container redistribution still requires its own review.

### Should fix — resolved

3. **Optional model probe can wait indefinitely for readiness.**
   - **What this is:** Two GETs in scripts/probe-model.mjs had no timeout; fetch also followed redirects.
   - **Problem:** A stalled readiness endpoint could hang the advertised setup check, and redirects could leave the configured endpoint.
   - **Fix:** Add 2-second GET deadlines and reject redirects, retaining the existing generation deadline. Two subprocess tests prove timeout/redirect rejection before inference.
   - **If we skip it:** The setup probe can hang or follow an unintended service. Fixed; application inference logic is unchanged.

Verdict: local source-preparation changes pass the recorded tests. Publication still requires explicit approval and public GitHub authentication. No line/dependency savings claim; no new runtime dependency was added.

### Repository audit

What this repo does: searches real public GitHub issues, stores bounded attributed snapshots, computes evidence/ranking, validates local Gemma interpretation and retains a private pipeline. Assumed load remains one trusted user/process; public hosting or multi-user isolation is unsupported.

Read/trace review covered Host/Origin/fetch-metadata checks, production CSP and escaped rendering, route input/body limits, fixed GitHub destinations/redirects/timeouts, server-only credentials, configured remote-Ollama restrictions, strict model/citation validation, bounded cache/source budgets, prepared SQL, success-only transactional storage, refresh races, migrations and restore behavior. Reviewed shared callers/config/tests for the changed legal route and benchmark script. No unresolved critical/high security or data-loss defect was found within this scope; this is not a penetration test or legal certification.

**Model limitation confirmed:** two clean-install requests for the updated live issue #61 failed AI_INVALID_RESPONSE; the validator correctly stored neither result. A different real issue #60 completed with local 4B in 11.394 seconds, saved, and survived browser reload, process restart and restored-copy verification. Historical 12/12 schema validity is not a guarantee for evolving discussions. Preserve this visible uncertainty; do not weaken exact-quote validation or fabricate fallback output.

Git history scan found no credential patterns, compared local secret values, personal source data or generated artifacts in six baseline commits/168 unique blobs. Existing author/committer corporate email and historic MIT snapshots remain in history; no rewrite was authorized. Documentation records this publication risk. The ignored cloud-key configuration is unused and excluded; no cloud API was called.

Verdict: source candidate prepared with disclosed inference failures and publication prerequisites. Keep Gemma as the default and retain human evidence review. Do not publish an operational-reliability guarantee.

Not checked: exhaustive copied-code provenance, binary-by-binary licensing/source offers, employer agreements beyond the owner's confirmation, formal accessibility/penetration testing, native Windows/Linux, lower-memory hardware, live secure remote Ollama, or GitHub CI/rendering before publication. No speculative provider/framework/authentication infrastructure was added.
