"""
Orchestrator — sequences the four agents, holds run state, and enforces the
one hard-stop guard: if intake quality is too poor to trust, the pipeline
fails loudly instead of handing bad data downstream.
"""
import uuid
from datetime import datetime

from app.config import settings
from app.models import PipelineRun, PipelineStatus
from app.agents.intake_agent import run_intake_agent
from app.agents.analysis_agent import run_analysis_agent
from app.agents.scoring_agent import run_scoring_agent
from app.agents.advisor_agent import run_advisor_agent


def new_run_id(business_id: str) -> str:
    return f"run_{business_id[:8]}_{uuid.uuid4().hex[:8]}"


async def run_pipeline(
    raw_csv_text: str,
    business_id: str,
    trigger_type: str = "manual",
    run_id: str | None = None,
) -> PipelineRun:
    run = PipelineRun(
        run_id=run_id or new_run_id(business_id),
        business_id=business_id,
        status=PipelineStatus.in_progress,
        trigger_type=trigger_type,
        started_at=datetime.utcnow(),
    )

    try:
        # --- Stage 1: Intake ---
        intake_result = run_intake_agent(raw_csv_text, business_id)
        run.intake_result = intake_result.model_dump(mode="json")

        total_rows = intake_result.total_rows_processed + intake_result.total_rows_flagged
        flag_ratio = (intake_result.total_rows_flagged / total_rows) if total_rows > 0 else 1.0

        if total_rows == 0:
            raise ValueError("No rows could be read from the uploaded statement.")

        if flag_ratio > settings.INTAKE_FLAG_RATIO_HALT:
            raise ValueError(
                f"Too many unparseable rows ({intake_result.total_rows_flagged}/{total_rows}) — "
                "statement quality is insufficient to trust an analysis. "
                "Try uploading a clearer export."
            )

        # --- Stage 2: Analysis ---
        profile = run_analysis_agent(intake_result)
        run.financial_profile = profile.model_dump(mode="json")

        # --- Stage 3: Scoring ---
        scores = run_scoring_agent(profile)
        run.scores = [s.model_dump(mode="json") for s in scores]

        # --- Stage 4: Advisory ---
        report = run_advisor_agent(profile, scores)
        run.advisory_report = report.model_dump(mode="json")

        run.status = PipelineStatus.completed
        run.completed_at = datetime.utcnow()

    except Exception as e:
        run.status = PipelineStatus.failed
        run.failed_at_stage = _infer_failed_stage(run)
        run.error_message = str(e)
        run.completed_at = datetime.utcnow()

    return run


def _infer_failed_stage(run: PipelineRun) -> str:
    if run.advisory_report is None and run.scores is not None:
        return "advisor"
    if run.scores is None and run.financial_profile is not None:
        return "scoring"
    if run.financial_profile is None and run.intake_result is not None:
        return "analysis"
    return "intake"
