import { useCallback, useEffect, useState } from 'react';
import { listRuns, getRunStatus } from '../lib/api';
import type { PipelineRunStatus, RunSummary } from '../types';

export interface RunHistoryRow extends RunSummary {
  bestScore: number | null;
}

export function useRunHistory() {
  const [rows, setRows] = useState<RunHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const runs = await listRuns();
      const withScores = await Promise.all(
        runs.map(async (r) => {
          if (r.status !== 'completed') return { ...r, bestScore: null };
          try {
            const detail = await getRunStatus(r.run_id);
            const best = detail.scores?.length ? Math.max(...detail.scores.map((s) => s.overall_score)) : null;
            return { ...r, bestScore: best };
          } catch {
            return { ...r, bestScore: null };
          }
        })
      );
      setRows(withScores);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load analysis history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error, refresh: load };
}

export async function fetchRunDetail(runId: string): Promise<PipelineRunStatus> {
  return getRunStatus(runId);
}
