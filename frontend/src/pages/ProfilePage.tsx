import { Building2, Mail, CalendarDays, Lock, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, initials } from '../lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account and company information." />

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white">
            {initials(user.business_name)}
          </div>
          <div>
            <p className="text-lg font-bold text-ink">{user.business_name}</p>
            <p className="text-sm text-ink-secondary">{user.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Company information" subtitle="Read-only account details on file" icon={<Building2 size={18} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name" value={user.business_name} icon={<Building2 size={16} />} disabled readOnly />
          <Input label="Email address" value={user.email} icon={<Mail size={16} />} disabled readOnly />
          <Input label="Business ID" value={user.business_id} disabled readOnly />
          <Input
            label="Account created"
            value={formatDate(user.created_at)}
            icon={<CalendarDays size={16} />}
            disabled
            readOnly
          />
        </div>
        <p className="mt-3 text-xs text-ink-secondary">
          Editing company details isn't available yet — this needs a corresponding update endpoint on the backend.
        </p>
      </Card>

      <Card>
        <CardHeader title="Password" subtitle="Change the password used to sign in" icon={<Lock size={18} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="New password" type="password" placeholder="••••••••" disabled />
          <Input label="Confirm new password" type="password" placeholder="••••••••" disabled />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge tone="neutral">Coming soon</Badge>
          <Button disabled>Update password</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Session and access controls" icon={<ShieldCheck size={18} />} />
        <div className="flex items-center justify-between rounded-xl bg-surface p-4">
          <div>
            <p className="text-sm font-medium text-ink">Two-factor authentication</p>
            <p className="text-xs text-ink-secondary mt-0.5">Add an extra layer of security to your account.</p>
          </div>
          <Badge tone="neutral">Coming soon</Badge>
        </div>
      </Card>
    </div>
  );
}
