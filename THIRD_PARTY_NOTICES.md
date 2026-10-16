# Third-party notices and distribution boundaries

Original BountyPilot code: copyright (c) 2026 Rishav Raj Singh, AGPL-3.0-only. This does not replace upstream licenses or assert ownership of dependencies, issue text or model weights. Historical MIT snapshots retain their original grants.

## Material incorporated into the interface

| Material | License / retained notice |
| --- | --- |
| Adapted shadcn/ui Button and AlertDialog compositions | MIT, copyright (c) 2023 shadcn; [complete text](third_party/licenses/SHADCN-MIT.txt), [upstream](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). Adaptations use local styling and a compact confirmation composition; original terms remain. |
| Geist Sans and Mono from geist 1.7.2 | SIL OFL 1.1; [complete text](third_party/licenses/GEIST-OFL-1.1.txt). Font copyright and reserved-name terms remain. Fonts are delivered from the installed package, not a remote font service. |
| Lucide React 1.58.0 icons | ISC and applicable Feather-derived MIT notices; [complete upstream notice](third_party/licenses/LUCIDE.txt). |
| README screenshots | Actual app captures; [provenance and third-party content boundary](docs/images/README.md). Public issue authors retain their rights; amounts are unverified source claims. |

## Installed dependencies

The first public release is **source-only**, including package manifests/lockfile, not node_modules, compiled app bundles, native binaries, browser installers, model weights or a container. Installers obtain exact dependencies separately using `npm ci`. Preserve their installed license/NOTICE files when packaging outputs; this document is not a substitute for a distribution inventory.

Inspected direct/runtime dependencies include Next.js, React/React DOM, Tailwind, Radix, Zod, class-variance-authority, clsx, tailwind-merge and server-only under MIT; Geist under OFL and Lucide under ISC/Feather MIT. Test/build tools include Apache-2.0 and other permissive licenses. The lockfile also includes LGPL-3.0-or-later libvips native bundles, MPL-2.0 Lightning CSS, CC-BY-4.0 caniuse data, BSD, 0BSD and BlueOak-1.0.0 components. Optional platform entries are not proof that each binary was installed or reviewed.

Next includes additional vendored components with their own notices in `node_modules/next/dist/compiled/**/LICENSE`; a top-level MIT package label does not replace them. MPL-2.0 source/notice obligations and any secondary-license conditions must be preserved. Native sharp/libvips bundles contain additional libraries and licenses; the inspected package's README lists Cairo under MPL-1.1 although Cairo upstream offers an LGPL alternative. A future native/binary/container release must verify that license choice, complete source availability, LGPL replacement/relinking obligations and all bundled notices. No complete binary redistribution clearance is claimed here.

Keep font/icon notices available when serving the UI. The local Legal page renders these retained texts. AGPL does not relicense independent upstream components merely because they are listed here.

## Models and external content

Gemma 3 weights are separately downloaded by the user and governed by [Gemma terms](https://ai.google.dev/gemma/terms), including applicable hosted-service/use conditions. They are open-weight, not the application's AGPL license or an OSI-approved software license. No weights are included or authorized for redistribution. Ollama is a separate installed process; its own notices apply if redistributing it. No Ollama binaries are included.

GitHub issue titles, descriptions and comments retain their authors' and repositories' rights. Public availability and API access do not grant blanket permission to relicense them. Use minimal attributed excerpts, preserve source links and obtain rights for any dataset redistribution. Synthetic automated fixtures are labeled as such. Personal SQLite snapshots, raw model outputs, private recordings and credentials are excluded.
