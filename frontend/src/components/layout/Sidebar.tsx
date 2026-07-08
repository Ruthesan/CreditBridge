import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  LineChart,
  Sparkles,
  Landmark,
  FileBarChart2,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/upload', label: 'Upload Documents', icon: UploadCloud },
  { to: '/app/analysis', label: 'Credit Analysis', icon: LineChart },
  { to: '/app/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/app/lenders', label: 'Lender Comparison', icon: Landmark },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/app/history', label: 'Analysis History', icon: History },
];

const BOTTOM_ITEMS = [
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
              CB
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">CreditBridge</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Credit Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-white/10" />

          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} strokeWidth={2} />
                {item.label}
              </span>
              {item.to === '/app/notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
