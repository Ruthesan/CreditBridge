import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LenderProfile,
  PipelineRunStatus,
  RunSummary,
  UserOut,
} from '../types';

const TOKEN_KEY = 'creditbridge_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: '/',
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * The backend issues a strict 10-minute JWT with no refresh-token endpoint
 * (see backend/app/config.py — ACCESS_TOKEN_EXPIRE_MINUTES, and DECISIONS.md).
 * There is nothing to silently refresh, so a 401 here means the session is
 * genuinely over: clear it and let ProtectedRoute bounce the user to /login,
 * preserving where they were headed.
 */

let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong talking to the server.';
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerBusiness(
  email: string,
  password: string,
  businessName: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    business_name: businessName,
  });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function fetchMe(): Promise<UserOut> {
  const { data } = await api.get<UserOut>('/auth/me');
  return data;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export async function uploadStatement(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ run_id: string; status: string; poll_at?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/webhook/statement-upload', formData, {
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

export async function getRunStatus(runId: string): Promise<PipelineRunStatus> {
  const { data } = await api.get<PipelineRunStatus>(`/pipeline/status/${runId}`);
  return data;
}

export async function listRuns(): Promise<RunSummary[]> {
  const { data } = await api.get<RunSummary[]>('/pipeline/runs');
  return data;
}

export async function listLenders(): Promise<LenderProfile[]> {
  const { data } = await api.get<LenderProfile[]>('/lenders');
  return data;
}

/** Poll a run until it reaches a terminal state (completed / failed). */
export async function pollUntilComplete(
  runId: string,
  {
    intervalMs = 1800,
    timeoutMs = 120_000,
    onTick,
  }: { intervalMs?: number; timeoutMs?: number; onTick?: (s: PipelineRunStatus) => void } = {}
): Promise<PipelineRunStatus> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const status = await getRunStatus(runId);
    onTick?.(status);
    if (status.status === 'completed' || status.status === 'failed') return status;
    if (Date.now() - start > timeoutMs) {
      throw new Error('This is taking longer than expected. Refresh the page in a minute to check progress.');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/** Fetch the most recent run's full detail, or null if the business has never run a statement. */
export async function getLatestRun(): Promise<PipelineRunStatus | null> {
  const runs = await listRuns();
  if (runs.length === 0) return null;
  return getRunStatus(runs[0].run_id);
}
