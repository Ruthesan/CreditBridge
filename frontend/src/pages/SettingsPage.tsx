import { Palette, Bell, UserCog, LogOut, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../hooks/usePreferences';
import { cn } from '../lib/utils';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-gray-300'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

const THEMES = [
  { key: 'light', label: 'Light', available: true },
  { key: 'dark', label: 'Dark', available: false },
  { key: 'system', label: 'System', available: false },
];

export default function SettingsPage() {
  const { logout } = useAuth();
  const { prefs, update } = usePreferences();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage how CreditBridge looks and notifies you." />

      <Card>
        <CardHeader title="Appearance" subtitle="Choose your interface theme" icon={<Palette size={18} />} />
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <div
              key={t.key}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-center',
                t.key === 'light' ? 'border-primary bg-primary-50' : 'border-line opacity-60'
              )}
            >
              <span className="text-sm font-semibold text-ink">{t.label}</span>
              {!t.available && <Badge tone="neutral">Coming soon</Badge>}
              {t.available && <Badge tone="primary">Active</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Notification settings" subtitle="Control what CreditBridge tells you about" icon={<Bell size={18} />} />
        <div className="divide-y divide-line">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-ink">In-app notifications</p>
              <p className="text-xs text-ink-secondary mt-0.5">
                Analysis completions, new lender matches, and recommendation updates.
              </p>
            </div>
            <Toggle checked={prefs.inAppNotifications} onChange={(v) => update({ inAppNotifications: v })} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-ink">Email notifications</p>
              <p className="text-xs text-ink-secondary mt-0.5">Get a summary emailed when a new analysis completes.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">Coming soon</Badge>
              <Toggle checked={false} onChange={() => {}} disabled />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Account management" icon={<UserCog size={18} />} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" icon={<LogOut size={16} />} onClick={logout}>
            Log out
          </Button>
          <Button variant="danger" icon={<Trash2 size={16} />} disabled title="Contact support to delete your account">
            Delete account
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-secondary">
          Account deletion isn't self-service yet — reach out and we'll take care of it.
        </p>
      </Card>
    </div>
  );
}
