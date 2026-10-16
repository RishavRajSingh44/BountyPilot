import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { title: 'BountyPilot', description: 'Local AI opportunity triage with source evidence.' };
export const dynamic = 'force-dynamic';
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><header><Link href="/" className="brand">BountyPilot</Link><nav aria-label="Main"><Link href="/">Discover</Link><Link href="/pipeline">Pipeline</Link></nav></header><main id="main">{children}</main><footer>Local saved data · Ollama inference · GitHub discovery requires internet. Payment claims are unverified.</footer></body></html>;
}
