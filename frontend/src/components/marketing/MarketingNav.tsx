import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            CB
          </div>
          <span className="text-base font-bold text-ink">CreditBridge</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-semibold text-ink-secondary hover:text-ink">
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-secondary">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-ink">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button fullWidth size="sm">Get started free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
