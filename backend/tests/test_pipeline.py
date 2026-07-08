import io
import os

CLEAN_CSV = """Date,Description,Amount
2026-01-03,Sale to customer,45000
2026-01-05,Supplier payment,-20000
2026-01-10,Sale to customer,52000
2026-02-03,Sale to customer,47000
2026-02-05,Supplier payment,-21000
2026-02-10,Sale to customer,53000
"""

GARBAGE_CSV = """Date,Description,Amount
???,corrupted,n/a
,,
garbage,garbage,garbage
n/a,n/a,n/a
"""


def _upload(client, headers, content: str, filename: str = "statement.csv"):
    return client.post(
        "/webhook/statement-upload",
        headers=headers,
        files={"file": (filename, io.BytesIO(content.encode()), "text/csv")},
    )


def test_upload_requires_auth(client):
    res = client.post(
        "/webhook/statement-upload",
        files={"file": ("statement.csv", io.BytesIO(CLEAN_CSV.encode()), "text/csv")},
    )
    assert res.status_code == 401


def test_upload_returns_pending_run_id(client, auth_headers):
    res = _upload(client, auth_headers, CLEAN_CSV)
    assert res.status_code == 200
    body = res.json()
    assert body["run_id"]
    assert body["status"] == "pending"


def test_upload_then_status_reaches_completed(client, auth_headers):
    upload_res = _upload(client, auth_headers, CLEAN_CSV)
    run_id = upload_res.json()["run_id"]

    status_res = client.get(f"/pipeline/status/{run_id}", headers=auth_headers)
    assert status_res.status_code == 200
    body = status_res.json()
    assert body["status"] == "completed"
    assert body["financial_profile"] is not None
    assert body["scores"] is not None
    assert len(body["scores"]) == 3
    assert body["advisory_report"] is not None


def test_upload_with_mostly_garbage_data_fails_cleanly(client, auth_headers):
    upload_res = _upload(client, auth_headers, GARBAGE_CSV)
    run_id = upload_res.json()["run_id"]

    status_res = client.get(f"/pipeline/status/{run_id}", headers=auth_headers)
    body = status_res.json()
    assert body["status"] == "failed"
    # The halt guard fires between intake and analysis (statement quality too
    # poor to trust), so analysis is the stage that never got to run — this
    # matches the orchestrator's _infer_failed_stage logic and the frontend's
    # user-facing message for this exact scenario.
    assert body["failed_at_stage"] == "analysis"
    assert body["error_message"]


def test_status_for_unknown_run_id_is_404(client, auth_headers):
    res = client.get("/pipeline/status/run_does_not_exist", headers=auth_headers)
    assert res.status_code == 404


def test_business_cannot_view_another_businesss_run(client):
    biz_a = client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "password123", "business_name": "Business A"},
    ).json()
    biz_b = client.post(
        "/auth/register",
        json={"email": "b@example.com", "password": "password123", "business_name": "Business B"},
    ).json()

    headers_a = {"Authorization": f"Bearer {biz_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {biz_b['access_token']}"}

    upload_res = _upload(client, headers_a, CLEAN_CSV)
    run_id = upload_res.json()["run_id"]

    # Business A can see its own run
    assert client.get(f"/pipeline/status/{run_id}", headers=headers_a).status_code == 200
    # Business B cannot see Business A's run
    assert client.get(f"/pipeline/status/{run_id}", headers=headers_b).status_code == 404


def test_upload_rejects_oversized_file(client, auth_headers, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "MAX_UPLOAD_BYTES", 100)  # 100 bytes for this test

    res = _upload(client, auth_headers, CLEAN_CSV)  # CLEAN_CSV is well over 100 bytes
    assert res.status_code == 413


def test_overlapping_upload_for_same_business_returns_existing_run(client, auth_headers, monkeypatch):
    """
    A second upload while one is still processing should not spawn a
    duplicate pipeline run for the same business.
    """
    import app.routers.pipeline_router as pipeline_router
    from app.db_models import PipelineRunRecord
    from app.database import SessionLocal
    from app.models import PipelineStatus
    from datetime import datetime

    # Simulate an in-progress run already existing for this business
    db = SessionLocal()
    me = client.get("/auth/me", headers=auth_headers).json()
    db.add(PipelineRunRecord(
        run_id="run_existing_inprogress",
        business_id=me["business_id"],
        status=PipelineStatus.in_progress,
        trigger_type="upload",
        started_at=datetime.utcnow(),
    ))
    db.commit()
    db.close()

    res = _upload(client, auth_headers, CLEAN_CSV)
    assert res.status_code == 200
    assert res.json()["run_id"] == "run_existing_inprogress"


def test_list_runs_returns_only_current_business_runs(client, auth_headers):
    _upload(client, auth_headers, CLEAN_CSV)
    res = client.get("/pipeline/runs", headers=auth_headers)
    assert res.status_code == 200
    runs = res.json()
    assert len(runs) == 1


def test_lenders_endpoint_returns_three_profiles(client):
    res = client.get("/lenders")
    assert res.status_code == 200
    lenders = res.json()
    assert len(lenders) == 3
    ids = {l["lender_id"] for l in lenders}
    assert ids == {"mfi_community", "bank_tier1", "digital_lender"}
