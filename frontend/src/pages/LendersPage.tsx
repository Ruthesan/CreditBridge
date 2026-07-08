import { useEffect, useState } from 'react';
import { Landmark, X } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { LenderCard, scoreForLender } from '../components/lenders/LenderCard';
import { listLenders } from '../lib/api';
import { useLatestRun } from '../hooks/useRuns';
import type { LenderProfile } from '../types';
import { metricLabel } from '../lib/utils';

export default function LendersPage() {
  const [lenders, setLenders] = useState<LenderProfile[]>([]);
  const [loadingLenders, setLoadingLenders] = useState(true);
  const [lenderError, setLenderError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const { latestRun, loading: loadingRun } = useLatestRun();
  const scores = latestRun?.status === 'completed' ? latestRun.scores ?? [] : [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingLenders(true);
      try {
        const data = await listLenders();
        if (!cancelled) setLenders(data);
      } catch (e) {
        if (!cancelled) setLenderError(e instanceof Error ? e.message : 'Could not load lenders.');
      } finally {
        if (!cancelled) setLoadingLenders(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSelect(lenderId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(lenderId) ? next.delete(lenderId) : next.add(lenderId);
      return next;
    });
  }

  const loading = loadingLenders || loadingRun;
  const selectedLenders = lenders.filter((l) => selected.has(l.lender_id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lender comparison"
        description="See exactly how your business stacks up against each lender's real scoring criteria."
        action={
          selected.size > 0 && (
            <Button variant="outline" onClick={() => setCompareOpen(true)}>
              Compare {selected.size} selected
            </Button>
          )
        }
      />

      {lenderError && <Alert variant="danger" title="Could not load lenders">{lenderError}</Alert>}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : lenders.length === 0 ? (
        <EmptyState icon={<Landmark size={24} />} title="No lenders configured" description="Check back soon — lender profiles are being added." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lenders.map((lender, i) => (
            <LenderCard
              key={lender.lender_id}
              lender={lender}
              score={scoreForLender(scores, lender.lender_id)}
              selected={selected.has(lender.lender_id)}
              onToggleSelect={() => toggleSelect(lender.lender_id)}
              index={i}
            />
          ))}
        </div>
      )}

      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Side-by-side comparison"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="py-2 pr-4 text-xs font-semibold uppercase text-ink-secondary">Metric</th>
                {selectedLenders.map((l) => (
                  <th key={l.lender_id} className="py-2 pr-4 text-xs font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      {l.lender_name}
                      <button onClick={() => toggleSelect(l.lender_id)} aria-label={`Remove ${l.lender_name}`}>
                        <X size={13} className="text-ink-secondary" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4 font-medium text-ink-secondary">Approval threshold</td>
                {selectedLenders.map((l) => (
                  <td key={l.lender_id} className="stat-font py-2.5 pr-4 font-semibold text-ink">{l.approval_threshold}</td>
                ))}
              </tr>
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4 font-medium text-ink-secondary">Your score</td>
                {selectedLenders.map((l) => {
                  const s = scoreForLender(scores, l.lender_id);
                  return (
                    <td key={l.lender_id} className="py-2.5 pr-4">
                      {s ? (
                        <Badge tone={s.is_ready ? 'success' : 'danger'}>{Math.round(s.overall_score)}</Badge>
                      ) : (
                        <span className="text-ink-secondary">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              {Array.from(new Set(selectedLenders.flatMap((l) => l.criteria.map((c) => c.metric)))).map((metric) => (
                <tr key={metric} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-ink-secondary">{metricLabel(metric)} target</td>
                  {selectedLenders.map((l) => {
                    const c = l.criteria.find((cr) => cr.metric === metric);
                    return (
                      <td key={l.lender_id} className="stat-font py-2.5 pr-4 text-ink">
                        {c ? c.target : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
