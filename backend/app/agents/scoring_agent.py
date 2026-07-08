"""
Day 3 — Scoring agent.

Job: FinancialHealthProfile in, LoanReadinessScore (one per lender) out.
Fully deterministic — a credit decision needs to be explainable and
reproducible, never a black box. Language and judgment about *why* a score
came out the way it did is the advisor agent's job, not this one's.
"""
from app.models import FinancialHealthProfile, LoanReadinessScore, CriterionResult
from app.agents.lender_profiles import LENDER_PROFILES


def score_against_lender(profile: FinancialHealthProfile, lender) -> LoanReadinessScore:
    breakdown = []
    disqualified = []

    for criterion in lender.criteria:
        raw_value = getattr(profile, criterion.metric)

        passed_floor = True
        if criterion.min_acceptable is not None:
            if criterion.direction == "higher_better" and raw_value < criterion.min_acceptable:
                passed_floor = False
            elif criterion.direction == "lower_better" and raw_value > criterion.min_acceptable:
                passed_floor = False

        if not passed_floor:
            disqualified.append(criterion.metric)
            normalized = 0.0
        else:
            if criterion.direction == "higher_better":
                normalized = min(100.0, max(0.0, (raw_value / criterion.target) * 100)) if criterion.target != 0 else 100.0
            else:
                normalized = min(100.0, max(0.0, (criterion.target / raw_value) * 100)) if raw_value > 0 else 100.0

        breakdown.append(CriterionResult(
            metric=criterion.metric,
            raw_value=raw_value,
            normalized_score=round(normalized, 1),
            weight=criterion.weight,
            passed_floor=passed_floor,
        ))

    overall = sum(c.normalized_score * c.weight for c in breakdown)

    return LoanReadinessScore(
        business_id=profile.business_id,
        lender_id=lender.lender_id,
        lender_name=lender.lender_name,
        lender_type=lender.lender_type,
        overall_score=round(overall, 1),
        is_ready=(overall >= lender.approval_threshold and not disqualified),
        criterion_breakdown=breakdown,
        disqualifying_floors=disqualified,
    )


def run_scoring_agent(profile: FinancialHealthProfile) -> list[LoanReadinessScore]:
    return [score_against_lender(profile, lender) for lender in LENDER_PROFILES]
