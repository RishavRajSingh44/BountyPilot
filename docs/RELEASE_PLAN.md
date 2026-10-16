# First public source release

Baseline: `980445e`, branch `main`. Local preparation is authorized; creation, push, visibility changes, tags, releases, deployment and DEV publication are not.

## Scope and order

1. Audit tracked files, all reachable historical blobs, commit identity, server boundaries, lockfile advisories and media. Never print credentials. Preserve the original database and history.
2. Apply the owner's selected **AGPL-3.0-only** to original code. Owner confirmed release authority and copyright name **Rishav Raj Singh**. Preserve third-party terms. No commercial relicensing agreement or CLA is implied.
3. Update README, package/license metadata, notices, contribution/security/conduct guidance, minimal issue/PR templates and current planning claims. Add genuine inspected screenshots without personal contact details, and visible application license/source access. Preserve inference/storage behavior.
4. Run dependency, lint, type, service, browser and build gates. Prepare a source-only checkout under ignored `.cache/release/`, install from the lockfile and exercise real GitHub/local Gemma with its own SQLite database. Verify restart and restored-copy integrity.
5. Apply installed Ponytail review/audit instructions. Record actual evidence in RELEASE_VERIFICATION.md and request publication approval.

## Initial findings and blockers

- Root/license/package/docs specify MIT. Historical MIT grants remain valid; a current change cannot revoke them. No history rewrite is authorized.
- Six historical commits contain the author's corporate email. The owner requested leaving the history question aside. Disclose this metadata again at publication approval.
- GitHub connector identifies `RishavRajSingh44`; repository lookup returned 404, which does not prove absence of a private repository. github.com CLI authentication is absent; its default host is a separate enterprise service. Explicitly target github.com.
- Retain full shadcn/ui MIT, font and icon notices independently of the root license. Dependencies retain their own licenses. Source publication excludes node_modules, native bundles and weights; binary/container redistribution requires separate source-obligation review.
- Existing full-page analysis media contains a public commenter's email. Exclude it and private recordings; use bounded views. Old Settings QA media uses a synthetic provider: replace it with the actual installed-model view.
- Shell-default Node 22.9 is unsuitable. Run checks with verified Node 24.22, without publishing machine-specific paths.
- Native Windows/Linux, low-memory hardware, secure remote inference and formal accessibility remain unverified.

## Proposed GitHub configuration

- `RishavRajSingh44/BountyPilot`: https://github.com/RishavRajSingh44/BountyPilot; public; default branch `main`; `AGPL-3.0-only`.
- Description: FOSS, local-first AI platform for discovering and evaluating coding opportunities with Gemma and Ollama.
- Topics: foss, free-software, open-source, hacktoberfest, gemma, ollama, local-ai, nextjs, developer-tools, coding-bounties.
- After approval only: verify namespace/name/authentication; create if absent without overwriting another repository; set remote; push verified main; set metadata/topics; verify SHA, files, rendering and CI. No duplicate README/license/gitignore initialization, release, tag, article, deployment or paid service.
