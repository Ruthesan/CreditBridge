import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Download, Share2, FileBarChart2, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { CashFlowChart, RevenueTrendChart } from '../components/charts/FinancialCharts';
import { useLatestRun } from '../hooks/useRuns';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatDateTime, scoreStatusLabel, scoreTone } from '../lib/utils';

export default function ReportsPage() {
  const { latestRun, loading, error } = useLatestRun();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  if (loading) return <DashboardSkeleton />;
  if (error) return <Alert variant="danger" title="Could not load your report">{error}</Alert>;

  const hasReport = latestRun?.status === 'completed' && latestRun.scores && latestRun.scores.length > 0;

  if (!hasReport) {
    return (
      <EmptyState
        icon={<FileBarChart2 size={24} />}
        title="No report available yet"
        description="Upload a statement to generate your first credit readiness report."
        action={<Button iconRight={<ArrowRight size={16} />} onClick={() => navigate('/app/upload')}>Upload a statement</Button>}
      />
    );
  }

  const bestScore = Math.max(...latestRun!.scores!.map((s) => s.overall_score));
  const profile = latestRun!.financial_profile;
  const report = latestRun!.advisory_report;

  // Both "Download PDF" and "Print" use the browser's native print pipeline
  // against a dedicated print stylesheet (see index.css / @media print) —
  // there is no server-side PDF renderer in the backend to call instead.
  function handlePrintOrDownload() {
    window.print();
  }

  async function handleShare() {
    const shareText = `${user?.business_name} — CreditBridge readiness score: ${Math.round(bestScore)}/100`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CreditBridge Report', text: shareText });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard', 'Report summary copied — paste it anywhere to share.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={`Generated from your statement processed ${formatDateTime(latestRun!.completed_at)}`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" icon={<Share2 size={16} />} onClick={handleShare}>Share</Button>
            <Button variant="outline" icon={<Printer size={16} />} onClick={handlePrintOrDownload}>Print</Button>
            <Button icon={<Download size={16} />} onClick={handlePrintOrDownload}>Download PDF</Button>
          </div>
        }
      />

      <div ref={reportRef} className="space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8 print:border-0 print:p-0">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-line pb-6 sm:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CreditBridge Report</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{user?.business_name}</h2>
            <p className="mt-0.5 text-sm text-ink-secondary">Generated {formatDateTime(latestRun!.completed_at)}</p>
          </div>
          <CircularGauge value={bestScore} size={110} label="/ 100" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Executive summary</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{report?.summary}</p>
          {report?.best_current_option && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2">
              <span className="text-xs font-semibold text-primary-700">Best current match:</span>
              <span className="text-sm font-bold text-ink">{report.best_current_option}</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Lender scores</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {latestRun!.scores!.map((s) => (
              <div key={s.lender_id} className="rounded-xl border border-line p-4">
                <p className="text-sm font-semibold text-ink">{s.lender_name}</p>
                <p className="stat-font mt-1 text-2xl font-bold text-ink">{Math.round(s.overall_score)}</p>
                <Badge tone={scoreTone(s.overall_score)} className="mt-2">{scoreStatusLabel(s.overall_score)}</Badge>
              </div>
            ))}
          </div>
        </div>

        {profile && profile.monthly_summaries.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink mb-2">Cash flow</h3>
              <CashFlowChart data={profile.monthly_summaries} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink mb-2">Revenue trend</h3>
              <RevenueTrendChart data={profile.monthly_summaries} />
            </div>
          </div>
        )}

        {report && report.improvement_actions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink">Top recommendations</h3>
            <ol className="mt-3 space-y-2">
              {[...report.improvement_actions]
                .sort((a, b) => a.priority - b.priority)
                .slice(0, 5)
                .map((a) => (
                  <li key={a.priority} className="flex gap-3 rounded-xl bg-surface p-3 text-sm">
                    <span className="stat-font font-bold text-primary">{a.priority}</span>
                    <div>
                      <p className="font-medium text-ink">{a.action}</p>
                      <p className="text-xs text-ink-secondary mt-0.5">Estimated impact: {a.estimated_impact}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        )}

        {report?.disclaimer && <p className="border-t border-line pt-4 text-xs text-ink-secondary">{report.disclaimer}</p>}
      </div>
    </div>
  );
}
