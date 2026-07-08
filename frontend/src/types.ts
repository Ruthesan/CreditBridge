// These types mirror app/models.py in the backend exactly. Keep them in sync —
// this file is the single source of truth for the shape of every API response
// the frontend consumes.

export interface UserOut {
  business_id: string;
  email: string;
  business_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface FlaggedRow {
  raw_content: string;
  reason: string;
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  date: string;
  amount_naira: number;
  type: TransactionType;
  description: string;
  source_row_confidence: number;
}

export interface IntakeResult {
  business_id: string;
  statement_period_start: string;
  statement_period_end: string;
  transactions: Transaction[];
  flagged_rows: FlaggedRow[];
  total_rows_processed: number;
  total_rows_flagged: number;
}

export interface MonthlySummary {
  month: string;
  total_credits: number;
  total_debits: number;
  net_flow: number;
  transaction_count: number;
}

export interface FinancialHealthProfile {
  business_id: string;
  period_start: string;
  period_end: string;
  total_credits: number;
  total_debits: number;
  net_cash_flow: number;
  cash_flow_volatility: number;
  revenue_trend_pct: number;
  expense_to_revenue_ratio: number;
  monthly_summaries: MonthlySummary[];
  data_quality_score: number;
  excluded_transaction_count: number;
}

export interface CriterionResult {
  metric: string;
  raw_value: number;
  normalized_score: number;
  weight: number;
  passed_floor: boolean;
}

export type LenderType = 'microfinance' | 'commercial_bank' | 'digital_lender';

export interface LoanReadinessScore {
  business_id: string;
  lender_id: string;
  lender_name: string;
  lender_type: LenderType;
  overall_score: number;
  is_ready: boolean;
  criterion_breakdown: CriterionResult[];
  disqualifying_floors: string[];
}

export interface ImprovementAction {
  priority: number;
  action: string;
  target_metric: string;
  estimated_impact: string;
}

export interface AdvisoryReport {
  business_id: string;
  summary: string;
  best_current_option: string;
  improvement_actions: ImprovementAction[];
  disclaimer: string;
}

export type PipelineStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface PipelineRunStatus {
  run_id: string;
  status: PipelineStatus;
  trigger_type: string;
  started_at: string;
  completed_at: string | null;
  failed_at_stage: string | null;
  error_message: string | null;
  intake_result: IntakeResult | null;
  financial_profile: FinancialHealthProfile | null;
  scores: LoanReadinessScore[] | null;
  advisory_report: AdvisoryReport | null;
}

export interface RunSummary {
  run_id: string;
  status: PipelineStatus;
  trigger_type: string;
  started_at: string;
  completed_at: string | null;
}

export interface ScoringCriterion {
  metric: string;
  weight: number;
  direction: 'higher_better' | 'lower_better';
  min_acceptable: number | null;
  target: number;
}

export interface LenderProfile {
  lender_id: string;
  lender_name: string;
  lender_type: LenderType;
  criteria: ScoringCriterion[];
  approval_threshold: number;
}

// ---------------------------------------------------------------------------
// Frontend-only types (derived client-side from real pipeline/run data —
// there is no dedicated backend endpoint for these, see DECISIONS.md)
// ---------------------------------------------------------------------------

export type AppNotificationType =
  | 'analysis_completed'
  | 'analysis_failed'
  | 'document_uploaded'
  | 'recommendation_ready'
  | 'lender_match';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  run_id?: string;
}
