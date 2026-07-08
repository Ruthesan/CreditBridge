"""
Pydantic schemas shared across agents. These are the data contracts: every
agent downstream of intake trusts this shape without re-validating it.
"""
from __future__ import annotations
from datetime import date, datetime
from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel, Field, EmailStr


# ---------------------------------------------------------------------------
# Auth / tenancy
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    business_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    business_id: str
    email: str
    business_name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------------
# Day 1 — Intake
# ---------------------------------------------------------------------------

class TransactionType(str, Enum):
    credit = "credit"
    debit = "debit"


class Transaction(BaseModel):
    date: date
    amount_naira: float = Field(..., gt=0)
    type: TransactionType
    description: str
    source_row_confidence: float = Field(..., ge=0, le=1)


class FlaggedRow(BaseModel):
    raw_content: str
    reason: str


class IntakeResult(BaseModel):
    business_id: str
    statement_period_start: date
    statement_period_end: date
    transactions: list[Transaction]
    flagged_rows: list[FlaggedRow]
    total_rows_processed: int
    total_rows_flagged: int


# ---------------------------------------------------------------------------
# Day 2 — Analysis
# ---------------------------------------------------------------------------

class MonthlySummary(BaseModel):
    month: str
    total_credits: float
    total_debits: float
    net_flow: float
    transaction_count: int


class FinancialHealthProfile(BaseModel):
    business_id: str
    period_start: date
    period_end: date
    total_credits: float
    total_debits: float
    net_cash_flow: float
    cash_flow_volatility: float
    revenue_trend_pct: float
    expense_to_revenue_ratio: float
    monthly_summaries: list[MonthlySummary]
    data_quality_score: float
    excluded_transaction_count: int


# ---------------------------------------------------------------------------
# Day 3 — Scoring
# ---------------------------------------------------------------------------

class ScoringCriterion(BaseModel):
    metric: str
    weight: float
    direction: Literal["higher_better", "lower_better"]
    min_acceptable: Optional[float] = None
    target: float


class LenderProfile(BaseModel):
    lender_id: str
    lender_name: str
    lender_type: Literal["microfinance", "commercial_bank", "digital_lender"]
    criteria: list[ScoringCriterion]
    approval_threshold: float


class CriterionResult(BaseModel):
    metric: str
    raw_value: float
    normalized_score: float
    weight: float
    passed_floor: bool


class LoanReadinessScore(BaseModel):
    business_id: str
    lender_id: str
    lender_name: str
    lender_type: str
    overall_score: float
    is_ready: bool
    criterion_breakdown: list[CriterionResult]
    disqualifying_floors: list[str]


# ---------------------------------------------------------------------------
# Day 4 — Advisor + orchestrator
# ---------------------------------------------------------------------------

class ImprovementAction(BaseModel):
    priority: int
    action: str
    target_metric: str
    estimated_impact: str


class AdvisoryReport(BaseModel):
    business_id: str
    summary: str
    best_current_option: str
    improvement_actions: list[ImprovementAction]
    disclaimer: str


class PipelineStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"


class PipelineRun(BaseModel):
    run_id: str
    business_id: str
    status: PipelineStatus
    trigger_type: Literal["upload", "scheduled", "manual"] = "manual"
    started_at: datetime
    completed_at: Optional[datetime] = None
    failed_at_stage: Optional[str] = None
    intake_result: Optional[dict] = None
    financial_profile: Optional[dict] = None
    scores: Optional[list[dict]] = None
    advisory_report: Optional[dict] = None
    error_message: Optional[str] = None
