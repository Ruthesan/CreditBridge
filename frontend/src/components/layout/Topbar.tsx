import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, UploadCloud, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Dropdown } from '../ui/Dropdown';
import { initials } from '../../lib/utils';
import { User, Settings, LogOut } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Dashboard', path: '/app' },
  { label: 'Upload Documents', path: '/app/upload' },
  { label: 'Credit Analysis', path: '/app/analysis' },
  { label: 'Recommendations', path: '/app/recommendations' },
  { label: 'Lender Comparison', path: '/app/lenders' },
  { label: 'Reports', path: '/app/reports' },
  { label: 'Analysis History', path: '/app/history' },
  { label: 'Profile', path: '/app/profile' },
  { label: 'Settings', path: '/app/settings' },
];

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-secondary hover:bg-surface lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages…"
          aria-label="Search"
          className="h-10 w-full rounded-xl border border-line bg-surface/60 pl-9 pr-3 text-sm placeholder:text-ink-secondary/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        {results.length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-soft">
            {results.map((r) => (
              <button
                key={r.path}
                onClick={() => {
                  navigate(r.path);
                  setQuery('');
                }}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-surface"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate('/app/upload')}
          className="hidden items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 sm:flex"
        >
          <UploadCloud size={16} />
          Upload
        </button>

        <button
          onClick={() => navigate('/app/notifications')}
          className="relative rounded-xl p-2.5 text-ink-secondary transition-colors hover:bg-surface"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <Dropdown
          align="right"
          trigger={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
              {initials(user?.business_name ?? '?')}
            </span>
          }
          items={[
            { key: 'profile', label: 'Profile', icon: <User size={16} />, onSelect: () => navigate('/app/profile') },
            { key: 'settings', label: 'Settings', icon: <Settings size={16} />, onSelect: () => navigate('/app/settings') },
            { key: 'new', label: 'New upload', icon: <Plus size={16} />, onSelect: () => navigate('/app/upload') },
            { key: 'logout', label: 'Log out', icon: <LogOut size={16} />, onSelect: logout, danger: true },
          ]}
        />
      </div>
    </header>
  );
}
