# BountyPilot — Product Requirements

Status: implementation approved October 16, 2026; portability revision follows the user's subsequent instruction. See IMPLEMENTATION_PROGRESS.md for actual verified work.

October 17 product decision: the Hacktoberfest submission uses **Gemma 3 4B via Ollama** as its primary/default AI path. Preserve the existing provider interface and working inference behavior; Gemini, OpenAI and all other cloud-AI integrations are post-submission only. Gemma 3 1B remains experimental after failed grounding evaluations. GitHub source publication and CI are complete; demo/DEV preparation continues, with media/article publication and any release/deployment requiring separate explicit approval.

## 1. Product and problem

BountyPilot helps an individual developer find public GitHub issues that may offer paid work, understand the work using local Gemma, inspect the supporting sources and unknowns, and maintain a private saved pipeline.

The product promise is **faster opportunity triage with visible evidence**, never guaranteed earnings, guaranteed suitability, or verified payment. A bounty label can be stale, a reward can be withdrawn, and a comment can come from someone without authority to pay. The application must make those distinctions visible before a developer invests time.

The mandatory journey is:

> Search real GitHub issues → inspect an opportunity → analyze using local Gemma → review evidence and uncertainty → save → view the saved pipeline after reload/restart.

Success is a complete, credible flow for one user on one machine. A marketplace, autonomous coding agent, and payment processor are outside the MVP.

## 2. Repository findings and assumptions

Inspection found an empty directory at `<project-root>`, including no hidden project files, Git metadata, code, fixtures, dependencies, deployment setup, or project-specific instructions. There are no existing callers, exports, or infrastructure to preserve. The installed Ponytail skill was read at the user-supplied path; its capabilities and review are documented in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

| Assumption | Consequence / resolution |
| --- | --- |
| One trusted local user, public repositories only | No accounts, OAuth, private repositories, or shared hosted database in P0 |
| User can install Node and Ollama after approval | Native local run is the supported demo; model download is an explicit setup step |
| Gemma 3 is intentional | Prefer installed `gemma3:4b`; offer installed `gemma3:1b` explicitly, with measured hardware suitability |
| Internet is available for discovery | Saved data and local inference can work offline; new GitHub search cannot |
| Paid signals are sparse and inconsistent | Permit zero results; suggest broader preset/repository filters; never fabricate opportunities |
| English UI and English evaluation corpus | Other source languages are displayed as-is; analysis quality is not promised |
| macOS, Windows and Linux are product targets | Dependency support and actual CI/native checks determine compatibility; the development machine is one measured environment only |
| A developer can work roughly 26–36 focused hours plus contingency | Deadline is at risk if approval or hardware setup consumes the remaining window |

The official challenge URL was supplied by the user and researched. Its requirements, time conversion, and submission checks live in [HACKTOBERFEST_STRATEGY.md](HACKTOBERFEST_STRATEGY.md), which is the authority for challenge-specific facts.

## 3. Users and value hypothesis

| Persona | Problem | Useful outcome |
| --- | --- | --- |
| Independent developer with a few hours per week | Searches across repositories; unclear scope and unreliable reward language | Compare plausible leads and know what to ask before starting |
| Early-career open-source contributor | Cannot tell a beginner issue from paid work or judge missing acceptance criteria | A grounded explanation, skill gaps, and explicit uncertainty |
| Experienced freelancer evaluating a niche | Repeatedly reads long discussions and loses track of leads | Quick source-backed triage and a persistent shortlist |

Maintainers are secondary stakeholders: the product must avoid spam, automatic comments, unsolicited outreach, or automatic issue claims.

Business hypothesis: developers may pay for time saved and useful curation. Release revision: the owner selected AGPL-3.0-only for original code; retain third-party terms. Validate a possible paid setup/support service first; evaluate optional hosted convenience or curated alerts only after actual demand, with separate authentication and data design. No billing, subscriptions, affiliate links, referral ranking, or revenue projections in P0. Ask testers what they would pay; do not present interest as revenue.

## 4. Journeys

### Primary journey

