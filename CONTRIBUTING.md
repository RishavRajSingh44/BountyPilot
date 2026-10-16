# Contributing

Start with [README](README.md), [architecture](docs/ARCHITECTURE.md) and [test strategy](docs/TEST_STRATEGY.md). Keep the single local Next.js/SQLite application and evidence-led journey intact. Discuss a larger feature before building it; P1/P2 items are not unfinished P0 promises.

Use Node 24.22 and `npm ci`. Keep credentials, model weights, personal data and generated artifacts out of Git. Use synthetic fixtures with explicit names in tests; never package a live opportunity as a fixture without attribution and rights review. Do not write to a developer's real database from an automated test.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then `npm run setup:browser` and `npm run test:e2e`. Live Gemma evaluation is separate and optional for ordinary contributors; run it when changing prompts, output schemas or source selection. Tests cannot establish semantic correctness or funding.

For a contribution, explain the concrete before/after behavior, relevant checks and limitations. New trust-boundary/data-write logic needs a meaningful regression test. Do not remove validation, exact citations, source coverage, last-good-data preservation or keyboard accessibility to make a demo pass. Add a numbered migration for schema changes; never reset a user's database.

Changes are contributed under [MIT](LICENSE). Respect [third-party notices](THIRD_PARTY_NOTICES.md) and keep Gemma weights outside the repository. No external comments, issue claims, messages, publication or deployment are performed by this application.
