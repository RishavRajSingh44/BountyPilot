import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PageHeading } from '@/components/PageHeading';

export const runtime = 'nodejs';

export default function Legal() {
  return (
    <>
      <PageHeading
        eyebrow="Project / legal"
        title="License, notices and source"
        description="Copyright © 2026 Rishav Raj Singh. Original BountyPilot code is AGPL-3.0-only, without warranty."
      />
      <section className="panel">
        <p>
          You may use, study, modify and redistribute this software under its license.{' '}
          <a href="https://github.com/RishavRajSingh44/BountyPilot" target="_blank" rel="noreferrer">
            Obtain the project source and build instructions
          </a>. Your local checkout also contains the source. Operators of modified network versions
          must offer the complete Corresponding Source for the version they run, including relevant
          changes and build scripts; keep the source link accurate. Credentials and personal data
          do not belong in that source offer.
        </p>
        <p>Third-party components and Gemma weights retain their separate terms.</p>
        {[
          ['Application license', 'LICENSE'],
          ['Third-party scope', 'THIRD_PARTY_NOTICES.md'],
          ['shadcn/ui MIT notice', 'third_party/licenses/SHADCN-MIT.txt'],
          ['Geist font license', 'third_party/licenses/GEIST-OFL-1.1.txt'],
          ['Lucide and Feather notices', 'third_party/licenses/LUCIDE.txt']
        ].map(([title, file]) => (
          <details key={file} className="mt-4">
            <summary>{title}</summary>
            <pre className="source" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {readFileSync(resolve(file), 'utf8')}
            </pre>
          </details>
        ))}
      </section>
    </>
  );
}
