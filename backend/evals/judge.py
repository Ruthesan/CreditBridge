"""
Day 6 — LLM-as-judge, used only for the advisor agent's generative output.
Deterministic agents (intake, analysis, scoring) never go through this path
— exact-match / tolerance checks in checks.py handle those. Conflating the
two produces either false confidence on math or unfair rigidity on language.
"""
import json
from evals.golden_cases import GoldenCase
from evals.checks import CheckResult
from app.llm_client import call_claude_json, is_mock_mode

JUDGE_SYSTEM_PROMPT = """You are grading an AI-generated financial advisory report against a rubric.
For each rubric item, respond with pass/fail and one sentence of justification.
Be strict: a vague or generic statement does not satisfy a specific rubric requirement.
Respond only with JSON: {"results": [{"criterion": "...", "passed": true/false, "reason": "..."}]}"""


def _mock_judge(rubric: list[str], report: dict) -> dict:
    """Deterministic keyword-based stand-in judge for mock mode."""
    summary = (report.get("summary", "") + " " + " ".join(
        a.get("action", "") for a in report.get("improvement_actions", [])
    )).lower()
    results = []
    for criterion in rubric:
        keywords = [w for w in ["volatil", "inconsist", "season", "ready", "close", "qualif", "data quality"]
                    if w in criterion.lower()]
        passed = any(k in summary for k in keywords) if keywords else True
        results.append({"criterion": criterion, "passed": passed, "reason": "mock keyword match"})
    return {"results": results}


def check_advisor(case: GoldenCase, report: dict | None) -> list[CheckResult]:
    if not case.expected_advisor_rubric:
        return []
    if report is None:
        return [CheckResult(case.case_id, "advisor_ran", False, "no report generated")]

    if is_mock_mode():
        judged = _mock_judge(case.expected_advisor_rubric, report)
    else:
        judged = call_claude_json(
            JUDGE_SYSTEM_PROMPT,
            f"Rubric:\n{json.dumps(case.expected_advisor_rubric)}\n\nReport to grade:\n{json.dumps(report)}",
            max_tokens=1000,
        )

    return [
        CheckResult(case.case_id, f"advisor_rubric_{i}", r["passed"], r["reason"])
        for i, r in enumerate(judged["results"])
    ]
