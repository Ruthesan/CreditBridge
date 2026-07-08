import { useCallback, useEffect, useState } from 'react';
import type { PipelineRunStatus, RunSummary } from '../types';
import { listRuns, getRunStatus } from '../lib/api';

interface UseLatestRunResult {
  runs: RunSummary[];
  latestRun: PipelineRunStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Fetches the run list and the full detail of the most recent run. */
export function useLatestRun(): UseLatestRunResult {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [latestRun, setLatestRun] = useState<PipelineRunStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listRuns();
      setRuns(list);
      if (list.length > 0) {
        const detail = await getRunStatus(list[0].run_id);
        setLatestRun(detail);
      } else {
        setLatestRun(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your analysis data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { runs, latestRun, loading, error, refresh };
}

/** Most recent run whose pipeline finished successfully (has scores to show). */
export function latestCompletedRun(runsDetail: PipelineRunStatus | null): PipelineRunStatus | null {
  if (!runsDetail || runsDetail.status !== 'completed') return null;
  return runsDetail;
}
