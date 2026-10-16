'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Compass,
  LayoutDashboard,
  ListFilter,
  Moon,
  Settings2,
  ShieldCheck,
  Sun,
  Terminal
} from 'lucide-react';
import { Button } from './ui/button';
const destinations = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/pipeline', label: 'Pipeline', icon: ListFilter },
  { href: '/settings', label: 'Settings', icon: Settings2 }
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('bountypilot-theme', theme);
    } catch {
      /* Theme still works when browser storage is disabled. */
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/overview" className="brand">
          <span className="brand-mark">
            <Terminal aria-hidden="true" />
          </span>
          BountyPilot<span className="version">BETA</span>
        </Link>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav aria-label="Main">
          {destinations.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href === '/' && pathname.startsWith('/opportunities/'));
            return (
              <Link
                href={href}
                key={href}
                className={active ? 'nav-link active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>Your workspace, locally.</strong>
              <p>Saved data stays on this computer.</p>
            </div>
          </div>
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle color theme">
            <Sun className="theme-sun" aria-hidden="true" />
            <Moon className="theme-moon" aria-hidden="true" />
            Switch theme
          </Button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="row">
            <span className="status-dot" />
            Personal workspace <span className="slash">/</span>
            <span className="muted">
              {destinations.find((d) => d.href === pathname)?.label || 'Opportunity'}
            </span>
          </span>
          <a href="https://github.com/RishavRajSingh44/BountyPilot" target="_blank" rel="noreferrer" className="subtle-link">
            GitHub source <ArrowUpRight aria-hidden="true" />
          </a>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer>
          Built for careful opportunity discovery. Reward claims are unverified; confirm terms
          before starting work.{' '}
          <Link href="/legal">License, notices and source · AGPL-3.0-only</Link>
        </footer>
      </div>
    </div>
  );
}
