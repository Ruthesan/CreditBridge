from dataclasses import dataclass
from evals.golden_cases import GoldenCase


@dataclass
class CheckResult:
    case_id: str
    check_name: str
    passed: bool
    detail: str


def check_intake(case: GoldenCase, intake: dict | None) -> list[CheckResult]:
    if intake is None:
        return [CheckResult(case.case_id, "intake_ran", False, "no intake result produced")]
    flagged = intake.get("total_rows_flagged", 0)
    passed = flagged >= case.expected_intake_flagged_min
    return [CheckResult(
        case.case_id, "intake_flagged_rows", passed,
        f"expected >= {case.expected_intake_flagged_min} flagged rows, got {flagged}",
    )]


def check_analysis(case: GoldenCase, profile: dict | None) -> list[CheckResult]:
    results = []
    exp = case.expected_analysis

    if exp.get("should_halt_pipeline"):
        passed = profile is None
        results.append(CheckResult(
            case.case_id, "pipeline_halted", passed,
            "expected pipeline to halt before analysis" if not passed else "correctly halted",
        ))
        return results

    if not exp:
        return results

    if profile is None:
        results.append(CheckResult(case.case_id, "analysis_ran", False, "profile missing, pipeline halted unexpectedly"))
        return results

    for key, threshold in exp.items():
        metric = key.replace("_max", "").replace("_min", "")
        actual = profile.get(metric)
        if actual is None:
            results.append(CheckResult(case.case_id, f"analysis_{key}", False, f"metric {metric} not found on profile"))
            continue
        passed = actual <= threshold if key.endswith("_max") else actual >= threshold
        results.append(CheckResult(case.case_id, f"analysis_{key}", passed, f"{metric}={actual}, threshold={threshold}"))
    return results


def check_scoring(case: GoldenCase, scores: list[dict] | None) -> list[CheckResult]:
    results = []
    for lender_id, expectations in case.expected_scoring.items():
        score = next((s for s in (scores or []) if s.get("lender_id") == lender_id), None)
        if score is None:
            results.append(CheckResult(case.case_id, f"scoring_{lender_id}_present", False, "no score found"))
            continue
        if "is_ready" in expectations:
            passed = score["is_ready"] == expectations["is_ready"]
            results.append(CheckResult(
                case.case_id, f"scoring_{lender_id}_is_ready", passed,
                f"expected {expectations['is_ready']}, got {score['is_ready']}",
            ))
        if "disqualifying_floors_contains" in expectations:
            target = expectations["disqualifying_floors_contains"]
            passed = target in score.get("disqualifying_floors", [])
            results.append(CheckResult(
                case.case_id, f"scoring_{lender_id}_floor", passed,
                f"expected '{target}' in {score.get('disqualifying_floors')}",
            ))
    return results
