# Submission demo — local review package

Prepared October 17, 2026. Keep Gemma 3 4B/Ollama as the primary demonstration. No new inference, provider, model download, deployment or upload is needed to prepare this package.

## Captioned screenshot preview

Local artifact: `.cache/submission/BountyPilot-walkthrough-preview.mp4`. This is an edited walkthrough of the six genuine, already reviewed October 16 screenshots in `docs/images/`, not a newly recorded uninterrupted interaction. Captions disclose historical screenshots and unverified reward claims throughout. No audio/music, raw discussions, private database or terminal footage is included. The original screenshots are unchanged; source provenance is in [images/README.md](images/README.md).

| Seconds | Genuine screenshot | Suggested narration |
| --- | --- | --- |
| 0–10 | Overview | BountyPilot helps freelancers investigate coding leads. These are historical application views; listed rewards are unverified claims, not earnings. |
| 10–22 | Discovery | Search public GitHub issues and filter the results. Skills affect local scoring; a high score does not establish funding. Internet and GitHub quotas still apply. |
| 22–34 | Opportunity | Inspect the repository, original source, issue state and reward evidence. Check who can pay, eligibility, acceptance criteria and missing terms before starting work. |
| 34–50 | Actual analysis panel | Gemma 3 4B performs the analysis; Ollama runs the model locally. Review suggestions and exact source quotes as interpretation. The displayed timing is historical, not a new benchmark. |
| 50–62 | Pipeline | Save an opportunity and organize its status in local SQLite. Restart and restored-copy checks were verified separately; this still image does not demonstrate a restart. |
| 62–72 | Settings | Ollama lists installed supported models. 4B remains the default. 1B is experimental after all 12 grounding checks failed. No cloud-provider fallback is implemented. |
| 72–82 | Overview | The app is AGPL-3.0-only, Ollama has its own MIT license and Gemma has separate model terms. Setup/support is a business hypothesis, not proven revenue. |

The original live recording is about 19 seconds and contains excluded contact details in its full discussion view. Do not upload it directly. The captioned preview is a reviewable presentation of approved screenshots; if a continuous interaction video is desired, capture a fresh bounded session using the script below instead of representing stills as live footage.

## Continuous capture checklist

Follow the approximately three-minute script in [HACKTOBERFEST_STRATEGY.md](HACKTOBERFEST_STRATEGY.md). Use a separate private SQLite file, the installed 4B model and current public GitHub sources. Do not overwrite or reset the development pipeline. Keep terminal paths, environment files and raw discussion/contact text outside the captured viewport. Start with readiness, search live GitHub, inspect bounded sources, analyze, inspect uncertainty, save and reload Pipeline. Record failures honestly; never weaken validation to obtain a demo.

Identify the capture time/source/model/digest and hardware. Distinguish local Ollama from a remote endpoint before Analyze. Disclose cuts or time compression; retain original evidence privately. Do not narrate a historical screenshot as a new inference, claim confirmed funding or promise lower-memory performance. Review every visible frame/transition before sharing. Separate process restart/restore evidence belongs in the test report unless actually shown on camera.

## Publication gate

1. Owner reviews the local preview, captions, source provenance and exact [DEV draft](SUBMISSION_DRAFT.md).
2. Owner approves the specific demo destination and upload; verify an unauthenticated viewer can open the resulting URL.
3. Insert that verified URL, final Git SHA and any actual teammate credits into the draft. Check the current official template/rules and entrant eligibility.
4. Obtain explicit approval to publish the exact DEV article; record the submitted URL/time/commit after verifying it.

No upload, release, deployment, DEV post, invented user feedback or paid-provider work is authorized by this local preparation step.

## Local preview verification

Generated the MP4 from seven stationary captioned scenes using the six approved PNGs (Overview is reused for the closing scene). Analysis is displayed as two explicitly labeled top/bottom portions of the same result. Media probe asserted H.264, 1920×1080, exactly 82 seconds and one video stream/no audio. Full ffmpeg decode completed without errors. One decoded frame from each of the seven scenes was captured into a contact sheet and actually inspected; the full-size analysis composition was inspected separately. This is sampled visual inspection of static scenes, not a claim of full interactive playback, new inference or a fresh live P0 test. The generation script, frames, manifest and video stay under ignored `.cache/submission/`; no build dependency or application code was added.
