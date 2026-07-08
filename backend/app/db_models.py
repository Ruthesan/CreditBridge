from sqlalchemy import Column, String, DateTime, Float, Integer, JSON, ForeignKey
from datetime import datetime
from app.database import Base


class Business(Base):
    """A business is also the login tenant — one owner per business for this v1."""
    __tablename__ = "businesses"

    business_id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    latest_statement_path = Column(String, nullable=True)
    last_scored_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PipelineRunRecord(Base):
    __tablename__ = "pipeline_runs"

    run_id = Column(String, primary_key=True)
    business_id = Column(String, ForeignKey("businesses.business_id"), nullable=False, index=True)
    status = Column(String, nullable=False)
    trigger_type = Column(String, nullable=False, default="manual")
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    failed_at_stage = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    intake_result = Column(JSON, nullable=True)
    financial_profile = Column(JSON, nullable=True)
    scores = Column(JSON, nullable=True)
    advisory_report = Column(JSON, nullable=True)
