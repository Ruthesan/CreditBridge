import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { CircularGauge } from '../ui/CircularGauge';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { fetchRunDetail } from '../../hooks/useRunHistory';
import type { PipelineRunStatus } from '../../types';
import { formatDateTime, scoreStatusLabel, scoreTone, statusLabel, statusTone } from '../../lib/utils';

export function RunDetailModal({ runId, onClose }: { runId: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<PipelineRunStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRunDetail(runId)
      .then((d) => !cancelled && setDetail(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load this run.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [runId]);

  return (
    <Modal open={!!runId} onClose={onClose} title="Analysis run detail" size="lg">
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {detail && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-secondary">Started {formatDateTime(detail.started_at)}</p>
              <p className="text-xs text-ink-secondary">Completed {formatDateTime(detail.completed_at)}</p>
            </div>
            <Badge tone={statusTone(detail.status)}>{statusLabel(detail.status)}</Badge>
          </div>

          {detail.status === 'failed' && (
            <Alert variant="danger" title={`Failed at: ${detail.failed_at_stage ?? 'unknown stage'}`}>
              {detail.error_message}
            </Alert>
          )}

          {detail.scores && detail.scores.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center rounded-xl bg-surface p-5">
                <CircularGauge value={Math.max(...detail.scores.map((s) => s.overall_score))} size={110} />
                <Badge tone={scoreTone(Math.max(...detail.scores.map((s) => s.overall_score)))} className="mt-3">
                  {scoreStatusLabel(Math.max(...detail.scores.map((s) => s.overall_score)))}
                </Badge>
              </div>
              <div className="space-y-2">
                {detail.scores.map((s) => (
                  <div key={s.lender_id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="font-medium text-ink">{s.lender_name}</span>
                    <span className="stat-font font-semibold text-ink">{Math.round(s.overall_score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.advisory_report && (
            <div className="rounded-xl bg-primary-50 p-4">
              <p className="text-xs font-semibold text-primary-700">AI summary</p>
              <p className="mt-1.5 text-sm text-ink">{detail.advisory_report.summary}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
