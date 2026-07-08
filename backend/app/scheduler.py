"""
Day 5 — the "alarm clock" trigger. Re-runs the pipeline monthly for every
business with a statement on file, skipping businesses with no new upload
since their last score so we don't burn LLM calls producing duplicate
advisory reports on unchanged data.
"""
import os
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.db_models import Business, PipelineRunRecord
from app.models import PipelineStatus
from app.orchestrator import run_pipeline, new_run_id


def create_and_start_scheduler() -> AsyncIOScheduler:
    """
    Creates a fresh scheduler bound to the current event loop and starts it.
    Must not be a module-level singleton: AsyncIOScheduler binds to whatever
    event loop is running when .start() is called, so reusing one instance
    across app restarts (a worker reload, or repeated TestClient startup/
    shutdown cycles in tests) leaves it holding a reference to a closed
    loop and it fails the next time a job is scheduled.
    """
    new_scheduler = AsyncIOScheduler()
    new_scheduler.add_job(
        monthly_rescore_job,
        trigger=CronTrigger(day=1, hour=2, minute=0),
        id="monthly_rescore",
        replace_existing=True,
    )
    new_scheduler.start()
    return new_scheduler


async def monthly_rescore_job():
    db = SessionLocal()
    try:
        businesses = db.query(Business).filter(Business.latest_statement_path.isnot(None)).all()

        for business in businesses:
            if not business.latest_statement_path or not os.path.exists(business.latest_statement_path):
                continue

            # Skip-if-unchanged guard: a business that hasn't uploaded a new
            # statement since its last score doesn't need a duplicate rerun.
            statement_mtime = datetime.utcfromtimestamp(os.path.getmtime(business.latest_statement_path))
            if business.last_scored_at and statement_mtime <= business.last_scored_at:
                continue

            with open(business.latest_statement_path) as f:
                raw_text = f.read()

            run_id = new_run_id(business.business_id)
            record = PipelineRunRecord(
                run_id=run_id,
                business_id=business.business_id,
                status=PipelineStatus.in_progress,
                trigger_type="scheduled",
                started_at=datetime.utcnow(),
            )
            db.add(record)
            db.commit()

            result = await run_pipeline(raw_text, business.business_id, trigger_type="scheduled", run_id=run_id)

            record.status = result.status
            record.completed_at = result.completed_at
            record.failed_at_stage = result.failed_at_stage
            record.error_message = result.error_message
            record.intake_result = result.intake_result
            record.financial_profile = result.financial_profile
            record.scores = result.scores
            record.advisory_report = result.advisory_report

            if result.status == PipelineStatus.completed:
                business.last_scored_at = datetime.utcnow()

            db.commit()
    finally:
        db.close()
