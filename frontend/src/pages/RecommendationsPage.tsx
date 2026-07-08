import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { useLatestRun } from '../hooks/useRuns';
import { useAuth } from '../contexts/AuthContext';

function completionKey(businessId: string, runId: string) {
  return `creditbridge_completed_actions_${businessId}_${runId}`;
}

export default function RecommendationsPage() {
  const { latestRun, loading, error } = useLatestRun();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user || !latestRun) return;
    const raw = localStorage.getItem(completionKey(user.business_id, latestRun.run_id));
    setCompleted(raw ? new Set(JSON.parse(raw)) : new Set());
  }, [user, latestRun]);

  function toggle(priority: number) {
    if (!user || !latestRun) return;
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(priority) ? next.delete(priority) : next.add(priority);
      localStorage.setItem(completionKey(user.business_id, latestRun.run_id), JSON.stringify([...next]));
      return next;
    });
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return <Alert variant="danger" title="Could not load recommendations">{error}</Alert>;

  const report = latestRun?.status === 'completed' ? latestRun.advisory_report : null;

  if (!report || report.improvement_actions.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={24} />}
        title="No recommendations yet"
        description="Upload a bank statement to get AI-generated, prioritized recommendations grounded in your numbers."
        action={<Button iconRight={<ArrowRight size={16} />} onClick={() => navigate('/app/upload')}>Upload a statement</Button>}
      />
    );
  }

  const doneCount = report.improvement_actions.filter((a) => completed.has(a.priority)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Recommendations"
        title="Your prioritized action plan"
        description={`${doneCount} of ${report.improvement_actions.length} actions completed`}
      />

      <Card>
        <p className="text-sm leading-relaxed text-ink-secondary">{report.summary}</p>
      </Card>

      <div className="space-y-4">
        {[...report.improvement_actions]
          .sort((a, b) => a.priority - b.priority)
          .map((action, i) => (
            <RecommendationCard
              key={action.priority}
              action={action}
              index={i}
              completed={completed.has(action.priority)}
              onToggleComplete={() => toggle(action.priority)}
            />
          ))}
      </div>

      <Alert variant="warning" title="Important disclaimer">
        <div className="flex items-start gap-2">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          <span>{report.disclaimer}</span>
        </div>
      </Alert>
    </div>
  );
}
