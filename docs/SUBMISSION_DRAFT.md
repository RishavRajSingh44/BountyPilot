---
title: BountyPilot — investigate coding bounties with local Gemma and visible evidence
published: false
tags: devchallenge, hf26challenge
---

Draft only. Do not publish until the owner approves and replaces the local artifact references with approved accessible links. Challenge reference: [Hacktoberfest Week 2](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).

## What I Built

BountyPilot helps a developer investigate public GitHub issues that mention paid work. It searches real issues, preserves attributed excerpts, explains a deterministic fit score, runs local Gemma analysis and keeps a private saved pipeline.

The problem is uncertainty: a bounty label does not establish available funds, eligibility, who can authorize payment or what counts as acceptance. The interface puts those gaps beside the opportunity before a developer invests time.

Independent developers and freelancers are the intended customers. A plausible first paid offering is setup/support around the AGPL-3.0-only core. Demand and willingness to pay remain unvalidated; there are no paying-user or earnings claims.

## Demo

Local recording and screenshots are generated under `.cache/demo`; see `capture.json` for the exact real issue, timestamp and video path. The demo searches live GitHub, retrieves sources, uses actual local Gemma 4B, reviews uncertainty/citations, saves and reloads Pipeline. Separate process-restart and restore checks preserve the saved result. These are local artifacts pending owner review and approved sharing; localhost is not a public demo link.

## Code

Original code is AGPL-3.0-only licensed. Repository publication and a public URL are pending owner approval. Gemma weights, personal data, credentials, caches and live source snapshots are excluded. Model terms and source-author rights remain separate.

## How I Built It

One Next.js/TypeScript application handles UI, fixed-host GitHub REST access, SQLite and a small Ollama adapter. No Python service, cloud database, agent framework or payment backend is needed. The responsive dark/light interface uses Tailwind, selected shadcn/Radix primitives, Lucide and locally bundled Geist.

The model receives bounded excerpts and cannot use tools. Its output must pass strict schema, source-ID, exact-quote and citation-reference checks before persistence. Failures keep the previous successful analysis. Validation proves quote fidelity, not semantic support; the original evidence remains visible.

On the measured Apple M4 Pro/48 GiB Mac, the 12-case 4B corpus produced 12 validated results, with 11 judged useful on prompt v4. Service times ranged from 4.111 to 7.276 seconds; the first run included 2.343 seconds of model loading. The 1B alternative failed all 12 grounded checks and is explicitly experimental. These observations do not establish lower-memory or cross-platform compatibility. See IMPLEMENTATION_PROGRESS.md for the full test record and limitations.

## Why Does Open Innovation Matter?

Running Gemma locally removes a required metered AI API and keeps selected skills and analysis on the user's machine by default. Contributors can inspect the prompt, change the source budget and evaluate another installed model without a proprietary inference dependency. GitHub discovery still needs internet; local inference still uses electricity, storage and suitable hardware. Optional remote Ollama is explicit and requires authenticated HTTPS.

The smaller model's failures are part of the result: local availability does not guarantee useful or safe interpretation. Open access made that tradeoff measurable rather than something to conceal behind a polished interface.

## Prize Categories

Gemma is the implemented relevant partner technology. Do not claim hosting, fine-tuning or other integrations that were not built. No independent user interview, testimonial or payment was obtained during this task.