1. Start locally; see whether GitHub access, storage, Ollama, and the selected model are ready.
2. Choose one preset (`bounty`, `paid`, or `reward`), optional keywords, repository, and language; optionally enter up to ten skills for local fit scoring.
3. Submit search explicitly. See actual results, source timestamps, paid-signal labels, page-limited ranking, and any quota/incomplete-results warning.
4. Open one result. Fetch its current public issue, repository metadata, and bounded recent comments. Read source text, author association, coverage limits, assignment/state, and the computed score breakdown.
5. Click Analyze. Receive Gemma's scope summary, inferred skills, difficulty, risks, questions, and citations. Distinguish source facts from estimates and unknowns.
6. Inspect payment claims and source links. Resolve missing funding, conditions, authority, and availability with the maintainer outside the application before doing work.
7. Save with one click. Visit Pipeline, refresh the browser, restart the app, and find the same saved opportunity and last successful analysis.
8. Optionally move its local status or remove it. Neither action changes GitHub.

### Failure and return journeys

- Ollama absent or model missing: setup guidance; search, evidence inspection, and saving remain available. Never silently substitute another model or cloud AI.
- Rate limited/offline: saved pipeline remains usable; previously retrieved detail is visibly dated. No old search response is presented as live.
- Issue changed/closed: explicit refresh updates its snapshot and marks older analysis stale. Preserve the previous successful analysis with its original citations until replacement succeeds.
- Source deleted/unavailable: retain a labeled local snapshot, show that live confirmation failed, and link to GitHub. Never interpret a 404 as proof of payment withdrawal.
- No payment claim: say “unknown” or “signal only,” allow saving, and list verification questions.

## 5. Complete feature inventory

P0 is release-blocking for the MVP; P1 follows a successful demo; P2 requires separate product validation. The inventory is the agreed scope, not a promise to implement P1/P2.

| ID | Priority | Feature / acceptance intent |
| --- | --- | --- |
| F01 | P0 | Readiness and installed Gemma 4B/1B selection; actionable storage/provider/model states; AI disabled safely when unavailable |
| F02 | P0 | Public GitHub issue search; preset + keywords + optional repository/language; pagination |
| F03 | P0 | Deterministic ranking of each returned page with visible component scores and limits |
| F04 | P0 | Issue detail, current state/assignees, repository language/archive state, source links |
| F05 | P0 | Bounded comment retrieval, provenance, fetch times, and truncation/coverage indicators |
| F06 | P0 | Payment signal/claim/conflict/unknown states; exact source snippets; no “verified payout” badge |
| F07 | P0 | Explicit local Gemma analysis; schema/citation validation; uncertainty and inference labels |
| F08 | P0 | Save/unsave, idempotent save, saved list, local status: saved/evaluating/pursuing/archived |
| F09 | P0 | Durable SQLite persistence; safe migrations; restart/backup/restore verification |
| F10 | P0 | Explicit detail refresh and stale-analysis warning; last good analysis survives failures |
| F11 | P0 | Loading, cancel, empty, partial, offline, quota, missing-model and storage-error states |
| F12 | P0 | Keyboard navigation, accessible controls/status announcements, responsive layout |
| F13 | P0 | Trust-boundary security, local-only networking, secret handling, safe source rendering |
| F14 | P0 | Automated tests, CI, setup instructions, license/contribution guidance, recorded demo |
| F15 | P1 | CSV/JSON export, saved notes, analysis history, richer pipeline filters |
| F16 | P1 | More search presets and saved searches, complete discussion pagination on demand |
| F17 | P1 | Human evidence-review notes and verified third-party funding integrations, if an authoritative API exists |
| F18 | P1 | Broader browser/OS test matrix, reproducible container packaging, measured model comparison |
| F19 | P2 | OAuth, private repositories, multi-user hosted service, teams and synchronization |
| F20 | P2 | Additional paid-work providers, opt-in alerts and scheduled ingestion |
| F21 | P2 | Billing and monetization experiments, advanced personalization |
| F22 | P2 | Semantic retrieval, embeddings, fine-tuning or learned ranking only if evaluation justifies them |

Explicitly excluded: money transfer/escrow, proof of settlement, bounty guarantees, currency conversion, projected hourly earnings, automated applications/comments/PRs, code execution, repository cloning, background crawling, mobile native apps, chat interface, and autonomous agents.

## 6. Functional requirements

