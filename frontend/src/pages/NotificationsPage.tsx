import { motion } from 'framer-motion';
import { Bell, CheckCircle2, FileUp, Sparkles, Landmark, XCircle, Trash2, CheckCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useNotifications } from '../contexts/NotificationContext';
import type { AppNotification, AppNotificationType } from '../types';
import { timeAgo } from '../lib/utils';
import { cn } from '../lib/utils';

const ICONS: Record<AppNotificationType, typeof Bell> = {
  analysis_completed: CheckCircle2,
  analysis_failed: XCircle,
  document_uploaded: FileUp,
  recommendation_ready: Sparkles,
  lender_match: Landmark,
};

const TONES: Record<AppNotificationType, string> = {
  analysis_completed: 'bg-success-50 text-success',
  analysis_failed: 'bg-danger-50 text-danger',
  document_uploaded: 'bg-primary-50 text-primary',
  recommendation_ready: 'bg-secondary-50 text-secondary',
  lender_match: 'bg-warning-50 text-warning-600',
};

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const Icon = ICONS[n.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onRead}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
        n.read ? 'border-line bg-white' : 'border-primary-100 bg-primary-50/40'
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONES[n.type])}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{n.title}</p>
          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-sm text-ink-secondary">{n.message}</p>
        <p className="mt-1.5 text-xs text-ink-secondary/70">{timeAgo(n.created_at)}</p>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        action={
          notifications.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<CheckCheck size={15} />} onClick={markAllRead}>
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" icon={<Trash2 size={15} />} onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} />}
          title="No notifications yet"
          description="You'll see updates here when an analysis completes, a new lender match is found, or recommendations are ready."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={() => markRead(n.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
