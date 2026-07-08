import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.db_models import Business, PipelineRunRecord
from app.deps import get_current_business
from app.orchestrator import run_pipeline, new_run_id
from app.models import PipelineStatus
from app.agents.lender_profiles import LENDER_PROFILES

router = APIRouter(tags=["pipeline"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/webhook/statement-upload")
async def statement_uploaded(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    db: Session = Depends(get_db),
    current: Business = Depends(get_current_business),
):
    # Guard against overlapping runs for the same business
    active = (
        db.query(PipelineRunRecord)
        .filter(
            PipelineRunRecord.business_id == current.business_id,
            PipelineRunRecord.status.in_([PipelineStatus.pending, PipelineStatus.in_progress]),
        )
        .first()
    )
    if active:
        return {"run_id": active.run_id, "status": active.status}

    raw_bytes = await file.read()
    if len(raw_bytes) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            413,
            f"Statement is too large ({len(raw_bytes) / 1024:.0f} KB). "
            f"Max allowed is {settings.MAX_UPLOAD_BYTES / 1024:.0f} KB.",
        )
    raw_text = raw_bytes.decode("utf-8", errors="replace")

    # Persist the raw statement so a future scheduled rerun can reuse it
    statement_path = os.path.join(UPLOAD_DIR, f"{current.business_id}_latest.csv")
    with open(statement_path, "w") as f:
        f.write(raw_text)
    current.latest_statement_path = statement_path
    db.commit()

    run_id = new_run_id(current.business_id)
    record = PipelineRunRecord(
        run_id=run_id,
        business_id=current.business_id,
        status=PipelineStatus.pending,
        trigger_type="upload",
        started_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()

    background_tasks.add_task(_execute_and_persist, run_id, current.business_id, raw_text, "upload")

    return {"run_id": run_id, "status": "pending", "poll_at": f"/pipeline/status/{run_id}"}


async def _execute_and_persist(run_id: str, business_id: str, raw_text: str, trigger_type: str):
    from app.database import SessionLocal

    result = await run_pipeline(raw_text, business_id, trigger_type=trigger_type, run_id=run_id)
    db = SessionLocal()
    try:
        record = db.query(PipelineRunRecord).filter(PipelineRunRecord.run_id == run_id).first()
        if not record:
            return
        record.status = result.status
        record.completed_at = result.completed_at
        record.failed_at_stage = result.failed_at_stage
        record.error_message = result.error_message
        record.intake_result = result.intake_result
        record.financial_profile = result.financial_profile
        record.scores = result.scores
        record.advisory_report = result.advisory_report

        business = db.query(Business).filter(Business.business_id == business_id).first()
        if business and result.status == PipelineStatus.completed:
            business.last_scored_at = datetime.utcnow()

        db.commit()
    finally:
        db.close()


@router.get("/pipeline/status/{run_id}")
def get_run_status(run_id: str, db: Session = Depends(get_db), current: Business = Depends(get_current_business)):
    record = db.query(PipelineRunRecord).filter(PipelineRunRecord.run_id == run_id).first()
    if not record or record.business_id != current.business_id:
        raise HTTPException(404, "Run not found")

    return {
        "run_id": record.run_id,
        "status": record.status,
        "trigger_type": record.trigger_type,
        "started_at": record.started_at,
        "completed_at": record.completed_at,
        "failed_at_stage": record.failed_at_stage,
        "error_message": record.error_message,
        "intake_result": record.intake_result,
        "financial_profile": record.financial_profile,
        "scores": record.scores,
        "advisory_report": record.advisory_report,
    }


@router.get("/pipeline/runs")
def list_runs(db: Session = Depends(get_db), current: Business = Depends(get_current_business)):
    records = (
        db.query(PipelineRunRecord)
        .filter(PipelineRunRecord.business_id == current.business_id)
        .order_by(PipelineRunRecord.started_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "run_id": r.run_id,
            "status": r.status,
            "trigger_type": r.trigger_type,
            "started_at": r.started_at,
            "completed_at": r.completed_at,
        }
        for r in records
    ]


@router.get("/lenders")
def list_lenders():
    return [lp.model_dump() for lp in LENDER_PROFILES]
