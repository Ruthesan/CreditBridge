"""
Day 2 — Analysis agent.

Job: IntakeResult in, FinancialHealthProfile out. Pure computation, no LLM.
Financial ratios must be deterministic and auditable — an LLM "estimate" of
a debt ratio isn't defensible when it drives a real lending decision.
"""
import pandas as pd
from app.config import settings
from app.models import IntakeResult, FinancialHealthProfile, MonthlySummary


def run_analysis_agent(intake: IntakeResult) -> FinancialHealthProfile:
    if not intake.transactions:
        raise ValueError("No parseable transactions — cannot compute financial profile")

    df = pd.DataFrame([t.model_dump() for t in intake.transactions])

    # Judgment call: exclude low-confidence rows from the math, but track how many
    trusted = df[df["source_row_confidence"] >= settings.INTAKE_CONFIDENCE_THRESHOLD].copy()
    excluded_count = len(df) - len(trusted)

    if trusted.empty:
        raise ValueError("No transactions met the confidence threshold — cannot compute financial profile")

    trusted["date"] = pd.to_datetime(trusted["date"])
    trusted["month"] = trusted["date"].dt.to_period("M").astype(str)

    credits = trusted[trusted["type"] == "credit"]
    debits = trusted[trusted["type"] == "debit"]

    total_credits = float(credits["amount_naira"].sum())
    total_debits = float(debits["amount_naira"].sum())
    net_cash_flow = total_credits - total_debits

    monthly = trusted.groupby("month").apply(
        lambda g: pd.Series({
            "total_credits": g[g["type"] == "credit"]["amount_naira"].sum(),
            "total_debits": g[g["type"] == "debit"]["amount_naira"].sum(),
            "transaction_count": len(g),
        }),
        include_groups=False,
    ).reset_index()
    monthly["net_flow"] = monthly["total_credits"] - monthly["total_debits"]

    monthly_summaries = [
        MonthlySummary(
            month=row["month"],
            total_credits=float(row["total_credits"]),
            total_debits=float(row["total_debits"]),
            net_flow=float(row["net_flow"]),
            transaction_count=int(row["transaction_count"]),
        )
        for _, row in monthly.iterrows()
    ]

    cash_flow_volatility = float(monthly["net_flow"].std()) if len(monthly) > 1 else 0.0
    if pd.isna(cash_flow_volatility):
        cash_flow_volatility = 0.0

    midpoint = len(monthly) // 2
    if midpoint > 0 and len(monthly) > 1:
        first_half_avg = monthly["total_credits"][:midpoint].mean()
        second_half_avg = monthly["total_credits"][midpoint:].mean()
        revenue_trend_pct = (
            ((second_half_avg - first_half_avg) / first_half_avg * 100)
            if first_half_avg > 0 else 0.0
        )
    else:
        revenue_trend_pct = 0.0

    expense_to_revenue_ratio = (total_debits / total_credits) if total_credits > 0 else 999.0
    data_quality_score = round(len(trusted) / len(df), 2) if len(df) > 0 else 0.0

    return FinancialHealthProfile(
        business_id=intake.business_id,
        period_start=intake.statement_period_start,
        period_end=intake.statement_period_end,
        total_credits=total_credits,
        total_debits=total_debits,
        net_cash_flow=net_cash_flow,
        cash_flow_volatility=round(cash_flow_volatility, 2),
        revenue_trend_pct=round(revenue_trend_pct, 2),
        expense_to_revenue_ratio=round(expense_to_revenue_ratio, 2),
        monthly_summaries=monthly_summaries,
        data_quality_score=data_quality_score,
        excluded_transaction_count=excluded_count,
    )
