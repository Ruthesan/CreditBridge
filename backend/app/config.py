"""
Central configuration. Everything environment-specific lives here so no other
module reads os.environ directly.

LLM_MODE controls whether agents call the real Anthropic API or a deterministic
mock. Default is "mock" so the app runs end-to-end with zero setup. Set
ANTHROPIC_API_KEY and LLM_MODE=live for real runs.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "CreditBridge"
    ENV: str = os.getenv("ENV", "development")  # "development" | "production"

    # Database
    # PostgreSQL is the only supported production database — a credit-scoring
    # fintech app needs proper concurrent write handling and real transaction
    # isolation that SQLite doesn't give you. The default below matches the
    # `db` service in docker-compose.yml; override via .env for a different
    # host/user/password (e.g. a managed Postgres instance in production).
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:Tinygirl800%23@localhost:5432/creditbridge"
    )

    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Uploads
    MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024)))  # 2 MB default

    # LLM
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY")
    LLM_MODE: str = os.getenv("LLM_MODE", "mock" if not os.getenv("ANTHROPIC_API_KEY") else "live")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")

    # Pipeline
    INTAKE_FLAG_RATIO_HALT: float = 0.4  # halt pipeline if more than this fraction of rows are flagged
    INTAKE_CONFIDENCE_THRESHOLD: float = 0.6  # rows below this confidence excluded from analysis math

    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()


def validate_production_settings() -> None:
    """
    Fail loudly at startup rather than silently running insecurely. A judgment
    call worth naming: it would be easier to just warn and continue, but a
    credit-scoring app booting in production with a public default secret
    is a real vulnerability, not a style issue — this should block startup,
    not log a line nobody reads.
    """
    if settings.ENV != "production":
        return
    problems = []
    if settings.JWT_SECRET == "dev-secret-change-me-in-production":
        problems.append("JWT_SECRET is still the default dev value — set a real secret via env var.")
    if settings.LLM_MODE == "mock":
        problems.append("LLM_MODE is 'mock' in production — set ANTHROPIC_API_KEY and LLM_MODE=live.")
    if settings.DATABASE_URL.startswith("sqlite"):
        problems.append("DATABASE_URL is SQLite in production — point it at a real Postgres instance.")
    if problems:
        raise RuntimeError(
            "Refusing to start in production with unsafe configuration:\n- " + "\n- ".join(problems)
        )
