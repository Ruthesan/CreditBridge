"""
Day 4 — Advisor agent.

Job: FinancialHealthProfile + LoanReadinessScore[] in, AdvisoryReport out.
The scores are final and correct by the time they reach this agent — it
explains and prioritizes, it never contradicts or re-scores. Keeping
language and judgment separate means the LLM can never quietly override
the deterministic math from Day 3.
"""
from app.llm_client import call_claude_json, is_mock_mode
from app.models import FinancialHealthProfile, LoanReadinessScore, AdvisoryReport, ImprovementAction

DISCLAIMER = (
    "This is automated guidance based on your transaction history. "
    "It does not guarantee loan approval and is not financial advice from a licensed advisor."
)

ADVISOR_SYSTEM_PROMPT = """You are a financial advisor for Nigerian small business owners.
You will be given a business's financial profile and its scores against multiple lenders.
The scores are final and correct — you do not question, soften, or recalculate them.

Your job is to:
1. Summarize the business's financial position in plain, respectful language — no jargon.
2. Identify which lender they are closest to qualifying for right now.
3. Give 2-4 specific, actionable improvement steps, ranked by priority (1 = highest leverage:
   the single change that would improve their score the most, fastest).

Ground every recommendation in the actual numbers you were given — never invent figures.
If a disqualifying floor was missed, address it directly and explain what it means in plain terms.
Be honest but encouraging.

Respond ONLY with valid JSON matching this structure:
{
  "summary": "2-3 sentences",
  "best_current_option": "lender name",
  "improvement_actions": [
    {"priority": 1, "action": "...", "target_metric": "...", "estimated_impact": "..."}
  ]
}"""


def _mock_advisor(profile: FinancialHealthProfile, scores: list[LoanReadinessScore]) -> dict:
    """Deterministic template-based stand-in for local dev / eval runs without an API key."""
    ready_scores = [s for s in scores if s.is_ready]
    best = max(scores, key=lambda s: s.overall_score)
    best_option = best.lender_name if not ready_scores else max(ready_scores, key=lambda s: s.overall_score).lender_name

    actions = []
    priority = 1

    if profile.cash_flow_volatility > 50_000:
        actions.append(ImprovementAction(
            priority=priority,
            action="Your income shows significant cash flow volatility between market-day weeks and quiet weeks. Build a buffer during high-earning weeks to smooth out this inconsistency and stabilize your monthly net flow.",
            target_metric="cash_flow_volatility",
            estimated_impact=f"Reducing this volatility could improve your score with stricter lenders like {LENDER_TIER1_NAME}.",
        ).model_dump())
        priority += 1

    if profile.data_quality_score < 0.9:
        actions.append(ImprovementAction(
            priority=priority,
            action="Use a consistent bank account for all business transactions so your statement is complete and easy to verify.",
            target_metric="data_quality_score",
            estimated_impact="Improving data quality removes a disqualifying floor for stricter lenders.",
        ).model_dump())
        priority += 1

    if profile.expense_to_revenue_ratio > 0.7:
        actions.append(ImprovementAction(
            priority=priority,
            action="Review recurring expenses for the largest reducible cost and cut or renegotiate it.",
            target_metric="expense_to_revenue_ratio",
            estimated_impact="Lowering this ratio directly raises your score across all three lenders.",
        ).model_dump())
        priority += 1

    if profile.revenue_trend_pct < 5:
        actions.append(ImprovementAction(
            priority=priority,
            action="Focus on repeat customers or a small marketing push during your slowest month to build a visible growth trend.",
            target_metric="revenue_trend_pct",
            estimated_impact="A stronger growth trend improves eligibility for the digital micro-lender fastest.",
        ).model_dump())
        priority += 1

    if not actions:
        actions.append(ImprovementAction(
            priority=1,
            action="Keep your current record-keeping and cash flow pattern consistent — you're in a strong position across lenders.",
            target_metric="net_cash_flow",
            estimated_impact="Maintaining this position keeps you qualified as you reapply.",
        ).model_dump())

    disqualified_lenders = [s for s in scores if s.disqualifying_floors]
    if disqualified_lenders:
        names = ", ".join(s.lender_name for s in disqualified_lenders)
        floor_note = f" You are currently disqualified from {names} due to a minimum requirement not being met — see the improvement steps below."
    else:
        floor_note = ""

    volatility_note = (
        " Your cash flow is quite volatile and inconsistent month to month, which is a seasonal pattern "
        "worth addressing."
        if profile.cash_flow_volatility > 50_000 else ""
    )
    summary = (
        f"Your business shows a net cash flow of ₦{profile.net_cash_flow:,.0f} over the statement period. "
        f"You are closest to qualifying with {best_option} right now.{floor_note}{volatility_note}"
    )

    return {
        "summary": summary,
        "best_current_option": best_option,
        "improvement_actions": actions,
    }


LENDER_TIER1_NAME = "Tier 1 Commercial Bank"


def run_advisor_agent(profile: FinancialHealthProfile, scores: list[LoanReadinessScore]) -> AdvisoryReport:
    if is_mock_mode():
        result = _mock_advisor(profile, scores)
    else:
        context = {
            "financial_profile": profile.model_dump(mode="json"),
            "lender_scores": [s.model_dump(mode="json") for s in scores],
        }
        import json
        result = call_claude_json(
            ADVISOR_SYSTEM_PROMPT,
            f"Business financial data and lender scores:\n{json.dumps(context, indent=2)}",
            max_tokens=2000,
        )

    return AdvisoryReport(
        business_id=profile.business_id,
        summary=result["summary"],
        best_current_option=result["best_current_option"],
        improvement_actions=[ImprovementAction(**a) for a in result["improvement_actions"]],
        disclaimer=DISCLAIMER,
    )
