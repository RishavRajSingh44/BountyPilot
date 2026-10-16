---
title: BountyPilot — investigate coding bounties with local Gemma and visible evidence
published: false
tags: devchallenge, hf26challenge
---

Draft only; not submitted. Final gate: review the local demo preview/narration in DEMO_SCRIPT.md, approve a public video destination, add its verified URL, review entrant eligibility and approve the exact article. Source publication is complete; no demo upload or article publication is implied.

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).*

## What I Built

BountyPilot helps a developer investigate public GitHub issues that mention paid work. It searches real issues, preserves attributed excerpts, explains a deterministic fit score, runs local Gemma analysis and keeps a private saved pipeline.

The problem is uncertainty: a bounty label does not establish available funds, eligibility, who can authorize payment or what counts as acceptance. The interface puts those gaps beside the opportunity before a developer invests time.

Independent developers and freelancers are the intended customers. A plausible first paid offering is setup/support around the AGPL-3.0-only core. Demand and willingness to pay remain unvalidated; there are no paying-user or earnings claims.

## Demo

The real workflow is GitHub discovery → issue/source inspection → local Gemma 3 4B analysis → citation and uncertainty review → save → persistent Pipeline. The repository contains [six actual application screenshots and their provenance](https://github.com/RishavRajSingh44/BountyPilot/blob/47f855c6dced7ee8157627537a3fc5f39ade9b65/docs/images/README.md). They were captured October 16 using real GitHub data and local inference; they do not establish that the pictured reward claims remain available or funded.

An 82-second edited, captioned historical screenshot walkthrough is prepared locally for review. It is not a fresh continuous session or a new performance measurement. The original real capture, restart and restored-copy evidence remain separate. A reviewed public video URL must be inserted here before submission; localhost/private cache paths are not judge-accessible links. Do not upload the raw full-discussion recording, which includes excluded contact details.

## Code

Source: [RishavRajSingh44/BountyPilot](https://github.com/RishavRajSingh44/BountyPilot). Verified publication baseline: [`47f855c`](https://github.com/RishavRajSingh44/BountyPilot/commit/47f855c6dced7ee8157627537a3fc5f39ade9b65); record the final submitted revision at publication.

Original code is AGPL-3.0-only licensed. The separate Ollama runtime is [MIT licensed](https://github.com/ollama/ollama/blob/main/LICENSE); Gemma uses [Google's model terms](https://ai.google.dev/gemma/terms). Gemma weights, personal data, credentials, caches and live source snapshots are excluded. Model terms and source-author rights remain separate.

## How I Built It

One Next.js/TypeScript application handles UI, fixed-host GitHub REST access, SQLite and a small Ollama adapter. No Python service, cloud database, agent framework or payment backend is needed. The responsive dark/light interface uses Tailwind, selected shadcn/Radix primitives, Lucide and locally bundled Geist.

**Gemma 3 4B is the primary/default model. Ollama is its local inference runtime.** Gemma is distinct from the Gemini API. I kept the existing `InferenceProvider` interface, with its single working Ollama adapter, and deferred Gemini, OpenAI and other cloud integrations until after submission. The core workflow requires no paid inference API, and no automatic paid-provider fallback exists.

The model receives bounded excerpts and cannot use tools. Its output must pass strict schema, source-ID, exact-quote and citation-reference checks before persistence. Failures keep the previous successful analysis. Validation proves quote fidelity, not semantic support; the original evidence remains visible.

On the measured Apple M4 Pro/48 GiB Mac, the 12-case 4B corpus produced 12 validated results, with 11 judged useful on prompt v4. Service times ranged from 4.111 to 7.276 seconds; the first run included 2.343 seconds of model loading. The 1B alternative failed all 12 grounded checks and is explicitly experimental. These observations do not establish lower-memory or cross-platform compatibility. See IMPLEMENTATION_PROGRESS.md for the full test record and limitations.

The later clean-install real-issue check also exposed failures: two requests for an updated discussion were rejected; a different real issue completed in 11.394 seconds and survived save, process restart and restored-copy checks. I kept validation strict rather than substituting successful-looking text. Exact quotes are still not proof that a generated conclusion follows from its citation or that a reward is funded.

[Published CI](https://github.com/RishavRajSingh44/BountyPilot/actions/runs/38957972841) passed all six Linux/macOS/Windows and Node 24.14.0/24.21.0 jobs. Each passed 79 deterministic tests, lint, types, build and audit; the three 24.21.0 jobs each passed seven Chromium checks. Twelve opt-in model cases are skipped in ordinary CI. These are automated software checks with synthetic HTTP boundaries, not Gemma benchmarks on those runners.

## Why Does Open Innovation Matter?

Running Gemma locally removes a required metered AI API and keeps selected skills and analysis on the user's machine by default. Contributors can inspect the prompt, change the source budget and evaluate another installed model without a proprietary inference dependency. GitHub discovery still needs internet; local inference still uses electricity, storage and suitable hardware. Optional remote Ollama is explicit and requires authenticated HTTPS.

The smaller model's failures are part of the result: local availability does not guarantee useful or safe interpretation. Open access made that tradeoff measurable rather than something to conceal behind a polished interface.

## Prize Categories

**Best Use of Gemma:** Gemma 3 4B runs locally through Ollama and performs the structured, cited opportunity analysis central to the product. No fine-tuning or proprietary inference API is used. The challenge explicitly lists local Gemma use; entrant eligibility remains subject to its rules.

Demand remains unvalidated. I have no independent user interview, testimonial, payment or revenue to report. Optional cloud adapters are post-submission work; the Gemma/Ollama path stays primary.
