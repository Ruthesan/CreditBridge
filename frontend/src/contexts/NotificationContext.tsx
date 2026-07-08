import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification, AppNotificationType, PipelineStatus } from '../types';
import { listRuns, getRunStatus } from '../lib/api';
import { useAuth } from './AuthContext';
import { readPreferences } from '../hooks/usePreferences';

/**
 * There is no notifications endpoint in the backend (see DECISIONS.md) — this
 * context derives real notifications from actual pipeline run state changes
 * rather than inventing fake events. It polls /pipeline/runs, diffs against
 * the last-seen status per run_id, and turns genuine transitions (a run
 * completing, failing, or producing a ready lender match) into notifications.
 * State is persisted per-business in localStorage so it survives refreshes.
 */

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  notifyUploaded: (fileName: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function storageKey(businessId: string) {
  return `creditbridge_notifications_${businessId}`;
}
function seenKey(businessId: string) {
  return `creditbridge_seen_runs_${businessId}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const seenStatuses = useRef<Map<string, PipelineStatus>>(new Map());
  const initialized = useRef(false);

  const persist = useCallback(
    (next: AppNotification[]) => {
      if (!user) return;
      localStorage.setItem(storageKey(user.business_id), JSON.stringify(next.slice(0, 50)));
    },
    [user]
  );

  const pushNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => {
      if (user && !readPreferences(user.business_id).inAppNotifications) return;
      setNotifications((prev) => {
        const next: AppNotification[] = [
          { ...n, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString(), read: false },
          ...prev,
        ].slice(0, 50);
        persist(next);
        return next;
      });
    },
    [persist, user]
  );

  // Load persisted notifications + seen-run map when the user changes.
  useEffect(() => {
    initialized.current = false;
    if (!user) {
      setNotifications([]);
      seenStatuses.current = new Map();
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(user.business_id));
      setNotifications(raw ? JSON.parse(raw) : []);
      const rawSeen = localStorage.getItem(seenKey(user.business_id));
      seenStatuses.current = rawSeen ? new Map(Object.entries(JSON.parse(rawSeen))) : new Map();
    } catch {
      setNotifications([]);
      seenStatuses.current = new Map();
    }
    initialized.current = true;
  }, [user]);

  const poll = useCallback(async () => {
    if (!user || !initialized.current) return;
    try {
      const runs = await listRuns();
      for (const run of runs) {
        const prevStatus = seenStatuses.current.get(run.run_id);
        if (prevStatus === run.status) continue;
        const isFirstSight = prevStatus === undefined;
        seenStatuses.current.set(run.run_id, run.status);

        // Only notify on genuine transitions into a terminal state, and skip
        // the very first poll after login flooding the center with history.
        if (isFirstSight && (run.status === 'completed' || run.status === 'failed')) continue;

        if (run.status === 'completed') {
          pushNotification({
            type: 'analysis_completed' as AppNotificationType,
            title: 'Credit analysis completed',
            message: 'Your latest statement has been scored. Review your updated readiness score.',
            run_id: run.run_id,
          });
          try {
            const detail = await getRunStatus(run.run_id);
            if (detail.advisory_report) {
              pushNotification({
                type: 'recommendation_ready',
                title: 'AI recommendations ready',
                message: detail.advisory_report.summary.slice(0, 110),
                run_id: run.run_id,
              });
            }
            const readyLender = detail.scores?.find((s) => s.is_ready);
            if (readyLender) {
              pushNotification({
                type: 'lender_match',
                title: 'New lender match found',
                message: `You now meet the criteria for ${readyLender.lender_name}.`,
                run_id: run.run_id,
              });
            }
          } catch {
            // Non-fatal — the primary "analysis completed" notification already fired.
          }
        } else if (run.status === 'failed') {
          pushNotification({
            type: 'analysis_failed',
            title: 'Credit analysis failed',
            message: 'We could not finish scoring your last statement. Try uploading it again.',
            run_id: run.run_id,
          });
        }
      }
      if (user) {
        localStorage.setItem(seenKey(user.business_id), JSON.stringify(Object.fromEntries(seenStatuses.current)));
      }
    } catch {
      // Silent — notifications are best-effort and shouldn't surface errors of their own.
    }
  }, [user, pushNotification]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, [status, poll]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, [persist]);

  const notifyUploaded = useCallback(
    (fileName: string) => {
      pushNotification({
        type: 'document_uploaded',
        title: 'Statement uploaded',
        message: `${fileName} was uploaded and queued for AI analysis.`,
      });
    },
    [pushNotification]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, clearAll, notifyUploaded }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
