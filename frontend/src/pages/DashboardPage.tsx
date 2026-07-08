import { useNavigate } from 'react-router-dom';
import { FileText, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLatestRun } from '../hooks/useRuns';
import { useScoreHistory } from '../hooks/useScoreHistory';
import { WelcomeHero, QuickActions } from '../components/dashboard/WelcomeHero';
import { StatCard } from '../components/dashboard/StatCard';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { CreditScoreTrendChart } from '../components/charts/CreditScoreTrendChart';
import {
  formatDateTime,
  scoreStatusLabel,
  scoreTone,
  timeAgo,
} from '../lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { latestRun, runs, loading, error } = useLatestRun();
  const { points: scoreHistory, loading: historyLoading } = useScoreHistory();
  const navigate = useNavigate();

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return <Alert variant="danger" title="Could not load your dashboard">{error}</Alert>;
  }

  const hasCompletedRun = latestRun?.status === 'completed' && latestRun.scores && latestRun.scores.length > 0;
  const bestScore = hasCompletedRun
    ? Math.max(...latestRun!.scores!.map((s) => s.overall_score))
    : null;
  const dataQuality = latestRun?.financial_profile?.data_quality_score;

  return (
    <div className="space-y-6">
      <WelcomeHero businessName={user?.business_name ?? 'there'} />

      {!hasCompletedRun ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="No analysis yet"
          description="Upload your first bank statement to get a credit readiness score, a financial health breakdown, and AI recommendations tailored to your business."
          action={
            <Button iconRight={<ArrowRight size={16} />} onClick={() => navigate('/app/upload')}>
              Upload your first statement
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Credit readiness score"
              value={
                <div className="flex items-center gap-3">
                  <CircularGauge value={bestScore!} size={72} strokeWidth={7} />
                  <div>
                    <Badge tone={scoreTone(bestScore!)}>{scoreStatusLabel(bestScore!)}</Badge>
                  </div>
                </div>
              }
              delay={0}
            />
            <StatCard
              label="Data quality"
              value={
                <div className="flex items-center gap-3">
                  <CircularGauge value={(dataQuality ?? 0) * 100} size={72} strokeWidth={7} />
                  <p className="text-xs text-ink-secondary max-w-[110px]">
                    Share of transactions clean enough to trust
                  </p>
                </div>
              }
              delay={0.05}
            />
            <StatCard
              label="Latest analysis"
              icon={<Layers size={18} />}
              value={<span className="text-lg">{formatDateTime(latestRun!.completed_at)}</span>}
              action={
                <button
                  onClick={() => navigate('/app/analysis')}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  View details <ArrowRight size={14} />
                </button>
              }
              delay={0.1}
            />
            <StatCard
              label="Documents processed"
              icon={<FileText size={18} />}
              value={runs.length}
              action={
                <button
                  onClick={() => navigate('/app/history')}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  View history <ArrowRight size={14} />
                </button>
              }
              delay={0.15}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Credit score trend"
                subtitle="Average score across all lenders, per analysis run"
                icon={<Sparkles size={18} />}
              />
              {historyLoading ? (
                <div className="h-64 animate-pulse rounded-xl bg-surface" />
              ) : scoreHistory.length > 1 ? (
                <CreditScoreTrendChart data={scoreHistory} />
              ) : (
                <p className="py-12 text-center text-sm text-ink-secondary">
                  Upload more statements over time to see your score trend.
                </p>
              )}
            </Card>

            <Card>
              <CardHeader title="AI summary" icon={<Sparkles size={18} />} />
              {latestRun?.advisory_report ? (
                <>
                  <p className="text-sm leading-relaxed text-ink-secondary">{latestRun.advisory_report.summary}</p>
                  <div className="mt-4 rounded-xl bg-primary-50 p-3">
                    <p className="text-xs font-semibold text-primary-700">Best current match</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{latestRun.advisory_report.best_current_option}</p>
                  </div>
                  <Button
                    variant="ghost"
                    fullWidth
                    className="mt-4"
                    iconRight={<ArrowRight size={15} />}
                    onClick={() => navigate('/app/recommendations')}
                  >
                    View full recommendations
                  </Button>
                </>
              ) : (
                <p className="text-sm text-ink-secondary">No AI summary available for this run yet.</p>
              )}
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader title="Quick actions" subtitle="Jump straight to what you need" />
        <QuickActions />
      </Card>

      {runs.length > 0 && (
        <p className="text-center text-xs text-ink-secondary">
          Last statement processed {timeAgo(runs[0].completed_at ?? runs[0].started_at)}
        </p>
      )}
    </div>
  );
}
