"""
Lender scoring rubrics as data, not code. Add a fourth or fifth lender by
appending a LenderProfile — the scoring engine never changes.
"""
from app.models import LenderProfile, ScoringCriterion

LENDER_PROFILES: list[LenderProfile] = [
    LenderProfile(
        lender_id="mfi_community",
        lender_name="Community Microfinance",
        lender_type="microfinance",
        criteria=[
            ScoringCriterion(metric="net_cash_flow", weight=0.30, direction="higher_better", min_acceptable=0, target=200_000),
            ScoringCriterion(metric="cash_flow_volatility", weight=0.15, direction="lower_better", target=50_000),
            ScoringCriterion(metric="data_quality_score", weight=0.15, direction="higher_better", min_acceptable=0.5, target=0.9),
            ScoringCriterion(metric="revenue_trend_pct", weight=0.20, direction="higher_better", target=10),
            ScoringCriterion(metric="expense_to_revenue_ratio", weight=0.20, direction="lower_better", target=0.7),
        ],
        approval_threshold=55,
    ),
    LenderProfile(
        lender_id="bank_tier1",
        lender_name="Tier 1 Commercial Bank",
        lender_type="commercial_bank",
        criteria=[
            ScoringCriterion(metric="net_cash_flow", weight=0.25, direction="higher_better", min_acceptable=100_000, target=800_000),
            ScoringCriterion(metric="cash_flow_volatility", weight=0.25, direction="lower_better", target=20_000),
            ScoringCriterion(metric="data_quality_score", weight=0.15, direction="higher_better", min_acceptable=0.8, target=0.95),
            ScoringCriterion(metric="revenue_trend_pct", weight=0.15, direction="higher_better", target=15),
            ScoringCriterion(metric="expense_to_revenue_ratio", weight=0.20, direction="lower_better", target=0.5),
        ],
        approval_threshold=75,
    ),
    LenderProfile(
        lender_id="digital_lender",
        lender_name="Digital Micro-lender",
        lender_type="digital_lender",
        criteria=[
            ScoringCriterion(metric="net_cash_flow", weight=0.40, direction="higher_better", min_acceptable=0, target=100_000),
            ScoringCriterion(metric="revenue_trend_pct", weight=0.35, direction="higher_better", target=5),
            ScoringCriterion(metric="data_quality_score", weight=0.25, direction="higher_better", min_acceptable=0.4, target=0.8),
        ],
        approval_threshold=45,
    ),
]
