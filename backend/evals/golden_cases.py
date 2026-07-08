"""
Day 6 — golden test cases. Each case traces back to a specific judgment call
made in an earlier agent. A case that doesn't map to a design decision isn't
testing anything real.
"""
import os
from dataclasses import dataclass, field

TEST_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_data")


def _load(filename: str) -> str:
    with open(os.path.join(TEST_DATA_DIR, filename)) as f:
        return f.read()


@dataclass
class GoldenCase:
    case_id: str
    description: str
    raw_csv_text: str
    expected_intake_flagged_min: int = 0
    expected_analysis: dict = field(default_factory=dict)
    expected_scoring: dict = field(default_factory=dict)
    expected_advisor_rubric: list[str] = field(default_factory=list)


GOLDEN_CASES: list[GoldenCase] = [
    GoldenCase(
        case_id="clean_steady_trader",
        description="Clean statement, steady monthly income — should score well across lenders",
        raw_csv_text=_load("clean_steady.csv"),
        expected_intake_flagged_min=0,
        expected_analysis={"cash_flow_volatility_max": 30_000, "data_quality_score_min": 0.9},
        expected_scoring={
            "mfi_community": {"is_ready": True},
        },
        expected_advisor_rubric=[
            "acknowledges the business is close to or ready for at least one lender",
        ],
    ),
    GoldenCase(
        case_id="volatile_seasonal_trader",
        description="Big swings between market-day weeks and quiet weeks — volatility must not be flattened by averaging",
        raw_csv_text=_load("seasonal_volatile.csv"),
        expected_intake_flagged_min=0,
        expected_analysis={"cash_flow_volatility_min": 50_000},
        expected_scoring={
            "bank_tier1": {"is_ready": False},
        },
        expected_advisor_rubric=[
            "mentions cash flow volatility, inconsistency, or seasonality as a factor",
        ],
    ),
    GoldenCase(
        case_id="good_average_bad_floor",
        description="Strong average metrics but fails a hard floor (data quality) — must not be hidden by averaging",
        raw_csv_text=_load("mostly_clean_few_garbage_rows.csv"),
        expected_intake_flagged_min=2,
        expected_analysis={"excluded_transaction_count_min": 1},
        expected_scoring={},
        expected_advisor_rubric=[],
    ),
    GoldenCase(
        case_id="mostly_garbage_statement",
        description="Statement quality too poor to trust — pipeline should halt, not produce a confident wrong score",
        raw_csv_text=_load("garbage_statement.csv"),
        expected_intake_flagged_min=5,
        expected_analysis={"should_halt_pipeline": True},
        expected_scoring={},
        expected_advisor_rubric=[],
    ),
]
