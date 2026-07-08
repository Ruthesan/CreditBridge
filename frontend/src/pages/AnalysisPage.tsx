import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Wallet, ArrowRight, FileSearch } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { CriterionBreakdown } from '../components/analysis/CriterionBreakdown';
import { CashFlowChart, RevenueTrendChart } from '../components/charts/FinancialCharts';
import { CreditScoreTrendChart } from '../components/charts/CreditScoreTrendChart';
import { useLatestRun } from '../hooks/useRuns';
import { useScoreHistory } from '../hooks/useScoreHistory';
import { formatCompactNaira, formatDateTime, scoreStatusLabel, scoreTone } from '../lib/utils';

export default function AnalysisPage() {
  const { latestRun, loading, error } = useLatestRun();
  const { points: scoreHistory } = useScoreHistory();
  const navigate = useNavigate();
  const [selectedLenderId, setSelectedLenderId] = useState<string | null>(null);

  if (loading) return <DashboardSkeleton />;
  if (error) return <Alert variant="danger" title="Could not load your analysis">{error}</Alert>;

  const hasScores = latestRun?.status === 'completed' && latestRun.scores && latestRun.scores.length > 0;

  if (!hasScores) {
    return (
      <EmptyState
        icon={<FileSearch size={24} />}
        title="No credit analysis yet"
        description="Upload a bank statement to generate your first credit readiness breakdown."
        action={<Button iconRight={<ArrowRight size={16} />} onClick={() => navigate('/app/upload')}>Upload a statement</Button>}
      />
    );
  }

  const scores = latestRun!.scores!;
  const activeLenderId = selectedLenderId ?? scores[0].lender_id;
  const activeScore = scores.find((s) => s.lender_id === activeLenderId) ?? scores[0];
  const profile = latestRun!.financial_profile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit analysis"
        description={`Based on your statement processed ${formatDateTime(latestRun!.completed_at)}`}
        action={
          <Tabs
            tabs={scores.map((s) => ({ key: s.lender_id, label: s.lender_name }))}
            value={activeLenderId}
            onChange={setSelectedLenderId}
          />
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center lg:col-span-1">
          <CircularGauge value={activeScore.overall_score} size={180} label="/ 100" />
          <Badge tone={scoreTone(activeScore.overall_score)} className="mt-4">
            {scoreStatusLabel(activeScore.overall_score)}
          </Badge>
          <Badge tone={activeScore.is_ready ? 'success' : 'neutral'} className="mt-2">
            {activeScore.is_ready ? 'Meets lender criteria' : 'Not yet ready for this lender'}
          </Badge>
          {activeScore.disqualifying_floors.length > 0 && (
            <div className="mt-4 w-full rounded-xl bg-danger-50 p-3 text-left">
              <p className="text-xs font-semibold text-danger-600">Disqualifying issues</p>
              <ul className="mt-1.5 space-y-1">
                {activeScore.disqualifying_floors.map((floor) => (
                  <li key={floor} className="text-xs text-danger-600">• {floor}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="AI summary" subtitle="Business health overview" icon={<Sparkles size={18} />} />
          {latestRun!.advisory_report ? (
            <>
              <p className="text-sm leading-relaxed text-ink-secondary">{latestRun!.advisory_report.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Net cash flow" value={formatCompactNaira(profile?.net_cash_flow ?? 0)} />
                <MiniStat label="Revenue trend" value={`${(profile?.revenue_trend_pct ?? 0).toFixed(1)}%`} />
                <MiniStat label="Expense ratio" value={(profile?.expense_to_revenue_ratio ?? 0).toFixed(2)} />
                <MiniStat label="Volatility" value={(profile?.cash_flow_volatility ?? 0).toFixed(2)} />
              </div>
              <Button
                variant="ghost"
                className="mt-4"
                iconRight={<ArrowRight size={15} />}
                onClick={() => navigate('/app/recommendations')}
              >
                See prioritized recommendations
              </Button>
            </>
          ) : (
            <p className="text-sm text-ink-secondary">No summary available.</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Criterion breakdown" subtitle={`How ${activeScore.lender_name} scores your business`} />
        <CriterionBreakdown criteria={activeScore.criterion_breakdown} />
      </Card>

      {profile && profile.monthly_summaries.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Cash flow trend" subtitle="Monthly credits vs debits" icon={<Wallet size={18} />} />
            <CashFlowChart data={profile.monthly_summaries} />
          </Card>
          <Card>
            <CardHeader title="Revenue trend" subtitle="Net monthly flow" icon={<TrendingUp size={18} />} />
            <RevenueTrendChart data={profile.monthly_summaries} />
          </Card>
        </div>
      )}

      {scoreHistory.length > 1 && (
        <Card>
          <CardHeader title="Score history" subtitle="Average score across lenders over time" />
          <CreditScoreTrendChart data={scoreHistory} />
        </Card>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="text-[11px] font-medium text-ink-secondary">{label}</p>
      <p className="stat-font mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
