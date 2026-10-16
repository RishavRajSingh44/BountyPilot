import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AppShell } from '@/components/AppShell';
import './globals.css';
export const metadata: Metadata = {
  title: 'BountyPilot',
  description: 'Local AI opportunity triage with source evidence.'
};
export const dynamic = 'force-dynamic';
export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('bountypilot-theme')==='light')document.documentElement.dataset.theme='light'}catch{}"
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
