"""
Runs every golden case through the full pipeline and prints a pass/fail
report. Run with: python -m evals.run_evals
"""
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.orchestrator import run_pipeline
from evals.golden_cases import GOLDEN_CASES
from evals.checks import check_intake, check_analysis, check_scoring, CheckResult
from evals.judge import check_advisor


async def run_eval_suite() -> dict:
    all_results: list[CheckResult] = []

    for case in GOLDEN_CASES:
        run = await run_pipeline(case.raw_csv_text, business_id=f"eval_{case.case_id}", trigger_type="manual")

        all_results += check_intake(case, run.intake_result)
        all_results += check_analysis(case, run.financial_profile)
        all_results += check_scoring(case, run.scores)
        all_results += check_advisor(case, run.advisory_report)

    passed = sum(1 for r in all_results if r.passed)
    failed = [r for r in all_results if not r.passed]

    return {
        "total_checks": len(all_results),
        "passed": passed,
        "failed": len(failed),
        "pass_rate": round(passed / len(all_results), 3) if all_results else 0,
        "failures": [{"case": r.case_id, "check": r.check_name, "detail": r.detail} for r in failed],
    }


def main():
    report = asyncio.run(run_eval_suite())
    print(f"\n{'='*60}")
    print(f"CreditBridge eval suite: {report['passed']}/{report['total_checks']} checks passed "
          f"({report['pass_rate']*100:.1f}%)")
    print(f"{'='*60}\n")
    if report["failures"]:
        print("FAILURES:")
        for f in report["failures"]:
            print(f"  [{f['case']}] {f['check']}: {f['detail']}")
        print()
    else:
        print("All checks passed.\n")
    sys.exit(1 if report["failures"] else 0)


if __name__ == "__main__":
    main()
