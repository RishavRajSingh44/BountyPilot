# Security and privacy

BountyPilot is for one trusted local OS user and one Node process. It has no user authentication or internet-facing deployment model. Bind the app to `127.0.0.1` and use the exact configured `APP_ORIGIN`; Host/Origin and browser fetch-metadata checks reject other origins. Do not reverse-proxy it onto a public interface.

Public GitHub issue text and model output are untrusted. They render as escaped text. The model has no shell, repository checkout, filesystem, network tools or payment authority. Quote checks validate exact source membership, not truth or semantic support. Review the original source and confirm payer/terms before acting. A bounty claim is never verified funds or settlement.

Keep `GITHUB_TOKEN` and optional `OLLAMA_API_KEY` server-side in ignored environment files. Use the least public-read permission available; do not use `NEXT_PUBLIC_`. No credentials are part of a model prompt. GitHub receives your search filters; local Ollama receives selected excerpts and skills. Optional remote Ollama sends those same inputs to your explicitly configured endpoint, requires verified HTTPS and authentication, and never activates as an automatic fallback. Do not expose native unauthenticated Ollama publicly.

SQLite and backups are plaintext, protected by filesystem/OS permissions. Configure data and cache paths before starting. Stop the app before copying a database and any surviving WAL files. Restore to a separate path and check integrity; never delete/reset the original as a recovery step. See README for the procedure.

If you find a vulnerability, do not post credentials, a personal database or private source data in a public issue. When this repository is published, use its private security advisory channel if enabled; otherwise ask the maintainer for a private reporting channel. No private contact address or vulnerability-reporting service has been invented for this local repository.

Known limits: model hallucinations and prompt injection are not solved by prompting; validation and human review reduce consequences. Gemma 1B failed the current grounded evaluation and is experimental. Cross-platform CI configuration and secure remote configuration tests do not prove native/hardware/remote deployment compatibility. See the progress record for actual checks.
