# BountyPilot UI design

Status: approved implementation scope, October 16, 2026. This design extends the existing P0 application; PRD evidence, privacy and persistence rules still apply.

## Direction and hierarchy

A calm, precise developer workspace. Dark first, dense enough to compare real opportunities, with a narrow persistent navigation rail and one clear primary action per screen. Linear, Vercel and Raycast inform the quality bar, not branding or copied layouts. Use restrained borders, small radii, flat surfaces and typography rather than gradients, glow, glass or decorative animation.

Content hierarchy: repository/source → issue title → evidence state → local relevance → next action. Payment claims always retain an unverified label. An AI estimate never becomes a source fact. Empty data is an honest invitation to search, not fabricated statistics.

## Tokens and typography

| Semantic token | Dark | Light |
| --- | --- | --- |
| Background | `#0B1018` | `#F5F7FA` |
| Navigation | `#0E1520` | `#FFFFFF` |
| Surface | `#151D28` | `#FFFFFF` |
| Raised / hover | `#1B2634` | `#EDF2F6` |
| Border | `#293444` | `#D2DAE3` |
| Primary text | `#F3F6FA` | `#172232` |
| Secondary text | `#94A3B8` | `#536477` |
| Accent / focus | `#5FE1CC` | `#08786B` |
| Warning text | `#F0C477` | `#805000` |
| Error text | `#F9A6AA` | `#AC2836` |

Geist Sans for interface text; Geist Mono for model names, scores, issue IDs and metadata. Bundle fonts locally through the installed Geist package; no runtime font service. Body 14px, supporting text 12–13px, title 26–30px, line height 1.5. Keep long source text readable at 14px with wrapping. Status always includes text or an icon, never color alone.

Use an 8px spacing scale (8, 16, 24, 32, 48); allow 4px for icon/label alignment. Controls 40px minimum, touch actions 44px on narrow screens. Panels 8px radius, controls 6px, subtle 1px borders. No gratuitous shadows. Lucide named icon imports, 16–20px, decorative icons hidden from accessibility APIs.

## Components and structure

Reuse the current search, evidence, detail, pipeline and readiness components. Add a shared application shell, page heading, semantic badge, empty state and selected shadcn/ui primitives (button and accessible confirmation dialog). Keep native inputs/selects where their built-in keyboard behavior is sufficient. Do not install an entire component catalog. Use Tailwind and semantic CSS variables for consistent themes. One lightweight notification region reports completed mutations; errors remain beside the relevant controls.

Navigation: Overview (`/overview`), Discover (`/`, preserving existing links), Pipeline (`/pipeline`), Settings (`/settings`). Active destination has text, icon and a visible indicator. Opportunity details retain a Discover breadcrumb. Analysis lives in the opportunity detail so its citations and source context stay together. No standalone empty AI screen.

Desktop ≥1100px: 224px sidebar; content up to 1280px with 32px gutters. Detail uses a main evidence column and a compact analysis/action column when space permits. Tablet 768–1099px: narrower navigation and 24px gutters; detail stacks. Mobile <768px: compact header plus horizontally arranged labeled navigation, 16px gutters, single-column forms and wrapped metadata. No hidden essential actions or horizontal document scrolling.

## Screens and real data boundaries

- **Overview:** actual locally retained opportunity and saved counts, saved statuses, recent local pipeline changes, readiness and shortcuts. Clearly say counts describe local records, not the whole GitHub catalog. High relevance uses the existing deterministic heuristic and is labeled accordingly. Earnings are not tracked in P0; do not display a fabricated zero or build a financial subsystem.
- **Discover:** prominent keywords field and explicit Search GitHub button; term/repository/language/skills controls. Client-side evidence filtering and sorting apply only to the fetched page and say so. Search is intentionally submitted, not debounced against a rate-limited provider. Compact result rows show repository, title, labels, source time, evidence state, score and source link. Save retrieves and validates the real detail first; failures remain recoverable.
- **Details:** source URL, repository/language/state/assignment, fetch time, refresh and save. Evidence quotes show provenance and coverage. Raw source is escaped text in a disclosure. Removing a saved item requires confirmation. No action changes GitHub.
- **Analysis:** selected installed Gemma, local/remote disclosure, explicit Analyze/Cancel, bounded busy state and last-good result. Sections for source-backed scope, inferred skills/difficulty, suggestions, risks, questions, exact citations and unknowns. Effort remains unknown when unsupported; no invented hourly or money estimate. Show actual model/digest, generation time and measured latency. Stale results retain original sources and a warning.
- **Pipeline:** local saved items and status filter; editable supported statuses and confirmed removal. Last analysis and snapshot times are real. Compact list first. Notes and Kanban remain P1; no decorative nonworking controls.
- **Settings:** live provider/storage status, installed models and lightweight alternative guidance, environment configuration instructions, privacy and local-data information. Model selection is functional on the analysis form. Skills are entered in search/analysis; no pretend persisted profile or new settings backend. Explain local versus optional secured remote inference, plaintext SQLite and backup instructions.

## Interaction, accessibility and states

WCAG 2.2 AA design target. Semantic landmarks, one H1 per screen, visible labels, skip link, strong focus ring and logical tab order. Links navigate; buttons act. Icon-only buttons require names. Dialogs have title/description, initial safe focus, trapped focus, Escape/cancel and return focus. Reduced-motion preference removes optional transitions. Theme toggle exposes its next action; dark is default and user preference persists locally. UI theme storage contains no opportunity data or credentials.

Loading uses a small spinner and text, `aria-busy` and polite announcements. Keep previous good detail/analysis on failed refresh; do not erase it to show a skeleton. Search can cancel. Analysis remains asynchronous and navigation/controls stay responsive. Disable only conflicting actions, not the entire application. Success messages identify the completed local change. Errors explain retry/setup steps without leaking provider credentials. Empty states have a concrete next action. Filtered-empty differs from no search results. Quota errors show provider retry time. Provider unavailable disables AI only; discovery and pipeline remain usable.

## Implementation order and verification

1. Finish M3 storage/evidence regression checks and live fetch/save; preserve its API contracts.
2. Apply tokens/fonts/shared shell, theme and reusable primitives across existing screens; then Overview and Settings using existing data.
3. Refine discovery density, page-local filters/sort, save and pipeline confirmation/status filtering.
4. Implement M4 grounded inference API and the detail analysis panel together; test exact citations, cancellation, stale results and failure preservation.
5. Run M5 security/recovery/full-suite checks, then M6 documentation/demo preparation. UI work does not authorize publishing or introduce hosted infrastructure.

Visual QA will capture and inspect actual screenshots at desktop 1440×1000, tablet 834×1112 and mobile 390×844, in dark and light themes. Check overflow, hierarchy, alignment, contrast, focus and responsive navigation. Exercise empty/loading/success/error states with explicitly labeled automated fixtures as well as the real GitHub/local-model journey. Store screenshots under ignored `.cache/visual/`; record exact inspected files and any unavailable checks in IMPLEMENTATION_PROGRESS.md. Screenshots and CI/platform compatibility are evidence only after actually run.
