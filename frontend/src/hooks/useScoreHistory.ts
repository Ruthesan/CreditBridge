import { useEffect, useState } from 'react';
import { listRuns, getRunStatus } from '../lib/api';

export interface ScoreHistoryPoint {
  run_id: string;
  date: string;
  label: string;
  averageScore: number;
  bestScore: number;
}

/**
 * Derives a credit-score trend by fetching each completed run's scores and
 * averaging across lenders. There is no dedicated "score history" endpoint
 * (see DECISIONS.md) — this reconstructs the trend from real run records
 * rather than inventing time-series data.
 */
export function useScoreHistory() {
  const [points, setPoints] = useState<ScoreHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const runs = await listRuns();
        const completed = runs.filter((r) => r.status === 'completed').slice(0, 12).reverse();
        const details = await Promise.all(completed.map((r) => getRunStatus(r.run_id)));
        if (cancelled) return;
        const derived: ScoreHistoryPoint[] = details
          .filter((d) => d.scores && d.scores.length > 0)
          .map((d) => {
            const scores = d.scores!.map((s) => s.overall_score);
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const date = d.completed_at ?? d.started_at;
            return {
              run_id: d.run_id,
              date,
              label: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              averageScore: Math.round(avg * 10) / 10,
              bestScore: Math.round(Math.max(...scores) * 10) / 10,
            };
          });
        setPoints(derived);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { points, loading };
}
