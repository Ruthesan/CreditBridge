import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Preferences {
  inAppNotifications: boolean;
}

const DEFAULTS: Preferences = { inAppNotifications: true };

function key(businessId: string) {
  return `creditbridge_prefs_${businessId}`;
}

export function readPreferences(businessId: string): Preferences {
  try {
    const raw = localStorage.getItem(key(businessId));
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function usePreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    if (user) setPrefs(readPreferences(user.business_id));
  }, [user]);

  const update = useCallback(
    (patch: Partial<Preferences>) => {
      if (!user) return;
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        localStorage.setItem(key(user.business_id), JSON.stringify(next));
        return next;
      });
    },
    [user]
  );

  return { prefs, update };
}