| ID | Requirement |
| --- | --- |
| FR01 | Only explicitly submitted searches call GitHub; enforce public/open/issue constraints on the server |
| FR02 | Return at most 25 results per page, capped at 1,000 discoverable matches; expose provider count and incomplete flag |
| FR03 | Search, detail and saved items identify their original GitHub URL and observation time |
| FR04 | Ranking and payment evidence run without AI; AI cannot increase a payment status or score |
| FR05 | Every model citation resolves to a retrieved source and exact quote; reject a response with invalid citations |
| FR06 | Analysis identifies model/digest, prompt version, source hash, skills input, generated time and coverage |
| FR07 | Unknown effort, funding, payer authority, eligibility, or acceptance conditions remain unknown; estimates are labeled |
| FR08 | Save succeeds without AI; saving twice makes one entry; local status changes survive restart |
| FR09 | Refetch and model failures do not overwrite stored successful snapshots/analysis with empty data |
| FR10 | Reopening saved details works offline; fresh discovery and refresh report their connectivity requirement |
| FR11 | Server credentials only; configurable Ollama through one interface, default loopback; optional remote requires HTTPS/auth and an explicit data-transfer notice |
| FR12 | Search results and saved items expose the same evidence semantics; no “paid” filter implies payment confirmation |

## 7. Non-functional requirements and targets

These are acceptance targets, not measurements from an application that already exists.

| Area | Target / test method |
| --- | --- |
| Local interactions | Saved list/read/write p95 below 200 ms at 500 saved items on the recorded demo machine; measure 20 operations |
| GitHub interaction | Uncached search/detail target below 5 s on demo network; each upstream request has 10 s timeout, operation budget 25 s |
| AI | Warm analysis target below 60 s; total analysis deadline 120 s including at most one validation retry; record cold/warm separately |
| Storage | Keep up to 500 saved items and 500 unsaved detail snapshots; reject the 501st save clearly; never evict a saved item |
| AI resource bound | One active analysis, no durable queue; bounded input/context/output; recover UI on cancellation/failure |
| Correctness | All persisted successful analyses pass schema and exact citation checks; no supported test implies verified payment |
| Security | Public sources only, validated outbound destinations, no secret exposure, no executable source/model content |
| Privacy | No analytics or automatic cloud fallback; personal data in local SQLite by default. Opt-in remote inference transmits selected excerpts/skills; local storage remains plaintext |
| Accessibility | WCAG 2.2 AA design target for the core flow; keyboard, focus, contrast, labels and status messages checked |
| Maintainability | One TypeScript application, explicit small domain modules, pinned runtime and lockfile, no ORM/microservices |
| Cost | No required paid inference or hosted database; local electricity/storage/network and optional hosting still cost money |
| Reliability | Pipeline survives app restart; failed refresh/inference preserves good data; backup can be restored and checked |

## 8. Product validation and release definition

Validate with 2–3 developers if available, with at least one observed primary-flow session. Record time to shortlist one lead, source misunderstandings, setup friction, usefulness of questions, and willingness to pay. These are research goals; do not invent interviews or block the technical demo on unavailable participants.

MVP Definition of Done:

- All P0 features and FR01–FR12 pass their mapped checks in [TEST_STRATEGY.md](TEST_STRATEGY.md).
- One real public GitHub issue completes the entire required journey with an actual local Gemma response, evidence review, save, and pipeline persistence after restart.
- Adversarial fixtures show no unsupported payment confirmation; zero invalid citations can enter persisted successful analysis.
- Offline/rate-limit/missing-model/storage failure paths preserve saved data and offer recovery.
- Setup is reproduced from a clean dependency install; runtime/model/hardware/latencies and remaining limits are recorded.
- License, contribution, privacy and security notes exist after implementation approval; no credentials, local database, or model weights are committed.
- Demo recording and submission material are ready; publication remains a distinct user-authorized action.

The user approved implementation and subsequently approved public GitHub source publication, which is complete. Demo-upload/article/release/deployment authorization remains separate. Automated Linux/macOS/Windows CI passed; interactive Gemma workflows on Windows/Linux and low-memory hardware remain unverified. No minimum-hardware claim follows from measurements on the development machine.
