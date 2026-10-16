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
