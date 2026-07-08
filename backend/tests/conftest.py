"""
Sets test environment variables before anything imports the app, so the
app's module-level engine is created against a test database from the
start rather than the developer's creditbridge.db.
"""
import os

os.environ["LLM_MODE"] = "mock"
os.environ["ENV"] = "development"
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "sqlite:///./test_creditbridge.db")

import shutil
import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def clean_db():
    """Every test starts against empty tables, so tests don't leak state into each other."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client):
    """Registers a test business and returns ready-to-use auth headers."""
    res = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "business_name": "Test Traders"},
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def pytest_sessionfinish(session, exitstatus):
    """Remove the test database file and any uploads written during the run."""
    for path in ("test_creditbridge.db",):
        if os.path.exists(path):
            os.remove(path)
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    if os.path.isdir(uploads_dir):
        shutil.rmtree(uploads_dir, ignore_errors=True)
