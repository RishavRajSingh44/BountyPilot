# Contributing

Start with [setup](README.md#installation), [architecture](docs/ARCHITECTURE.md), [test strategy](docs/TEST_STRATEGY.md) and the [code of conduct](CODE_OF_CONDUCT.md). Discuss large changes before implementing them. Keep the single Next.js/SQLite architecture, local Gemma default and evidence-led journey intact.

## Development

Use Node 24.22.0 and npm. Run `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. No GPU, model or credential is required for deterministic tests. See [compatibility instructions](docs/COMPATIBILITY.md) for PowerShell and local AI. Run commands from the repository root:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run setup:browser
npm run test:e2e
```

Vitest exercises real domain/storage logic with synthetic HTTP boundaries; Playwright starts a separate production app and disposable database. Never point automated tests at a personal database. Actual model evaluation is separate and opt-in; run it for prompt/schema/source-selection changes, then inspect semantics manually. See README for commands and known failures.

Use TypeScript, existing components/helpers, shared Zod validation and server-only modules for secrets. Prefer native APIs and focused changes over dependencies/frameworks. Add a meaningful regression test for trust boundaries, parsers and data writes. Keep exact citations, coverage, accessibility and last-good-result preservation. Add numbered migrations; never reset user data or rewrite unrelated code.

## Pull requests and rights

Fork, create a focused branch, explain before/after behavior and report actual checks/limitations. Screenshots must omit personal information. Maintainers review correctness, scope, safety and tests. Bugs need a minimal reproduction; features need a concrete user problem. Security reports follow [SECURITY.md](SECURITY.md), not public bug templates.

Original contributions are submitted under **AGPL-3.0-only**, retaining third-party notices. Sign off commits (`git commit -s`) to certify [DCO 1.1](https://developercertificate.org/): you have the right to submit under the stated license. Confirm employer/contractor permission where needed. DCO is not copyright assignment, a CLA or permission to relicense AGPL-only contributions under proprietary terms. Existing permissive upstream code keeps its notices.

Keep credentials, personal data/paths, weights, logs and generated artifacts out of Git. Use explicitly synthetic fixtures; real excerpts need attribution and rights review. See [third-party notices](THIRD_PARTY_NOTICES.md).

## Useful first contributions

- Test setup on native Windows/Linux and report OS/runtime, exact results and failures. Do not claim untested platforms work.
- Improve keyboard/error-state tests for an interaction with a reproducible accessibility problem.
- Add a synthetic evidence fixture for a documented misclassification, with a failing regression first.

These are suggested tasks, not already-created issues. The [2026 challenge](https://dev.to/challenges/hacktoberfest-week2-2026-10-12) rewards a new open-AI project and write-up; it does not count pull requests. Do not submit no-op PRs or promise contribution-credit rewards.
