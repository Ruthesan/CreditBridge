import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { UserOut } from '../types';
import * as api from '../lib/api';

interface AuthContextValue {
  user: UserOut | null;
  status: 'checking' | 'authenticated' | 'anonymous';
  error: string | null;
  submitting: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, businessName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.registerUnauthorizedHandler(() => {
      if (!cancelled) {
        setUser(null);
        setStatus('anonymous');
      }
    });

    async function hydrate() {
      const token = api.getToken();
      if (!token) {
        setStatus('anonymous');
        return;
      }
      try {
        const me = await api.fetchMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          api.clearToken();
          setStatus('anonymous');
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      api.setToken(res.access_token);
      setUser(res.user);
      setStatus('authenticated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, businessName: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.registerBusiness(email, password, businessName);
      api.setToken(res.access_token);
      setUser(res.user);
      setStatus('authenticated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, status, error, submitting, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
