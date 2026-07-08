import { type ClassValue, clsx } from 'clsx';
import type { PipelineStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatNaira(value: number): string {
  return nairaFormatter.format(value);
}

export function formatCompactNaira(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}₦${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₦${abs.toFixed(0)}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDate(value: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return '—';
  const diffMs = Date.now() - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const METRIC_LABELS: Record<string, string> = {
  net_cash_flow: 'Net cash flow',
  cash_flow_volatility: 'Cash flow volatility',
  data_quality_score: 'Data quality',
  revenue_trend_pct: 'Revenue trend',
  expense_to_revenue_ratio: 'Expense-to-revenue ratio',
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  net_cash_flow: 'Total money in minus total money out across the statement period. The clearest single signal of repayment capacity.',
  cash_flow_volatility: 'How much monthly cash flow swings up and down. Lenders read high volatility as unpredictable income.',
  data_quality_score: 'Share of transactions that were clean enough to trust. Low quality means more guesswork in every other number.',
  revenue_trend_pct: 'Whether monthly credits are growing, flat, or shrinking over the period — a proxy for business momentum.',
  expense_to_revenue_ratio: 'How much of every naira coming in goes straight back out. Lower means fatter margins.',
};

export function metricLabel(metric: string): string {
  return METRIC_LABELS[metric] ?? metric.replace(/_/g, ' ');
}

export function metricDescription(metric: string): string {
  return METRIC_DESCRIPTIONS[metric] ?? 'A component of the overall loan-readiness score.';
}

// The five criterion "categories" referenced throughout the product surface
// (Profitability, Cash Flow, Leverage, Business Performance, Financial History)
// are a presentation grouping over the five real, backend-computed metrics —
// not separate figures invented on the frontend. See DECISIONS.md.
const METRIC_CATEGORY: Record<string, string> = {
  net_cash_flow: 'Cash Flow',
  cash_flow_volatility: 'Financial History',
  data_quality_score: 'Business Performance',
  revenue_trend_pct: 'Profitability',
  expense_to_revenue_ratio: 'Leverage',
};

export function metricCategory(metric: string): string {
  return METRIC_CATEGORY[metric] ?? 'General';
}

export function statusLabel(status: PipelineStatus): string {
  switch (status) {
    case 'pending': return 'Queued';
    case 'in_progress': return 'Processing';
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    default: return status;
  }
}

export function statusTone(status: PipelineStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'warning';
    case 'pending': return 'neutral';
    case 'failed': return 'danger';
    default: return 'neutral';
  }
}

export function scoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success';
  if (score >= 45) return 'warning';
  return 'danger';
}

export function scoreStatusLabel(score: number): string {
  if (score >= 75) return 'Excellent standing';
  if (score >= 60) return 'Good standing';
  if (score >= 45) return 'Needs improvement';
  return 'At risk';
}

export function readableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
